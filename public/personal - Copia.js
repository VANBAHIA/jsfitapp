     // Configuração da API atualizada para usar arquivos
     const API_CONFIG = {
        baseUrl: 'https://jsfitapp.netlify.app/api',
        timeout: 5000,
        retries: 3
    };

    // API para comunicação com servidor usando arquivos JSON
    class WorkoutAPI {
        static async saveToServer(shareId, planData) {
            return new Promise(async (resolve, reject) => {
                try {
                    showApiStatus('Salvando no servidor...', 'loading');
                    
                    const response = await fetch(`${API_CONFIG.baseUrl}/workouts`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            id: shareId,
                            originalId: planData.originalId,
                            plan: planData.plan,
                            timestamp: planData.timestamp,
                            version: planData.version
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`Erro HTTP: ${response.status}`);
                    }

                    const result = await response.json();
                    
                    if (result.success) {
                        console.log(`[API] Plano ${shareId} salvo no servidor`);
                        resolve({
                            success: true,
                            shareId: shareId,
                            serverUrl: `${API_CONFIG.baseUrl}/workouts/${shareId}`,
                            timestamp: result.timestamp,
                            fileSize: result.fileSize
                        });
                    } else {
                        throw new Error('Resposta de servidor inválida');
                    }
                    
                } catch (error) {
                    console.error('Erro ao salvar no servidor:', error);
                    reject(error);
                }
            });
        }

        static async getFromServer(shareId) {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await fetch(`${API_CONFIG.baseUrl}/workouts/${shareId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`Erro HTTP: ${response.status}`);
                    }

                    const result = await response.json();
                    
                    if (result.success) {
                        console.log(`[API] Plano ${shareId} encontrado no servidor`);
                        resolve({
                            success: true,
                            data: result.data,
                            timestamp: result.data.timestamp
                        });
                    } else {
                        throw new Error('Plano não encontrado');
                    }
                    
                } catch (error) {
                    console.error('Erro ao buscar do servidor:', error);
                    reject(error);
                }
            });
        }

        static async checkServerHealth() {
            try {
                const response = await fetch(`${API_CONFIG.baseUrl}/health`);
                const data = await response.json();
                return data.status === 'online';
            } catch (error) {
                console.error('Erro ao verificar servidor:', error);
                return false;
            }
        }
    }

    // Estado da aplicação
    let appState = {
        workoutPlans: [],
        currentView: 'home',
        selectedPlan: null,
        selectedWorkout: null,
        editingExercise: null,
        viewHistory: [],
        serverOnline: false
    };

    // Templates
    const newPlanTemplate = {
        id: Date.now(),
        shareId: null,
        nome: "Novo Plano",
        dias: 3,
        dataInicio: new Date().toISOString().split('T')[0],
        dataFim: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        perfil: {
            idade: 30,
            altura: "1,70m",
            peso: "70kg",
            porte: "medio",
            objetivo: "Condicionamento geral"
        },
        treinos: [],
        observacoes: {
            frequencia: "3x por semana",
            progressao: "Aumente a carga gradualmente",
            descanso: "60-90 segundos entre séries",
            hidratacao: "Mantenha-se hidratado",
            adaptacao: "Primeiras semanas com cargas leves",
            consulta: "Consulte um profissional"
        }
    };

    const newWorkoutTemplate = {
        id: "",
        nome: "Novo Treino",
        foco: "Descrição do foco",
        exercicios: [],
        concluido: false,
        execucoes: 0
    };

    const newExerciseTemplate = {
        id: Date.now(),
        nome: "Novo Exercício",
        descricao: "Descrição do exercício",
        series: 3,
        repeticoes: "12",
        carga: "20kg",
        concluido: false
    };

    // Sistema de Compartilhamento
    function generateShareId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    function copyShareId() {
        if (!appState.selectedPlan || !appState.selectedPlan.shareId) {
            alert('Nenhum ID de compartilhamento disponível');
            return;
        }

        const shareId = appState.selectedPlan.shareId;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareId).then(() => {
                const button = event.target.closest('button');
                const originalText = button.innerHTML;
                button.innerHTML = '<span>✅</span>ID Copiado!';
                button.style.background = '#34c759';
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.background = '';
                }, 2000);
                
                console.log(`ID ${shareId} copiado para área de transferência`);
            }).catch(err => {
                fallbackCopyTextToClipboard(shareId);
            });
        } else {
            fallbackCopyTextToClipboard(shareId);
        }
    }

    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                alert(`ID ${text} copiado para área de transferência!`);
            } else {
                alert(`ID de compartilhamento: ${text}\n\nCopie este ID manualmente`);
            }
        } catch (err) {
            alert(`ID de compartilhamento: ${text}\n\nCopie este ID manualmente`);
        }
        
        document.body.removeChild(textArea);
    }

    async function shareCurrentPlan() {
        if (!appState.selectedPlan) return;

        showApiStatus('Verificando servidor...', 'loading');

        try {
            // Verificar se servidor está online
            const serverOnline = await WorkoutAPI.checkServerHealth();
            appState.serverOnline = serverOnline;

            if (!serverOnline) {
                showApiStatus('⚠️ Servidor offline - salvando apenas localmente', 'error');
            }

            // Gerar ID se não existir
            if (!appState.selectedPlan.shareId) {
                appState.selectedPlan.shareId = generateShareId();
                
                const planIndex = appState.workoutPlans.findIndex(p => p.id === appState.selectedPlan.id);
                if (planIndex >= 0) {
                    appState.workoutPlans[planIndex] = appState.selectedPlan;
                }
                
                saveToLocalStorage();
            }

            // Preparar dados para envio
            const planDataForServer = {
                id: appState.selectedPlan.shareId,
                originalId: appState.selectedPlan.id,
                plan: {
                    ...appState.selectedPlan,
                    treinos: appState.selectedPlan.treinos.map(treino => ({
                        ...treino,
                        concluido: false,
                        execucoes: 0,
                        exercicios: treino.exercicios.map(ex => ({
                            ...ex,
                            concluido: false
                        }))
                    }))
                },
                timestamp: new Date().toISOString(),
                version: "1.0"
            };

            if (serverOnline) {
                // Tentar salvar no servidor
                showApiStatus('Enviando para servidor...', 'loading');
                
                const serverResponse = await WorkoutAPI.saveToServer(
                    appState.selectedPlan.shareId, 
                    planDataForServer
                );

                if (serverResponse.success) {
                    saveSharedPlan(appState.selectedPlan);
                    
                    showApiStatus(
                        `✅ Plano salvo no servidor! ID: ${appState.selectedPlan.shareId}`, 
                        'success'
                    );
                    
                    document.getElementById('copyIdSection').classList.remove('hidden');
                }
            } else {
                // Salvar apenas localmente
                saveSharedPlan(appState.selectedPlan);
                
                showApiStatus(
                    `⚠️ Servidor offline. ID salvo localmente: ${appState.selectedPlan.shareId}`, 
                    'error'
                );
                
                document.getElementById('copyIdSection').classList.remove('hidden');
            }

            renderPlanDetails();

        } catch (error) {
            console.error('Erro ao compartilhar plano:', error);
            
            if (appState.selectedPlan.shareId) {
                saveSharedPlan(appState.selectedPlan);
            }
            
            showApiStatus(
                `❌ Erro no servidor. ID salvo localmente: ${appState.selectedPlan.shareId}`, 
                'error'
            );
            
            document.getElementById('copyIdSection').classList.remove('hidden');
            renderPlanDetails();
        }
    }

    function showApiStatus(message, type) {
        const apiStatus = document.getElementById('apiStatus');
        const storageStatus = document.getElementById('storageStatus');
        
        apiStatus.textContent = message;
        apiStatus.className = `api-status ${type}`;
        apiStatus.classList.remove('hidden');
        
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                apiStatus.classList.add('hidden');
            }, type === 'success' ? 3000 : 5000);
        }
        
        if (type === 'success') {
            storageStatus.textContent = '✅ Plano disponível no servidor';
            storageStatus.className = 'api-status success';
        } else if (type === 'error') {
            storageStatus.textContent = '⚠️ Problema na sincronização com servidor';
            storageStatus.className = 'api-status error';
        }
    }

    function saveSharedPlan(plan) {
        try {
            const sharedData = {
                id: plan.shareId,
                originalId: plan.id,
                plan: {
                    ...plan,
                    treinos: plan.treinos.map(treino => ({
                        ...treino,
                        concluido: false,
                        execucoes: 0,
                        exercicios: treino.exercicios.map(ex => ({
                            ...ex,
                            concluido: false
                        }))
                    }))
                },
                timestamp: new Date().toISOString(),
                version: "1.0"
            };

            const sharedPlans = getSharedPlans();
            sharedPlans[plan.shareId] = sharedData;
            localStorage.setItem('sharedWorkoutPlans', JSON.stringify(sharedPlans));

            console.log('Plano compartilhado salvo localmente:', sharedData);
        } catch (error) {
            console.error('Erro ao salvar plano compartilhado:', error);
            alert('Erro ao gerar ID de compartilhamento');
        }
    }

    function getSharedPlans() {
        try {
            const stored = localStorage.getItem('sharedWorkoutPlans');
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Erro ao carregar planos compartilhados:', error);
            return {};
        }
    }

    async function updateSharedPlan(plan) {
        if (plan.shareId && appState.serverOnline) {
            try {
                showApiStatus('Sincronizando alterações...', 'loading');
                
                const planDataForServer = {
                    id: plan.shareId,
                    originalId: plan.id,
                    plan: {
                        ...plan,
                        treinos: plan.treinos.map(treino => ({
                            ...treino,
                            concluido: false,
                            execucoes: 0,
                            exercicios: treino.exercicios.map(ex => ({
                                ...ex,
                                concluido: false
                            }))
                        }))
                    },
                    timestamp: new Date().toISOString(),
                    version: "1.0"
                };

                await WorkoutAPI.saveToServer(plan.shareId, planDataForServer);
                showApiStatus('✅ Alterações sincronizadas', 'success');
                
            } catch (error) {
                console.error('Erro ao sincronizar com servidor:', error);
                showApiStatus('⚠️ Erro na sincronização, salvo localmente', 'error');
            }
            
            saveSharedPlan(plan);
        }
    }

    // Inicialização
    document.addEventListener('DOMContentLoaded', async function() {
        loadFromLocalStorage();
        
        // Verificar servidor
        appState.serverOnline = await WorkoutAPI.checkServerHealth();
        
        renderCurrentView();
        
        // Configurar import
        document.getElementById('importInput').addEventListener('change', importJSON);
        
        // Prevenir zoom no iOS
        document.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(e) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    });

    // Navegação
    function showView(viewName) {
        appState.viewHistory.push(appState.currentView);
        appState.currentView = viewName;
        renderCurrentView();
    }

    function goBack() {
        if (appState.viewHistory.length > 0) {
            appState.currentView = appState.viewHistory.pop();
            renderCurrentView();
        }
    }

    function renderCurrentView() {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.add('hidden');
        });

        const currentViewElement = document.getElementById(appState.currentView + 'View');
        if (currentViewElement) {
            currentViewElement.classList.remove('hidden');
            currentViewElement.classList.add('slide-enter');
            
            setTimeout(() => {
                currentViewElement.classList.remove('slide-enter');
            }, 300);
        }

        switch (appState.currentView) {
            case 'home':
                renderPlansList();
                break;
            case 'editPlan':
                renderEditPlan();
                break;
            case 'planDetails':
                renderPlanDetails();
                break;
            case 'editWorkout':
                renderEditWorkout();
                break;
            case 'workoutDetails':
                renderWorkoutDetails();
                break;
            case 'editExercise':
                renderEditExercise();
                break;
        }
    }

    // CORREÇÃO: Funções faltando adicionadas
    function renderPlansList() {
        const container = document.getElementById('plansList');
        
        if (appState.workoutPlans.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🏋️‍♂️</div>
                    <div class="empty-title">Nenhum plano criado</div>
                    <div class="empty-subtitle">Crie seu primeiro plano de treino para começar</div>
                </div>
            `;
            return;
        }

        container.innerHTML = appState.workoutPlans.map(plan => `
            <div class="card plan-card">
                <div class="plan-header">
                    <div>
                        <div class="plan-title">${plan.nome}</div>
                        <div class="plan-subtitle">${plan.dias} dias • ${plan.treinos.length} treinos</div>
                        <div class="plan-date">${plan.dataInicio} até ${plan.dataFim}</div>
                        ${plan.shareId ? `<div class="plan-date" style="color: #34c759; font-weight: 600;">🔗 ID: ${plan.shareId}</div>` : ''}
                    </div>
                    <div class="plan-actions">
                        <button class="action-btn" onclick="duplicatePlan(${plan.id})" title="Duplicar">📋</button>
                        <button class="action-btn" onclick="exportJSON(${plan.id})" title="Exportar">⬇️</button>
                        <button class="action-btn success" onclick="editPlan(${plan.id})" title="Editar">✏️</button>
                        <button class="action-btn danger" onclick="deletePlan(${plan.id})" title="Excluir">🗑️</button>
                    </div>
                </div>
                
                <div class="workout-preview">
                    ${plan.treinos.slice(0, 4).map(treino => `
                        <div class="workout-item">
                            <div class="workout-name">${treino.nome}</div>
                            <div class="workout-count">${treino.exercicios.length} exercícios</div>
                        </div>
                    `).join('')}
                    ${plan.treinos.length > 4 ? `
                        <div class="workout-item" style="text-align: center; color: #8e8e93;">
                            +${plan.treinos.length - 4} treinos
                        </div>
                    ` : ''}
                </div>
                
                <button class="btn-primary" style="margin-top: 12px;" onclick="viewPlanDetails(${plan.id})">
                    Ver Detalhes
                </button>
            </div>
        `).join('');
    }

    // CORREÇÃO: Função deletePlan adicionada
    function deletePlan(planId) {
        if (!confirm('Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.')) {
            return;
        }

        const planIndex = appState.workoutPlans.findIndex(p => p.id === planId);
        if (planIndex >= 0) {
            const plan = appState.workoutPlans[planIndex];
            
            // Remover plano compartilhado se existir
            if (plan.shareId) {
                const sharedPlans = getSharedPlans();
                delete sharedPlans[plan.shareId];
                localStorage.setItem('sharedWorkoutPlans', JSON.stringify(sharedPlans));
            }
            
            appState.workoutPlans.splice(planIndex, 1);
            saveToLocalStorage();
            renderPlansList();
        }
    }

    // CORREÇÃO: Função duplicatePlan adicionada
    function duplicatePlan(planId) {
        const originalPlan = appState.workoutPlans.find(p => p.id === planId);
        if (!originalPlan) return;

        const duplicatedPlan = {
            ...originalPlan,
            id: Date.now(),
            shareId: null,
            nome: `${originalPlan.nome} - Cópia`,
            treinos: originalPlan.treinos.map(treino => ({
                ...treino,
                exercicios: treino.exercicios.map(ex => ({
                    ...ex,
                    id: Date.now() + Math.random()
                }))
            }))
        };

        appState.workoutPlans.push(duplicatedPlan);
        saveToLocalStorage();
        renderPlansList();
        
        alert('Plano duplicado com sucesso!');
    }

    // CORREÇÃO: Função exportJSON adicionada
    function exportJSON(planId) {
        const plan = appState.workoutPlans.find(p => p.id === planId);
        if (!plan) return;

        try {
            const dataStr = JSON.stringify({
                version: "1.0",
                exported: new Date().toISOString(),
                plan: plan
            }, null, 2);
            
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = `plano-treino-${plan.nome.toLowerCase().replace(/\s+/g, '-')}.json`;
            
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            URL.revokeObjectURL(url);
            
            alert('Plano exportado com sucesso!');
            
        } catch (error) {
            console.error('Erro ao exportar plano:', error);
            alert('Erro ao exportar plano. Tente novamente.');
        }
    }

  // MultipleFiles/personal.js

