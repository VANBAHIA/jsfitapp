// aluno.js - Sistema do Aluno JS Fit App - Versão Otimizada

// Estado global da aplicação
let workoutPlans = [];
let currentPlan = null;
let currentWorkout = null;
let activeWorkoutSessions = {};
let editingWeight = {};
let serverConnection = {
    isOnline: false,
    lastCheck: null,
    retryCount: 0
};

// Configuração da API
const API_CONFIG = {
    baseUrl: 'https://jsfitapp.netlify.app/api',
    timeout: 8000,
    retries: 3,
    endpoints: {
        getWorkout: '/workouts',
        health: '/health'
    }
};

// =============================================================================
// API DE COMUNICAÇÃO COM SERVIDOR
// =============================================================================

class WorkoutServerAPI {
    static async checkServerHealth() {
        try {
            updateConnectionStatus('loading');
            const response = await this.makeRequest(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.health}`);
            serverConnection.isOnline = response.ok;
            serverConnection.lastCheck = new Date();
            updateConnectionStatus(serverConnection.isOnline ? 'online' : 'offline');
            return serverConnection.isOnline;
        } catch (error) {
            console.error('Erro ao verificar servidor:', error);
            serverConnection.isOnline = false;
            updateConnectionStatus('offline');
            return false;
        }
    }

    static async getWorkoutById(shareId) {
        try {
            if (!serverConnection.isOnline) {
                throw new Error('Servidor offline');
            }

            const response = await this.makeRequest(
                `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.getWorkout}/${shareId}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Plano não encontrado no servidor');
                } else if (response.status === 500) {
                    throw new Error('Erro interno do servidor');
                } else {
                    throw new Error(`Erro do servidor: ${response.status}`);
                }
            }

            const data = await response.json();
            return {
                success: true,
                data: data,
                source: 'server'
            };

        } catch (error) {
            console.error('Erro ao buscar do servidor:', error);
            return await this.getFromLocalFallback(shareId);
        }
    }

    static async getFromLocalFallback(shareId) {
        try {
            const sharedPlans = getSharedPlans();
            const localData = sharedPlans[shareId.toUpperCase()];
            
            if (localData) {
                console.log(`[FALLBACK] Plano ${shareId} encontrado localmente`);
                return {
                    success: true,
                    data: localData,
                    source: 'local'
                };
            } else {
                throw new Error('Plano não encontrado nem no servidor nem localmente');
            }
        } catch (error) {
            console.error('Erro no fallback local:', error);
            throw error;
        }
    }

    static async makeRequest(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Timeout na conexão com servidor');
            }
            throw error;
        }
    }
}

// =============================================================================
// SISTEMA DE IMPORTAÇÃO
// =============================================================================

function getSharedPlans() {
    try {
        const stored = localStorage.getItem('sharedWorkoutPlans');
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error('Erro ao carregar planos compartilhados:', error);
        return {};
    }
}

async function importPlanById(shareId) {
    try {
        const existingPlan = workoutPlans.find(p => p.originalShareId === shareId.toUpperCase());
        if (existingPlan) {
            throw new Error('Este plano já foi importado');
        }

        const serverResult = await WorkoutServerAPI.getWorkoutById(shareId);
        
        let planData;
        let source = serverResult.source;

        if (serverResult.success) {
            planData = serverResult.data;
            
            if (source === 'server') {
                const sharedPlans = getSharedPlans();
                sharedPlans[shareId.toUpperCase()] = planData;
                localStorage.setItem('sharedWorkoutPlans', JSON.stringify(sharedPlans));
                console.log('Plano salvo no cache local');
            }
        } else {
            throw new Error('Falha ao buscar plano');
        }

        // Processar dados do plano
        const importedPlan = {
            ...planData.plan,
            id: Date.now() + Math.random(),
            originalShareId: shareId.toUpperCase(),
            importedAt: new Date().toISOString(),
            importedFrom: source,
            execucoesPlanCompleto: 0,
            treinos: planData.plan.treinos.map(treino => ({
                ...treino,
                concluido: false,
                execucoes: 0,
                exercicios: treino.exercicios.map(ex => ({
                    ...ex,
                    concluido: false,
                    currentCarga: ex.carga || ex.currentCarga
                }))
            }))
        };

        return {
            plan: importedPlan,
            source: source
        };

    } catch (error) {
        console.error('Erro ao importar plano:', error);
        throw error;
    }
}

// =============================================================================
// FUNÇÕES UTILITÁRIAS
// =============================================================================

function formatDate(dateString) {
    if (!dateString) return 'Não definido';
    return new Date(dateString).toLocaleDateString('pt-BR');
}

function calculateAge(birthDate) {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

function formatCPF(cpf) {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function isWorkoutActive(planId, workoutId) {
    const sessionKey = `${planId}-${workoutId}`;
    return activeWorkoutSessions[sessionKey] !== undefined;
}

function saveToLocalStorage() {
    try {
        localStorage.setItem('studentWorkoutPlans', JSON.stringify(workoutPlans));
        console.log('Dados salvos com sucesso');
    } catch (error) {
        console.error('Erro ao salvar:', error);
        showNotification('Erro ao salvar dados', 'error');
    }
}

function loadFromLocalStorage() {
    try {
        const stored = localStorage.getItem('studentWorkoutPlans');
        if (stored) {
            workoutPlans = JSON.parse(stored);
            // Migrar dados antigos
            workoutPlans.forEach(plan => {
                plan.treinos.forEach(treino => {
                    treino.exercicios.forEach(ex => {
                        if (!ex.currentCarga) {
                            ex.currentCarga = ex.carga;
                        }
                    });
                });
            });
            saveToLocalStorage();
        }
    } catch (error) {
        console.error('Erro ao carregar:', error);
        workoutPlans = [];
    }
}

// =============================================================================
// STATUS DE CONEXÃO
// =============================================================================

function updateConnectionStatus(status) {
    const indicator = document.getElementById('connectionStatus');
    if (!indicator) return;
    
    indicator.className = `connection-status ${status}`;
    
    switch(status) {
        case 'online':
            indicator.title = 'Conectado ao servidor';
            break;
        case 'offline':
            indicator.title = 'Servidor offline - usando cache local';
            break;
        case 'loading':
            indicator.title = 'Verificando conexão...';
            break;
    }
}

// =============================================================================
// SISTEMA DE NOTIFICAÇÕES
// =============================================================================

function showNotification(message, type = 'info', duration = 4000) {
    // Remove notificações existentes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto remover
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// =============================================================================
// EDIÇÃO DE PESO
// =============================================================================

function startEditingWeight(exerciseId) {
    editingWeight[exerciseId] = true;
    renderWorkout();
}

function cancelEditingWeight(exerciseId) {
    delete editingWeight[exerciseId];
    renderWorkout();
}

function saveWeight(planId, workoutId, exerciseId) {
    const inputId = `weight-input-${exerciseId}`;
    const input = document.getElementById(inputId);
    
    if (!input) {
        showNotification('Erro ao encontrar campo de peso', 'error');
        return;
    }
    
    const newWeight = input.value.trim();
    
    if (!newWeight) {
        showNotification('Por favor, insira uma carga válida', 'warning');
        return;
    }
    
    const plan = workoutPlans.find(p => p.id === planId);
    if (!plan) return;
    
    const workout = plan.treinos.find(t => t.id === workoutId);
    if (!workout) return;
    
    const exercise = workout.exercicios.find(e => e.id === exerciseId);
    if (!exercise) return;
    
    exercise.currentCarga = newWeight;
    delete editingWeight[exerciseId];
    
    saveToLocalStorage();
    renderWorkout();
    showNotification('Carga atualizada com sucesso!', 'success');
}

// =============================================================================
// NAVEGAÇÃO
// =============================================================================

function showView(viewId) {
    const views = document.querySelectorAll('.view');
    views.forEach(view => view.classList.add('hidden'));
    
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.remove('hidden');
    }
}

function showHome() {
    showView('homeView');
    renderHome();
}

function showPlan(planId = null) {
    if (planId) {
        currentPlan = workoutPlans.find(p => p.id === planId);
    }
    if (!currentPlan) {
        showHome();
        return;
    }
    showView('planView');
    renderPlan();
}

function showWorkout(workoutId) {
    if (!currentPlan) {
        showHome();
        return;
    }
    currentWorkout = currentPlan.treinos.find(t => t.id === workoutId);
    if (!currentWorkout) {
        showPlan();
        return;
    }
    showView('workoutView');
    renderWorkout();
}

// =============================================================================
// DADOS DE EXEMPLO
// =============================================================================

function loadExampleData() {
    const examplePlan = {
        "id": Date.now(),
        "nome": "Plano Exemplo - Adaptação Iniciante",
        "aluno": {
            "nome": "Usuário Exemplo",
            "dataNascimento": "1990-01-01",
            "idade": 34,
            "altura": "1,75m",
            "peso": "75kg",
            "cpf": ""
        },
        "dias": 3,
        "dataInicio": new Date().toISOString().split('T')[0],
        "dataFim": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        "perfil": {
            "idade": 34,
            "altura": "1,75m",
            "peso": "75kg",
            "porte": "médio",
            "objetivo": "Condicionamento geral e adaptação"
        },
        "treinos": [
            {
                "id": "A",
                "nome": "A - Corpo Inteiro",
                "foco": "Adaptação e condicionamento geral",
                "exercicios": [
                    {
                        "id": 1,
                        "nome": "Aquecimento - Esteira",
                        "series": 1,
                        "repeticoes": "10 min",
                        "carga": "Ritmo moderado",
                        "descanso": "0",
                        "observacoesEspeciais": "",
                        "descricao": "Caminhada em ritmo moderado para aquecimento geral",
                        "concluido": false,
                        "currentCarga": "Ritmo moderado"
                    },
                    {
                        "id": 2,
                        "nome": "Agachamento Livre",
                        "series": 3,
                        "repeticoes": "12-15",
                        "carga": "Peso corporal",
                        "descanso": "90 segundos",
                        "observacoesEspeciais": "",
                        "descricao": "Movimento básico fundamental, mantenha as costas retas",
                        "concluido": false,
                        "currentCarga": "Peso corporal"
                    },
                    {
                        "id": 3,
                        "nome": "Flexão de Braços",
                        "series": 3,
                        "repeticoes": "8-12",
                        "carga": "Peso corporal",
                        "descanso": "90 segundos",
                        "observacoesEspeciais": "",
                        "descricao": "Pode ser feito com joelhos apoiados se necessário",
                        "concluido": false,
                        "currentCarga": "Peso corporal"
                    },
                    {
                        "id": 4,
                        "nome": "Prancha",
                        "series": 3,
                        "repeticoes": "30-60 seg",
                        "carga": "Peso corporal",
                        "descanso": "60 segundos",
                        "observacoesEspeciais": "",
                        "descricao": "Mantenha o corpo alinhado, contraindo o abdômen",
                        "concluido": false,
                        "currentCarga": "Peso corporal"
                    }
                ],
                "concluido": false,
                "execucoes": 0
            },
            {
                "id": "B",
                "nome": "B - Cardio e Core",
                "foco": "Condicionamento cardiovascular e fortalecimento do core",
                "exercicios": [
                    {
                        "id": 5,
                        "nome": "Aquecimento - Bicicleta",
                        "series": 1,
                        "repeticoes": "8 min",
                        "carga": "Resistência leve",
                        "descanso": "0",
                        "observacoesEspeciais": "",
                        "descricao": "Pedalada em ritmo moderado para aquecimento",
                        "concluido": false,
                        "currentCarga": "Resistência leve"
                    },
                    {
                        "id": 6,
                        "nome": "Burpee",
                        "series": 3,
                        "repeticoes": "5-8",
                        "carga": "Peso corporal",
                        "descanso": "90 segundos",
                        "observacoesEspeciais": "",
                        "descricao": "Exercício completo: agachamento, prancha, flexão e salto",
                        "concluido": false,
                        "currentCarga": "Peso corporal"
                    },
                    {
                        "id": 7,
                        "nome": "Mountain Climber",
                        "series": 3,
                        "repeticoes": "30 seg",
                        "carga": "Peso corporal",
                        "descanso": "60 segundos",
                        "observacoesEspeciais": "",
                        "descricao": "Posição de prancha, alternando joelhos ao peito rapidamente",
                        "concluido": false,
                        "currentCarga": "Peso corporal"
                    }
                ],
                "concluido": false,
                "execucoes": 0
            }
        ],
        "observacoes": {
            "frequencia": "3x por semana com 1 dia de descanso entre sessões",
            "progressao": "Aumente as repetições gradualmente antes de adicionar peso",
            "descanso": "90 segundos entre séries",
            "hidratacao": "Beba água antes, durante e após o treino",
            "consulta": "Acompanhamento profissional recomendado"
        },
        "execucoesPlanCompleto": 0
    };

    workoutPlans = [examplePlan];
    saveToLocalStorage();
    renderHome();
    showNotification('Plano de exemplo carregado com sucesso!', 'success');
}

// =============================================================================
// IMPORTAÇÃO POR ID
// =============================================================================

async function handleImportById() {
    const input = document.getElementById('importIdInput');
    const button = document.getElementById('importIdButton');
    
    if (!input || !button) return;
    
    const shareId = input.value.trim().toUpperCase();
    
    if (!shareId) {
        updateImportStatus('Digite um ID válido', 'error');
        return;
    }
    
    if (shareId.length !== 6) {
        updateImportStatus('ID deve ter 6 caracteres', 'error');
        return;
    }
    
    button.innerHTML = '<span class="loading-spinner"></span> Buscando...';
    button.classList.add('btn-loading');
    button.disabled = true;
    updateImportStatus('Conectando com servidor...', 'loading');
    
    try {
        const result = await importPlanById(shareId);
        
        workoutPlans.push(result.plan);
        saveToLocalStorage();
        
        const sourceText = result.source === 'server' ? 'servidor' : 'cache local';
        updateImportStatus(`✅ Plano "${result.plan.nome}" importado do ${sourceText}!`, 'success');
        input.value = '';
        
        setTimeout(() => {
            renderHome();
        }, 1500);
        
    } catch (error) {
        console.error('Erro na importação:', error);
        updateImportStatus(`❌ ${error.message}`, 'error');
    } finally {
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" x2="12" y1="15" y2="3"/>
            </svg>
            Importar por ID
        `;
        button.classList.remove('btn-loading');
        button.disabled = false;
    }
}

function updateImportStatus(message, type) {
    const status = document.getElementById('importStatus');
    if (!status) return;
    
    status.textContent = message;
    status.className = `import-status ${type}`;
}

// =============================================================================
// SISTEMA DE TREINOS
// =============================================================================

function startWorkout(planId, workoutId) {
    const sessionKey = `${planId}-${workoutId}`;
    activeWorkoutSessions[sessionKey] = {
        startTime: new Date(),
        planId,
        workoutId
    };
    
    const plan = workoutPlans.find(p => p.id === planId);
    if (!plan) return;
    
    const workout = plan.treinos.find(t => t.id === workoutId);
    if (!workout) return;
    
    workout.exercicios.forEach(ex => ex.concluido = false);
    workout.concluido = false;
    
    if (currentPlan && currentPlan.id === planId) {
        renderPlan();
    }
    
    showNotification('Treino iniciado! 💪', 'success');
}

function completeExercise(planId, workoutId, exerciseId) {
    const sessionKey = `${planId}-${workoutId}`;
    if (!activeWorkoutSessions[sessionKey]) {
        showNotification('O treino não está ativo. Inicie o treino primeiro.', 'warning');
        return;
    }
    
    const plan = workoutPlans.find(p => p.id === planId);
    if (!plan) return;
    
    const workout = plan.treinos.find(t => t.id === workoutId);
    if (!workout) return;
    
    const exercise = workout.exercicios.find(e => e.id === exerciseId);
    if (!exercise) return;
    
    exercise.concluido = true;
    
    saveToLocalStorage();
    renderWorkout();
    showNotification(`✅ ${exercise.nome} concluído!`, 'success');
}

function completeWorkout(planId, workoutId) {
    const sessionKey = `${planId}-${workoutId}`;
    const plan = workoutPlans.find(p => p.id === planId);
    if (!plan) return;
    
    const workout = plan.treinos.find(t => t.id === workoutId);
    if (!workout) return;
    
    // Verificar se todos os exercícios foram concluídos
    const allExercisesCompleted = workout.exercicios.every(ex => ex.concluido);
    if (!allExercisesCompleted) {
        showNotification('Complete todos os exercícios antes de finalizar o treino', 'warning');
        return;
    }
    
    workout.concluido = true;
    workout.execucoes += 1;
    
    delete activeWorkoutSessions[sessionKey];
    
    // Verificar se todos os treinos do plano foram concluídos
    const allWorkoutsCompleted = plan.treinos.every(t => t.concluido);
    
    if (allWorkoutsCompleted) {
        plan.execucoesPlanCompleto = (plan.execucoesPlanCompleto || 0) + 1;
        
        // Reset todos os treinos para o próximo ciclo
        plan.treinos.forEach(t => {
            t.concluido = false;
            t.exercicios.forEach(e => e.concluido = false);
        });
        
        setTimeout(() => {
            showNotification(`🎊 Parabéns! Você completou o ciclo ${plan.execucoesPlanCompleto} do plano "${plan.nome}"!\n\nTodos os treinos foram resetados para o próximo ciclo.`, 'success', 6000);
        }, 500);
    }
    
    saveToLocalStorage();
    
    setTimeout(() => {
        showNotification('🎉 Treino concluído com sucesso!', 'success');
        showPlan();
    }, 100);
}

// =============================================================================
// SISTEMA DE EXCLUSÃO
// =============================================================================

function deletePlan(planId) {
    const plan = workoutPlans.find(p => p.id === planId);
    if (!plan) return;
    
    const hasActiveWorkouts = Object.keys(activeWorkoutSessions).some(key => 
        key.startsWith(`${planId}-`)
    );
    
    let message = `Tem certeza de que deseja excluir o plano "${plan.nome}"?`;
    if (hasActiveWorkouts) {
        message += '\n\nEste plano possui treinos em andamento que serão perdidos.';
    }
    message += '\n\nEsta ação não pode ser desfeita.';
    
    if (confirm(message)) {
        confirmDeletePlan(planId);
    }
}

function confirmDeletePlan(planId) {
    // Remover sessões ativas
    Object.keys(activeWorkoutSessions).forEach(key => {
        if (key.startsWith(`${planId}-`)) {
            delete activeWorkoutSessions[key];
        }
    });
    
    // Remover plano
    workoutPlans = workoutPlans.filter(p => p.id !== planId);
    saveToLocalStorage();
    
    // Navegar para home se estava visualizando este plano
    if (currentPlan && currentPlan.id === planId) {
        currentPlan = null;
        showHome();
    } else {
        renderHome();
    }
    
    showNotification('Plano excluído com sucesso!', 'success');
}

// =============================================================================
// FUNÇÕES DE RENDERIZAÇÃO
// =============================================================================

function renderHome() {
    const content = document.getElementById('homeContent');
    if (!content) return;
    
    let html = `
        <!-- Import by ID Card -->
        <div class="card import-by-id-card">
            <div class="card-content">
                <h3 class="import-title">
                    🔗 Importar Treino por ID
                </h3>
                <div class="server-status ${serverConnection.isOnline ? 'online' : 'offline'}">
                    ${serverConnection.isOnline ? 
                        '🟢 Servidor online - Buscará do servidor' : 
                        '🟡 Servidor offline - Usando cache local'
                    }
                </div>
                <div class="import-form">
                    <input type="text" id="importIdInput" class="import-input" 
                           placeholder="Digite o ID (6 caracteres)" 
                           maxlength="6" 
                           onkeyup="this.value = this.value.toUpperCase()"
                           onkeypress="if(event.key==='Enter') handleImportById()">
                    <button id="importIdButton" class="btn import-btn" onclick="handleImportById()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7,10 12,15 17,10"/>
                            <line x1="12" x2="12" y1="15" y2="3"/>
                        </svg>
                        Importar por ID
                    </button>
                </div>
                <div id="importStatus" class="import-status">
                    Peça o ID do seu personal trainer
                </div>
            </div>
        </div>
    `;
    
    if (workoutPlans.length === 0) {
        html += `
            <div class="card">
                <div class="card-content empty-state">
                    <div class="empty-icon">🏋️</div>
                    <h3 class="empty-title">Nenhum plano importado</h3>
                    <p class="empty-description">Use o ID fornecido pelo seu personal trainer para importar seu plano de treino</p>
                    <div class="empty-actions">
                        <button onclick="loadExampleData()" class="btn btn-secondary">
                            📋 Carregar Exemplo de Treino
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else {
        workoutPlans.forEach(plan => {
            const studentInfo = plan.aluno || {};
            const age = studentInfo.dataNascimento ? calculateAge(studentInfo.dataNascimento) : studentInfo.idade;
            
            const completedWorkouts = plan.treinos.filter(t => t.concluido).length;
            const totalWorkouts = plan.treinos.length;
            const totalExecutions = plan.treinos.reduce((sum, t) => sum + t.execucoes, 0);
            
            html += `
                <div class="card">
                    <div class="card-content">
                        ${studentInfo.nome ? `
                        <div class="student-info-card">
                            <div class="student-info-header">
                                <div class="student-avatar">
                                    ${studentInfo.nome.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 class="student-name">${studentInfo.nome}</h2>
                                    ${age ? `<div class="student-age">${age} anos</div>` : ''}
                                </div>
                            </div>
                            <div class="student-details">
                                ${studentInfo.altura ? `
                                <div class="detail-item">
                                    <div class="detail-label">Altura</div>
                                    <div class="detail-value">${studentInfo.altura}</div>
                                </div>` : ''}
                                ${studentInfo.peso ? `
                                <div class="detail-item">
                                    <div class="detail-label">Peso</div>
                                    <div class="detail-value">${studentInfo.peso}</div>
                                </div>` : ''}
                                ${plan.perfil?.objetivo ? `
                                <div class="detail-item">
                                    <div class="detail-label">Objetivo</div>
                                    <div class="detail-value objective-text">${plan.perfil.objetivo}</div>
                                </div>` : ''}
                                ${studentInfo.dataNascimento ? `
                                <div class="detail-item">
                                    <div class="detail-label">Nascimento</div>
                                    <div class="detail-value">${formatDate(studentInfo.dataNascimento)}</div>
                                </div>` : ''}
                            </div>
                        </div>` : ''}
                        
                        <div class="plan-info-card">
                            <div class="plan-header">
                                <h3 class="plan-title">${plan.nome}</h3>
                                <div class="plan-period">
                                    ${formatDate(plan.dataInicio)} - ${formatDate(plan.dataFim)}
                                </div>
                                ${plan.originalShareId ? `
                                    <div class="plan-badges">
                                        <span class="badge badge-id">ID: ${plan.originalShareId}</span>
                                        ${plan.importedFrom ? `
                                            <span class="badge badge-source">
                                                ${plan.importedFrom === 'server' ? '🌐 Servidor' : '💾 Cache'}
                                            </span>
                                        ` : ''}
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div class="plan-stats">
                                <div class="stat-card">
                                    <div class="stat-number">${plan.execucoesPlanCompleto || 0}</div>
                                    <div class="stat-label">Ciclos Completos</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-number">${completedWorkouts}/${totalWorkouts}</div>
                                    <div class="stat-label">Treinos no Ciclo</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-number">${totalExecutions}</div>
                                    <div class="stat-label">Total de Treinos</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-number">${plan.dias}</div>
                                    <div class="stat-label">Dias/Semana</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="workout-grid">
                            ${plan.treinos.map(treino => {
                                const progress = treino.exercicios.length > 0 ? 
                                    (treino.exercicios.filter(ex => ex.concluido).length / treino.exercicios.length) * 100 : 0;
                                
                                return `
                                <div class="workout-item ${treino.concluido ? 'completed' : ''}">
                                    <div class="workout-name">${treino.nome}</div>
                                    <div class="workout-details">
                                        <span class="execution-count ${treino.concluido ? 'completed' : ''}">${treino.execucoes}x</span>
                                        <div class="workout-status ${treino.concluido ? 'completed' : (progress > 0 ? 'in-progress' : 'not-started')}">
                                            ${treino.concluido ? '✅ Concluído' : 
                                              (progress > 0 ? `${Math.round(progress)}% completo` : 'Não iniciado')}
                                        </div>
                                    </div>
                                    ${progress > 0 && !treino.concluido ? `
                                    <div class="workout-progress">
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${progress}%;"></div>
                                        </div>
                                        <span class="progress-text">${Math.round(progress)}%</span>
                                    </div>` : ''}
                                </div>`;
                            }).join('')}
                        </div>
                        
                        <div class="plan-actions">
                            <button onclick="showPlan(${plan.id})" class="btn btn-primary">
                                Ver Plano Completo
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="m9 18 6-6-6-6"/>
                                </svg>
                            </button>
                            <button onclick="deletePlan(${plan.id})" class="btn btn-danger delete-btn" title="Excluir Plano">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="m3 6 18 0"/>
                                    <path d="m19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                                    <path d="m8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    
    content.innerHTML = html;
}

function renderPlan() {
    if (!currentPlan) return;
    
    const planTitle = document.getElementById('planTitle');
    const planSubtitle = document.getElementById('planSubtitle');
    
    if (planTitle) planTitle.textContent = currentPlan.nome;
    if (planSubtitle) planSubtitle.textContent = `${formatDate(currentPlan.dataInicio)} - ${formatDate(currentPlan.dataFim)}`;
    
    const completedWorkouts = currentPlan.treinos.filter(t => t.concluido).length;
    const totalWorkouts = currentPlan.treinos.length;
    const cycleProgress = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;
    const totalExecutions = currentPlan.treinos.reduce((sum, t) => sum + t.execucoes, 0);
    
    let html = `
        ${currentPlan.aluno && currentPlan.aluno.nome ? `
        <div class="student-info-card">
            <div class="student-info-header">
                <div class="student-avatar">
                    ${currentPlan.aluno.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 class="student-name">${currentPlan.aluno.nome}</h2>
                    ${currentPlan.aluno.idade || (currentPlan.aluno.dataNascimento ? calculateAge(currentPlan.aluno.dataNascimento) : null) ? 
                        `<div class="student-age">${currentPlan.aluno.idade || calculateAge(currentPlan.aluno.dataNascimento)} anos</div>` : ''}
                </div>
            </div>
            <div class="student-details">
                ${currentPlan.aluno.altura ? `
                <div class="detail-item">
                    <div class="detail-label">Altura</div>
                    <div class="detail-value">${currentPlan.aluno.altura}</div>
                </div>` : ''}
                ${currentPlan.aluno.peso ? `
                <div class="detail-item">
                    <div class="detail-label">Peso</div>
                    <div class="detail-value">${currentPlan.aluno.peso}</div>
                </div>` : ''}
                ${currentPlan.perfil?.objetivo ? `
                <div class="detail-item">
                    <div class="detail-label">Objetivo</div>
                    <div class="detail-value objective-text">${currentPlan.perfil.objetivo}</div>
                </div>` : ''}
                ${currentPlan.aluno.cpf ? `
                <div class="detail-item">
                    <div class="detail-label">CPF</div>
                    <div class="detail-value">${formatCPF(currentPlan.aluno.cpf)}</div>
                </div>` : ''}
            </div>
        </div>` : ''}
        
        <div class="plan-cycle-info">
            <div class="cycle-counter">${currentPlan.execucoesPlanCompleto || 0}</div>
            <div class="cycle-label">Ciclos Completos do Plano</div>
            <div class="cycle-progress">
                <div class="cycle-progress-fill" style="width: ${cycleProgress}%;"></div>
            </div>
            <div class="cycle-status">
                ${completedWorkouts === totalWorkouts 
                    ? '🎉 Ciclo atual completo! Próximo treino iniciará um novo ciclo.'
                    : `Progresso do ciclo atual: ${completedWorkouts}/${totalWorkouts} treinos (${Math.round(cycleProgress)}%)`
                }
            </div>
            <div class="total-executions">
                Total de treinos executados: ${totalExecutions}
            </div>
        </div>
    `;
    
    // Treinos
    currentPlan.treinos.forEach(treino => {
        const isActive = isWorkoutActive(currentPlan.id, treino.id);
        const completedExercises = treino.exercicios.filter(ex => ex.concluido).length;
        const totalExercises = treino.exercicios.length;
        const workoutProgress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
        const isCompleted = treino.concluido;
        
        html += `
            <div class="card ${isCompleted ? 'completed' : ''}">
                <div class="card-content">
                    <div class="plan-header">
                        <div>
                            <div class="workout-title-wrapper">
                                <h3 class="plan-title">${treino.nome}</h3>
                                ${isCompleted ? `
                                    <div class="check-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="m9 12 2 2 4-4"/>
                                        </svg>
                                    </div>
                                ` : ''}
                            </div>
                            <p class="plan-subtitle">
                                ${treino.foco} • ${totalExercises} exercícios • Executado ${treino.execucoes}x
                            </p>
                            ${isActive ? '<div class="active-workout">Treino em andamento</div>' : ''}
                            
                            ${workoutProgress > 0 && !isCompleted ? `
                            <div class="workout-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${workoutProgress}%;"></div>
                                </div>
                                <span class="progress-text">${Math.round(workoutProgress)}% completo</span>
                            </div>` : ''}
                        </div>
                    </div>
                    
                    <div class="workout-actions">
                        <button onclick="showWorkout('${treino.id}')" class="btn btn-secondary">
                            Ver Exercícios
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="m9 18 6-6-6-6"/>
                            </svg>
                        </button>
                        ${!isActive ? `
                            <button onclick="startWorkout(${currentPlan.id}, '${treino.id}')" class="btn ${isCompleted ? 'btn-warning' : 'btn-success'}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polygon points="6,3 20,12 6,21"/>
                                </svg>
                                ${isCompleted ? 'Repetir' : 'Iniciar'}
                            </button>
                        ` : `
                            <button onclick="completeWorkout(${currentPlan.id}, '${treino.id}')" 
                                    class="${completedExercises < totalExercises ? 'btn btn-disabled' : 'btn btn-warning'}" 
                                    ${completedExercises < totalExercises ? 'disabled' : ''}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="m9 12 2 2 4-4"/>
                                </svg>
                                Concluir
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    });
    
    // Observações do plano
    if (currentPlan.observacoes && Object.keys(currentPlan.observacoes).length > 0) {
        html += `
            <div class="plan-observations">
                <div class="observations-title">
                    📝 Observações do Plano
                </div>
                ${Object.entries(currentPlan.observacoes).map(([key, value]) => {
                    if (!value) return '';
                    const label = getObservationLabel(key);
                    return `<div class="observation-item"><span class="observation-label">${label}:</span> ${value}</div>`;
                }).join('')}
            </div>
        `;
    }
    
    const planContent = document.getElementById('planContent');
    if (planContent) planContent.innerHTML = html;
}

function renderWorkout() {
    if (!currentWorkout || !currentPlan) return;
    
    const workoutTitle = document.getElementById('workoutTitle');
    const workoutSubtitle = document.getElementById('workoutSubtitle');
    
    if (workoutTitle) workoutTitle.textContent = currentWorkout.nome;
    if (workoutSubtitle) workoutSubtitle.textContent = `${currentWorkout.exercicios.length} exercícios • ${currentWorkout.foco}`;
    
    const isWorkoutActiveNow = isWorkoutActive(currentPlan.id, currentWorkout.id);
    
    let html = '';
    
    // Alerta se o treino não estiver ativo
    if (!isWorkoutActiveNow) {
        html += `
            <div class="alert">
                <span class="alert-icon">⚠️</span>
                Para realizar os exercícios, você precisa iniciar o treino na tela anterior
            </div>
        `;
    }
    
    currentWorkout.exercicios.forEach((exercicio, index) => {
        const isEditing = editingWeight[exercicio.id];
        const cardClass = isWorkoutActiveNow 
            ? (exercicio.concluido ? 'completed' : 'pending')
            : 'disabled';
        
        html += `
            <div class="card exercise-card ${cardClass}">
                <div class="card-content">
                    <div class="exercise-header">
                        <div class="exercise-main">
                            <h3 class="exercise-number">${index + 1}. ${exercicio.nome}</h3>
                            <p class="exercise-description">${exercicio.descricao || 'Sem descrição'}</p>
                            ${exercicio.observacoesEspeciais ? `
                                <div class="exercise-notes">
                                    ${exercicio.observacoesEspeciais}
                                </div>
                            ` : ''}
                        </div>
                        ${exercicio.concluido && isWorkoutActiveNow ? `
                            <div class="check-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="m9 12 2 2 4-4"/>
                                </svg>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="exercise-specs-grid">
                        <div class="spec-badge">
                            <div class="spec-label">Séries</div>
                            <div class="spec-value">${exercicio.series}</div>
                        </div>
                        <div class="spec-badge">
                            <div class="spec-label">Reps</div>
                            <div class="spec-value">${exercicio.repeticoes}</div>
                        </div>
                        <div class="spec-badge">
                            <div class="spec-label">Carga</div>
                            <div class="spec-value">${exercicio.currentCarga}</div>
                        </div>
                        ${exercicio.descanso && exercicio.descanso !== '0' ? `
                        <div class="spec-badge">
                            <div class="spec-label">Descanso</div>
                            <div class="spec-value">${exercicio.descanso}</div>
                        </div>` : ''}
                    </div>
                    
                    ${exercicio.currentCarga !== exercicio.carga ? `
                        <div class="current-weight">
                            Carga original: ${exercicio.carga}
                        </div>
                    ` : ''}
                    
                    ${isEditing ? `
                        <div class="weight-edit">
                            <input type="text" id="weight-input-${exercicio.id}" 
                                   class="weight-input" 
                                   value="${exercicio.currentCarga}" 
                                   placeholder="Digite a nova carga">
                            <button onclick="saveWeight(${currentPlan.id}, '${currentWorkout.id}', ${exercicio.id})" 
                                    class="btn btn-success btn-weight">
                                Salvar
                            </button>
                            <button onclick="cancelEditingWeight(${exercicio.id})" 
                                    class="btn btn-secondary btn-weight">
                                Cancelar
                            </button>
                        </div>
                    ` : `
                        <div class="exercise-actions">
                            <button onclick="startEditingWeight(${exercicio.id})" 
                                    class="btn btn-secondary">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                Editar Carga
                            </button>
                            
                            ${isWorkoutActiveNow ? `
                                <button onclick="completeExercise(${currentPlan.id}, '${currentWorkout.id}', ${exercicio.id})" 
                                        ${exercicio.concluido ? 'disabled' : ''} 
                                        class="${exercicio.concluido ? 'btn btn-disabled' : 'btn btn-success'}">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="m9 12 2 2 4-4"/>
                                    </svg>
                                    ${exercicio.concluido ? 'Concluído' : 'Concluir'}
                                </button>
                            ` : ''}
                        </div>
                    `}
                </div>
            </div>
        `;
    });
    
    // Card de conclusão se o treino estiver ativo
    if (isWorkoutActiveNow) {
        const allCompleted = currentWorkout.exercicios.every(ex => ex.concluido);
        const completedCount = currentWorkout.exercicios.filter(ex => ex.concluido).length;
        
        html += `
            <div class="card completion-card">
                <div class="card-content">
                    <h3 class="completion-title">Treino em Andamento</h3>
                    <p class="completion-subtitle">
                        ${completedCount}/${currentWorkout.exercicios.length} exercícios concluídos
                    </p>
                    <div class="workout-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(completedCount / currentWorkout.exercicios.length) * 100}%;"></div>
                        </div>
                        <span class="progress-text">${Math.round((completedCount / currentWorkout.exercicios.length) * 100)}%</span>
                    </div>
                    <button onclick="completeWorkout(${currentPlan.id}, '${currentWorkout.id}')" 
                            ${!allCompleted ? 'disabled' : ''} 
                            class="${!allCompleted ? 'btn btn-disabled' : 'btn btn-warning'}">
                        ${allCompleted ? 'Finalizar Treino' : `Faltam ${currentWorkout.exercicios.length - completedCount} exercícios`}
                    </button>
                </div>
            </div>
        `;
    }
    
    const workoutContent = document.getElementById('workoutContent');
    if (workoutContent) workoutContent.innerHTML = html;
}

// =============================================================================
// FUNÇÃO AUXILIAR PARA LABELS
// =============================================================================

function getObservationLabel(key) {
    const labels = {
        frequencia: 'Frequência',
        progressao: 'Progressão',
        descanso: 'Descanso',
        hidratacao: 'Hidratação',
        alimentacao: 'Alimentação',
        suplementacao: 'Suplementação',
        sono: 'Sono',
        aquecimento: 'Aquecimento',
        tecnica: 'Técnica',
        periodizacao: 'Periodização',
        consulta: 'Consulta',
        geral: 'Observações Gerais'
    };
    return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

// =============================================================================
// CONFIGURAÇÃO iOS E PWA
// =============================================================================

function setupiOSCompatibility() {
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            const app = document.querySelector('.app');
            if (app) {
                app.style.minHeight = window.innerHeight + 'px';
            }
        }
    };
    
    setVH();
    
    let resizeTimeout;
    const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(setVH, 150);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', () => {
        setTimeout(setVH, 500);
    }, { passive: true });
    
    window.addEventListener('load', () => {
        setVH();
        setTimeout(setVH, 0);
    });
    
    // Prevenir zoom no iOS
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset === 0) {
                setVH();
            }
        }, { passive: true });
        
        let lastTouchEnd = 0;
        
        document.addEventListener('touchstart', (event) => {
            if (event.touches.length > 1) {
                event.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('touchend', (event) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        document.addEventListener('gesturestart', (event) => {
            event.preventDefault();
        }, false);

        document.addEventListener('gesturechange', (event) => {
            event.preventDefault();
        }, false);

        document.addEventListener('gestureend', (event) => {
            event.preventDefault();
        }, false);
    }
}

// =============================================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// =============================================================================

async function init() {
    console.log('🚀 Inicializando JS Fit App - Versão Aluno');
    
    setupiOSCompatibility();
    loadFromLocalStorage();
    
    // Verificar conexão com servidor
    await WorkoutServerAPI.checkServerHealth();
    
    // Verificar conexão periodicamente
    setInterval(async () => {
        await WorkoutServerAPI.checkServerHealth();
    }, 30000);
    
    renderHome();
    
    console.log('✅ Aplicação inicializada com sucesso');
}

// Event listeners
document.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', init);

// Handle beforeunload para salvar dados
window.addEventListener('beforeunload', () => {
    saveToLocalStorage();
});

// Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registrado:', registration);
            })
            .catch(registrationError => {
                console.log('Falha no registro do SW:', registrationError);
            });
    });
}