// ... (código anterior)

    // CORREÇÃO: Função importJSON adicionada e modificada para compatibilidade
    function importJSON(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                let plansToImport = [];

                // Check if it's the 'aluno' app's exampleData structure (with 'planos' array)
                if (data.planos && Array.isArray(data.planos)) {
                    plansToImport = data.planos.map(plan => ({
                        ...plan,
                        id: Date.now() + Math.random(), // Generate new unique ID
                        shareId: null, // Reset shareId for imported plans
                        nome: `${plan.nome} - Importado (Aluno)` // Add suffix for clarity
                    }));
                    alert(`${plansToImport.length} plano(s) importado(s) do formato Aluno com sucesso!`);
                } 
                // Check if it's the 'personal' app's exported structure (with 'plan' object)
                else if (data.plan) {
                    const importedPlan = {
                        ...data.plan,
                        id: Date.now() + Math.random(), // Generate new unique ID
                        shareId: null, // Reset shareId for imported plans
                        nome: `${data.plan.nome} - Importado (Personal)` // Add suffix for clarity
                    };
                    plansToImport.push(importedPlan);
                    alert('1 plano importado do formato Personal com sucesso!');
                } else {
                    alert('Arquivo JSON inválido. Formato não reconhecido. Esperado "planos" ou "plan".');
                    return;
                }

                appState.workoutPlans.push(...plansToImport);
                saveToLocalStorage();
                renderPlansList();
                
            } catch (error) {
                console.error('Erro ao importar arquivo JSON:', error);
                alert('Erro ao importar arquivo JSON. Verifique se o formato está correto e é um JSON válido.');
            }
        };
        
        reader.readAsText(file);
        event.target.value = '';
    }




    function renderPlanDetails() {
        const title = document.getElementById('planDetailsTitle');
        const container = document.getElementById('workoutsList');
        const shareIdCard = document.getElementById('shareIdCard');
        const shareIdValue = document.getElementById('shareIdValue');
        const storageStatus = document.getElementById('storageStatus');
        const copyIdSection = document.getElementById('copyIdSection');
        
        if (appState.selectedPlan) {
            title.textContent = appState.selectedPlan.nome;

            if (appState.selectedPlan.shareId) {
                shareIdCard.classList.remove('hidden');
                shareIdValue.textContent = appState.selectedPlan.shareId;
                copyIdSection.classList.remove('hidden');
                
                const localShared = getSharedPlans()[appState.selectedPlan.shareId];
                
                if (appState.serverOnline && localShared) {
                    storageStatus.textContent = `✅ Plano disponível no servidor (ID: ${appState.selectedPlan.shareId})`;
                    storageStatus.className = 'api-status success';
                } else if (localShared) {
                    storageStatus.textContent = `⚠️ Plano salvo localmente, servidor offline`;
                    storageStatus.className = 'api-status error';
                } else {
                    storageStatus.textContent = `⚠️ ID gerado mas não sincronizado`;
                    storageStatus.className = 'api-status error';
                }
            } else {
                shareIdCard.classList.add('hidden');
                copyIdSection.classList.add('hidden');
                storageStatus.textContent = "Plano não compartilhado";
                storageStatus.className = 'api-status';
            }
            
            if (appState.selectedPlan.treinos.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">💪</div>
                        <div class="empty-title">Nenhum treino adicionado</div>
                        <div class="empty-subtitle">Adicione treinos para completar seu plano</div>
                    </div>
                `;
                return;
            }

            container.innerHTML = appState.selectedPlan.treinos.map(treino => `
                <div class="card">
                    <div class="plan-header">
                        <div>
                            <div class="plan-title">${treino.nome}</div>
                            <div class="plan-subtitle">${treino.foco}</div>
                            <div class="plan-date">${treino.exercicios.length} exercícios</div>
                        </div>
                        <div class="plan-actions">
                            <button class="action-btn" onclick="viewWorkoutDetails('${treino.id}')" title="Ver exercícios">👁️</button>
                            <button class="action-btn success" onclick="editWorkout('${treino.id}')" title="Editar">✏️</button>
                            <button class="action-btn danger" onclick="deleteWorkout('${treino.id}')" title="Excluir">🗑️</button>
                        </div>
                    </div>
                    
                    <div class="workout-preview">
                        ${treino.exercicios.slice(0, 4).map(exercicio => `
                            <div class="workout-item">
                                <div class="workout-name">${exercicio.nome}</div>
                                <div class="workout-count">${exercicio.series}x${exercicio.repeticoes} • ${exercicio.carga}</div>
                            </div>
                        `).join('')}
                        ${treino.exercicios.length > 4 ? `
                            <div class="workout-item" style="text-align: center; color: #8e8e93;">
                                +${treino.exercicios.length - 4} exercícios
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        }
    }

    function renderEditPlan() {
        const form = document.getElementById('planForm');
        const title = document.getElementById('editPlanTitle');
        
        if (appState.selectedPlan) {
            title.textContent = appState.selectedPlan.nome === "Novo Plano" ? 'Criar Plano' : 'Editar Plano';
            
            form.nome.value = appState.selectedPlan.nome || '';
            form.dias.value = appState.selectedPlan.dias || 3;
            form.dataInicio.value = appState.selectedPlan.dataInicio || '';
            form.dataFim.value = appState.selectedPlan.dataFim || '';
            form.idade.value = appState.selectedPlan.perfil?.idade || 30;
            form.altura.value = appState.selectedPlan.perfil?.altura || '1,70m';
            form.peso.value = appState.selectedPlan.perfil?.peso || '70kg';
            form.porte.value = appState.selectedPlan.perfil?.porte || 'medio';
            form.objetivo.value = appState.selectedPlan.perfil?.objetivo || 'Condicionamento geral';
            form.frequencia.value = appState.selectedPlan.observacoes?.frequencia || '3x por semana';
            form.progressao.value = appState.selectedPlan.observacoes?.progressao || 'Aumente a carga gradualmente';
            form.descanso.value = appState.selectedPlan.observacoes?.descanso || '60-90 segundos entre séries';
        }
    }

    function renderEditWorkout() {
        const form = document.getElementById('workoutForm');
        const title = document.getElementById('editWorkoutTitle');
        
        if (appState.selectedWorkout) {
            title.textContent = appState.selectedWorkout.nome === "Novo Treino" ? 'Criar Treino' : 'Editar Treino';
            
            form.id.value = appState.selectedWorkout.id || '';
            form.nome.value = appState.selectedWorkout.nome || '';
            form.foco.value = appState.selectedWorkout.foco || '';
        }
    }

    function renderWorkoutDetails() {
        const title = document.getElementById('workoutDetailsTitle');
        const container = document.getElementById('exercisesList');
        
        if (appState.selectedWorkout) {
            title.textContent = `${appState.selectedWorkout.nome}`;
            
            if (appState.selectedWorkout.exercicios.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">💪</div>
                        <div class="empty-title">Nenhum exercício adicionado</div>
                        <div class="empty-subtitle">Adicione exercícios para completar este treino</div>
                    </div>
                `;
                return;
            }

            container.innerHTML = appState.selectedWorkout.exercicios.map(exercicio => `
                <div class="exercise-item">
                    <div class="exercise-info">
                        <div class="exercise-name">${exercicio.nome}</div>
                        <div class="exercise-details">
                            <span>Séries: ${exercicio.series}</span>
                            <span>Rep: ${exercicio.repeticoes}</span>
                            <span>Carga: ${exercicio.carga}</span>
                        </div>
                        ${exercicio.descricao ? `<div style="margin-top: 8px; font-size: 12px; color: #8e8e93;">${exercicio.descricao}</div>` : ''}
                    </div>
                    <div class="exercise-actions">
                        <button class="action-btn success" onclick="editExercise(${exercicio.id})" title="Editar">✏️</button>
                        <button class="action-btn danger" onclick="deleteExercise(${exercicio.id})" title="Excluir">🗑️</button>
                    </div>
                </div>
            `).join('');
        }
    }

    function renderEditExercise() {
        const form = document.getElementById('exerciseForm');
        const title = document.getElementById('editExerciseTitle');
        
        if (appState.editingExercise) {
            title.textContent = appState.editingExercise.nome === "Novo Exercício" ? 'Criar Exercício' : 'Editar Exercício';
            
            form.nome.value = appState.editingExercise.nome || '';
            form.descricao.value = appState.editingExercise.descricao || '';
            form.series.value = appState.editingExercise.series || 3;
            form.repeticoes.value = appState.editingExercise.repeticoes || '12';
            form.carga.value = appState.editingExercise.carga || '20kg';
        }
    }

    // Funções principais de CRUD
    function createNewPlan() {
        appState.selectedPlan = { ...newPlanTemplate, id: Date.now() };
        showView('editPlan');
    }

    function editPlan(planId) {
        appState.selectedPlan = appState.workoutPlans.find(p => p.id === planId);
        showView('editPlan');
    }

    function viewPlanDetails(planId) {
        appState.selectedPlan = appState.workoutPlans.find(p => p.id === planId);
        showView('planDetails');
    }

    function editCurrentPlan() {
        showView('editPlan');
    }

    function createNewWorkout() {
        appState.selectedWorkout = { ...newWorkoutTemplate, id: `${appState.selectedPlan.treinos.length + 1}` };
        showView('editWorkout');
    }

    function editWorkout(workoutId) {
        appState.selectedWorkout = appState.selectedPlan.treinos.find(w => w.id === workoutId);
        showView('editWorkout');
    }

    function viewWorkoutDetails(workoutId) {
        appState.selectedWorkout = appState.selectedPlan.treinos.find(w => w.id === workoutId);
        showView('workoutDetails');
    }

    function editCurrentWorkout() {
        showView('editWorkout');
    }

    function createNewExercise() {
        appState.editingExercise = { ...newExerciseTemplate, id: Date.now() };
        showView('editExercise');
    }

    function editExercise(exerciseId) {
        appState.editingExercise = appState.selectedWorkout.exercicios.find(e => e.id === exerciseId);
        showView('editExercise');
    }

    function deleteWorkout(workoutId) {
        if (!confirm('Tem certeza que deseja excluir este treino?')) return;
        
        if (!appState.selectedPlan || !appState.selectedPlan.treinos) {
            console.error('Nenhum plano selecionado ou treinos não encontrados');
            return;
        }
        
        console.log('Tentando excluir treino:', workoutId);
        console.log('Treinos disponíveis:', appState.selectedPlan.treinos.map(t => t.id));
        
        const workoutIndex = appState.selectedPlan.treinos.findIndex(w => w.id == workoutId); // Usando == para comparação flexível
        
        if (workoutIndex >= 0) {
            const removedWorkout = appState.selectedPlan.treinos.splice(workoutIndex, 1);
            console.log('Treino removido:', removedWorkout);
            
            // Atualizar no array principal
            const planIndex = appState.workoutPlans.findIndex(p => p.id === appState.selectedPlan.id);
            if (planIndex >= 0) {
                appState.workoutPlans[planIndex] = { ...appState.selectedPlan };
            }
            
            // Sincronizar com servidor se necessário
            updateSharedPlan(appState.selectedPlan);
            
            // Salvar no localStorage
            saveToLocalStorage();
            
            // Re-renderizar a tela
            renderPlanDetails();
            
            alert('Treino excluído com sucesso!');
        } else {
            console.error('Treino não encontrado:', workoutId);
            alert('Erro: Treino não encontrado.');
        }
    }

    function deleteExercise(exerciseId) {
        if (!confirm('Tem certeza que deseja excluir este exercício?')) return;
        
        if (!appState.selectedWorkout || !appState.selectedWorkout.exercicios) {
            console.error('Nenhum treino selecionado ou exercícios não encontrados');
            return;
        }
        
        console.log('Tentando excluir exercício:', exerciseId);
        console.log('Exercícios disponíveis:', appState.selectedWorkout.exercicios.map(e => e.id));
        
        const exerciseIndex = appState.selectedWorkout.exercicios.findIndex(e => e.id == exerciseId); // Usando == para comparação flexível
        
        if (exerciseIndex >= 0) {
            const removedExercise = appState.selectedWorkout.exercicios.splice(exerciseIndex, 1);
            console.log('Exercício removido:', removedExercise);
            
            // Atualizar nos arrays principais
            const planIndex = appState.workoutPlans.findIndex(p => p.id === appState.selectedPlan.id);
            if (planIndex >= 0) {
                const workoutIndex = appState.workoutPlans[planIndex].treinos.findIndex(w => w.id == appState.selectedWorkout.id);
                if (workoutIndex >= 0) {
                    appState.workoutPlans[planIndex].treinos[workoutIndex] = { ...appState.selectedWorkout };
                    appState.selectedPlan = appState.workoutPlans[planIndex]; // Sincronizar selectedPlan
                }
            }
            
            // Sincronizar com servidor se necessário
            updateSharedPlan(appState.selectedPlan);
            
            // Salvar no localStorage
            saveToLocalStorage();
            
            // Re-renderizar a tela
            renderWorkoutDetails();
            
            alert('Exercício excluído com sucesso!');
        } else {
            console.error('Exercício não encontrado:', exerciseId);
            alert('Erro: Exercício não encontrado.');
        }
    }

    // Funções de salvamento
    function savePlan() {
        const form = document.getElementById('planForm');
        const formData = new FormData(form);
        
        const updatedPlan = {
            ...appState.selectedPlan,
            nome: formData.get('nome'),
            dias: parseInt(formData.get('dias')),
            dataInicio: formData.get('dataInicio'),
            dataFim: formData.get('dataFim'),
            perfil: {
                idade: parseInt(formData.get('idade')),
                altura: formData.get('altura'),
                peso: formData.get('peso'),
                porte: formData.get('porte'),
                objetivo: formData.get('objetivo')
            },
            observacoes: {
                ...appState.selectedPlan.observacoes,
                frequencia: formData.get('frequencia'),
                progressao: formData.get('progressao'),
                descanso: formData.get('descanso')
            }
        };

        const existingIndex = appState.workoutPlans.findIndex(p => p.id === updatedPlan.id);
        if (existingIndex >= 0) {
            appState.workoutPlans[existingIndex] = updatedPlan;
        } else {
            appState.workoutPlans.push(updatedPlan);
        }

        appState.selectedPlan = updatedPlan;
        
        updateSharedPlan(updatedPlan);
        
        saveToLocalStorage();
        showView('planDetails');
    }

    function saveWorkout() {
        const form = document.getElementById('workoutForm');
        const formData = new FormData(form);
        
        const updatedWorkout = {
            ...appState.selectedWorkout,
            id: formData.get('id'),
            nome: formData.get('nome'),
            foco: formData.get('foco')
        };

        const existingIndex = appState.selectedPlan.treinos.findIndex(w => w.id === appState.selectedWorkout.id);
        if (existingIndex >= 0) {
            appState.selectedPlan.treinos[existingIndex] = updatedWorkout;
        } else {
            appState.selectedPlan.treinos.push(updatedWorkout);
        }

        appState.selectedWorkout = updatedWorkout;
        
        const planIndex = appState.workoutPlans.findIndex(p => p.id === appState.selectedPlan.id);
        if (planIndex >= 0) {
            appState.workoutPlans[planIndex] = appState.selectedPlan;
        }
        
        updateSharedPlan(appState.selectedPlan);
        saveToLocalStorage();
        showView('workoutDetails');
    }

    function saveExercise() {
        const form = document.getElementById('exerciseForm');
        const formData = new FormData(form);
        
        const updatedExercise = {
            ...appState.editingExercise,
            nome: formData.get('nome'),
            descricao: formData.get('descricao'),
            series: parseInt(formData.get('series')),
            repeticoes: formData.get('repeticoes'),
            carga: formData.get('carga')
        };

        const existingIndex = appState.selectedWorkout.exercicios.findIndex(e => e.id === appState.editingExercise.id);
        if (existingIndex >= 0) {
            appState.selectedWorkout.exercicios[existingIndex] = updatedExercise;
        } else {
            appState.selectedWorkout.exercicios.push(updatedExercise);
        }
        
        const planIndex = appState.workoutPlans.findIndex(p => p.id === appState.selectedPlan.id);
        if (planIndex >= 0) {
            const workoutIndex = appState.workoutPlans[planIndex].treinos.findIndex(w => w.id === appState.selectedWorkout.id);
            if (workoutIndex >= 0) {
                appState.workoutPlans[planIndex].treinos[workoutIndex] = appState.selectedWorkout;
            }
        }
        
        updateSharedPlan(appState.selectedPlan);
        saveToLocalStorage();
        showView('workoutDetails');
    }

    function saveToLocalStorage() {
        try {
            localStorage.setItem('workoutPlansPersonal', JSON.stringify(appState.workoutPlans));
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
        }
    }

    function loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('workoutPlansPersonal');
            if (saved) {
                appState.workoutPlans = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Erro ao carregar do localStorage:', error);
            appState.workoutPlans = [];
        }
    }