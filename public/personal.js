// personal.js - JS Fit App Personal Trainer - Compatível com planos ABCDE
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

// Templates compatíveis com a estrutura ABCDE
const newPlanTemplate = {
    id: Date.now(),
    shareId: null,
    nome: "Novo Plano",
    dias: 5,
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    perfil: {
        idade: 30,
        altura: "1,70m",
        peso: "70kg",
        porte: "medio",
        objetivo: "Hipertrofia e ganho de massa muscular"
    },
    treinos: [],
    observacoes: {
        frequencia: "5x por semana (ABCDE) com 2 dias de descanso por semana",
        progressao: "Aumente a carga em 2,5-5kg quando conseguir executar todas as séries no limite superior de repetições",
        descanso: "2-3 minutos entre séries para exercícios compostos, 60-90 segundos para isolamentos",
        hidratacao: "Beba pelo menos 3L de água por dia, especialmente durante os treinos",
        alimentacao: "Consuma 2,2g de proteína por kg de peso corporal diariamente para hipertrofia",
        suplementacao: "Considere whey protein, creatina e multivitamínico (consulte nutricionista)",
        sono: "Durma 7-9 horas por noite para recuperação muscular adequada",
        aquecimento: "Sempre faça aquecimento específico antes dos exercícios principais",
        tecnica: "Priorize a execução perfeita sobre cargas altas",
        periodizacao: "A cada 6-8 semanas, faça uma semana de deload com 60% da carga",
        consulta: "Acompanhamento profissional é essencial para ajustes e progressão segura"
    }
};

const newWorkoutTemplate = {
    id: "",
    nome: "Novo Treino",
    foco: "Descrição do foco do treino",
    exercicios: [],
    concluido: false,
    execucoes: 0
};

const newExerciseTemplate = {
    id: Date.now(),
    nome: "Novo Exercício",
    descricao: "Descrição técnica do exercício",
    series: 3,
    repeticoes: "12",
    carga: "20kg",
    concluido: false
};

// Templates pré-definidos para diferentes tipos de treino
const workoutTemplates = {
    peito_triceps: {
        id: "A",
        nome: "A - Peito e Tríceps",
        foco: "Hipertrofia - Peitorais e Tríceps",
        exercicios: [
            {
                id: 1,
                nome: "Aquecimento - Esteira",
                descricao: "Caminhada moderada para aquecimento geral",
                series: 1,
                repeticoes: "8 min",
                carga: "Velocidade 7-8 km/h",
                concluido: false
            },
            {
                id: 2,
                nome: "Supino Reto com Barra",
                descricao: "Exercício principal para desenvolvimento do peitoral maior",
                series: 4,
                repeticoes: "8-10",
                carga: "60kg",
                concluido: false
            },
            {
                id: 3,
                nome: "Supino Inclinado com Halteres",
                descricao: "Foco na porção superior do peitoral",
                series: 4,
                repeticoes: "10-12",
                carga: "20kg cada",
                concluido: false
            }
        ],
        concluido: false,
        execucoes: 0
    },
    costas_biceps: {
        id: "B",
        nome: "B - Costas e Bíceps",
        foco: "Hipertrofia - Dorsais e Bíceps",
        exercicios: [
            {
                id: 11,
                nome: "Aquecimento - Remo Ergômetro",
                descricao: "Aquecimento específico para movimentos de puxar",
                series: 1,
                repeticoes: "8 min",
                carga: "Intensidade moderada",
                concluido: false
            },
            {
                id: 12,
                nome: "Puxada Alta Pegada Aberta",
                descricao: "Desenvolvimento da largura das costas",
                series: 4,
                repeticoes: "10-12",
                carga: "50kg",
                concluido: false
            },
            {
                id: 13,
                nome: "Remada Curvada com Barra",
                descricao: "Exercício para espessura das costas",
                series: 4,
                repeticoes: "8-10",
                carga: "50kg",
                concluido: false
            }
        ],
        concluido: false,
        execucoes: 0
    },
    ombros_trapezio: {
        id: "C",
        nome: "C - Ombros e Trapézio",
        foco: "Hipertrofia - Deltoides e Trapézio",
        exercicios: [
            {
                id: 21,
                nome: "Aquecimento - Elíptico",
                descricao: "Aquecimento com mobilização de braços",
                series: 1,
                repeticoes: "8 min",
                carga: "Resistência baixa",
                concluido: false
            },
            {
                id: 22,
                nome: "Desenvolvimento com Barra",
                descricao: "Exercício principal para deltoides",
                series: 4,
                repeticoes: "8-10",
                carga: "40kg",
                concluido: false
            },
            {
                id: 23,
                nome: "Elevação Lateral",
                descricao: "Isolamento para deltoide medial",
                series: 4,
                repeticoes: "12-15",
                carga: "10kg cada",
                concluido: false
            }
        ],
        concluido: false,
        execucoes: 0
    },
    pernas_quadriceps: {
        id: "D",
        nome: "D - Pernas (Quadríceps e Glúteos)",
        foco: "Hipertrofia - Anterior de coxa e glúteos",
        exercicios: [
            {
                id: 31,
                nome: "Aquecimento - Bicicleta",
                descricao: "Aquecimento específico para membros inferiores",
                series: 1,
                repeticoes: "10 min",
                carga: "Resistência moderada",
                concluido: false
            },
            {
                id: 32,
                nome: "Agachamento com Barra",
                descricao: "Exercício rei para pernas e glúteos",
                series: 4,
                repeticoes: "8-10",
                carga: "60kg",
                concluido: false
            },
            {
                id: 33,
                nome: "Leg Press 45°",
                descricao: "Volume alto para quadríceps e glúteos",
                series: 4,
                repeticoes: "12-15",
                carga: "120kg",
                concluido: false
            }
        ],
        concluido: false,
        execucoes: 0
    },
    posterior_core: {
        id: "E",
        nome: "E - Posterior de Coxa e Core",
        foco: "Hipertrofia - Isquiotibiais, glúteos e abdômen",
        exercicios: [
            {
                id: 41,
                nome: "Aquecimento - Esteira",
                descricao: "Caminhada com inclinação para ativação dos glúteos",
                series: 1,
                repeticoes: "10 min",
                carga: "Inclinação 8%, vel. 6 km/h",
                concluido: false
            },
            {
                id: 42,
                nome: "Levantamento Terra",
                descricao: "Exercício fundamental para posterior de coxa e lombar",
                series: 4,
                repeticoes: "6-8",
                carga: "80kg",
                concluido: false
            },
            {
                id: 43,
                nome: "Stiff com Halteres",
                descricao: "Foco no alongamento e fortalecimento dos isquiotibiais",
                series: 4,
                repeticoes: "10-12",
                carga: "30kg cada",
                concluido: false
            }
        ],
        concluido: false,
        execucoes: 0
    }
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

        // Preparar dados para envio (formato compatível com o JSON)
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

// Função para carregar plano do arquivo JSON (compatível com formato ABCDE)
function loadPlanFromJSON(jsonData) {
    try {
        let planData;
        
        // Verificar se é o formato do arquivo anexo (com array "planos")
        if (jsonData.planos && Array.isArray(jsonData.planos) && jsonData.planos.length > 0) {
            planData = jsonData.planos[0]; // Usar o primeiro plano do array
        } else if (jsonData.plan) {
            planData = jsonData.plan; // Formato exportado
        } else {
            planData = jsonData; // Formato direto
        }
        
        // Criar novo plano com ID único
        const importedPlan = {
            id: Date.now(),
            shareId: null,
            nome: planData.nome || "Plano Importado",
            dias: planData.dias || 5,
            dataInicio: planData.dataInicio || new Date().toISOString().split('T')[0],
            dataFim: planData.dataFim || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            perfil: {
                idade: planData.perfil?.idade || 30,
                altura: planData.perfil?.altura || "1,70m",
                peso: planData.perfil?.peso || "70kg",
                porte: planData.perfil?.porte || "medio",
                objetivo: planData.perfil?.objetivo || "Hipertrofia e ganho de massa muscular"
            },
            treinos: planData.treinos ? planData.treinos.map(treino => ({
                id: treino.id,
                nome: treino.nome,
                foco: treino.foco,
                exercicios: treino.exercicios ? treino.exercicios.map(exercicio => ({
                    id: exercicio.id || Date.now() + Math.random(),
                    nome: exercicio.nome,
                    descricao: exercicio.descricao || "",
                    series: exercicio.series || 3,
                    repeticoes: exercicio.repeticoes || "12",
                    carga: exercicio.carga || "20kg",
                    concluido: false
                })) : [],
                concluido: false,
                execucoes: 0
            })) : [],
            observacoes: {
                frequencia: planData.observacoes?.frequencia || "5x por semana",
                progressao: planData.observacoes?.progressao || "Aumente a carga gradualmente",
                descanso: planData.observacoes?.descanso || "60-90 segundos entre séries",
                hidratacao: planData.observacoes?.hidratacao || "Mantenha-se hidratado",
                alimentacao: planData.observacoes?.alimentacao || "Dieta balanceada",
                suplementacao: planData.observacoes?.suplementacao || "Consulte nutricionista",
                sono: planData.observacoes?.sono || "7-9 horas por noite",
                aquecimento: planData.observacoes?.aquecimento || "Sempre aqueça antes do treino",
                tecnica: planData.observacoes?.tecnica || "Priorize a técnica",
                periodizacao: planData.observacoes?.periodizacao || "Varie os treinos periodicamente",
                consulta: planData.observacoes?.consulta || "Acompanhamento profissional recomendado"
            }
        };
        
        return importedPlan;
        
    } catch (error) {
        console.error('Erro ao processar dados do plano:', error);
        throw new Error('Formato de plano inválido');
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    loadFromLocalStorage();
    
    // Verificar servidor
    appState.serverOnline = await WorkoutAPI.checkServerHealth();
    
    renderCurrentView();
    
    // Configurar import
    const importInput = document.getElementById('importInput');
    if (importInput) {
        importInput.addEventListener('change', importJSON);
    }
    
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

// Função para renderizar lista de planos
function renderPlansList() {
    const container = document.getElementById('plansList');
    
    if (appState.workoutPlans.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🏋️‍♂️</div>
                <div class="empty-title">Nenhum plano criado</div>
                <div class="empty-subtitle">Crie seu primeiro plano de treino ou importe um existente</div>
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
                    <div class="plan-profile">👤 ${plan.perfil.idade} anos • ${plan.perfil.altura} • ${plan.perfil.peso}</div>
                    <div class="plan-objective">${plan.perfil.objetivo}</div>
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
                ${plan.treinos.slice(0, 5).map(treino => `
                    <div class="workout-item">
                        <div class="workout-name">${treino.nome}</div>
                        <div class="workout-count">${treino.exercicios.length} exercícios</div>
                    </div>
                `).join('')}
                ${plan.treinos.length > 5 ? `
                    <div class="workout-item" style="text-align: center; color: #8e8e93;">
                        +${plan.treinos.length - 5} treinos
                    </div>
                ` : ''}
            </div>
            
            <button class="btn-primary" style="margin-top: 12px;" onclick="viewPlanDetails(${plan.id})">
                Ver Detalhes
            </button>
        </div>
    `).join('');
}

// Função para deletar plano
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

// Função para duplicar plano
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
                id: Date.now() + Math.random(),
                concluido: false
            })),
            concluido: false,
            execucoes: 0
        }))
    };

    appState.workoutPlans.push(duplicatedPlan);
    saveToLocalStorage();
    renderPlansList();
    
    alert('Plano duplicado com sucesso!');
}

// Função para exportar JSON
function exportJSON(planId) {
    const plan = appState.workoutPlans.find(p => p.id === planId);
    if (!plan) return;

    try {
        // Criar estrutura compatível com o formato ABCDE
        const exportData = {
            planos: [{
                id: plan.id,
                nome: plan.nome,
                dias: plan.dias,
                dataInicio: plan.dataInicio,
                dataFim: plan.dataFim,
                perfil: plan.perfil,
                treinos: plan.treinos.map(treino => ({
                    ...treino,
                    exercicios: treino.exercicios.map(ex => ({
                        ...ex,
                        concluido: false
                    })),
                    concluido: false,
                    execucoes: 0
                })),
                observacoes: plan.observacoes
            }]
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
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

// Função para importar JSON
function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            const importedPlan = loadPlanFromJSON(data);
            
            // Adicionar sufixo "Importado" se não existir
            if (!importedPlan.nome.includes('Importado')) {
                importedPlan.nome = `${importedPlan.nome} - Importado`;
            }

            appState.workoutPlans.push(importedPlan);
            saveToLocalStorage();
            renderPlansList();
            
            alert('Plano importado com sucesso!');
            
        } catch (error) {
            console.error('Erro ao importar arquivo:', error);
            alert('Erro ao importar arquivo. Verifique se o formato está correto.');
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

        // Mostrar informações do perfil
        const planInfo = document.getElementById('planInfo');
        if (planInfo) {
            planInfo.innerHTML = `
                <div class="plan-profile-info">
                    <h3>Informações do Plano</h3>
                    <p><strong>Duração:</strong> ${appState.selectedPlan.dias} dias por semana</p>
                    <p><strong>Período:</strong> ${appState.selectedPlan.dataInicio} até ${appState.selectedPlan.dataFim}</p>
                    <p><strong>Perfil:</strong> ${appState.selectedPlan.perfil.idade} anos, ${appState.selectedPlan.perfil.altura}, ${appState.selectedPlan.perfil.peso}</p>
                    <p><strong>Objetivo:</strong> ${appState.selectedPlan.perfil.objetivo}</p>
                </div>
            `;
        }

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
                    <button class="btn-primary" onclick="showWorkoutTemplates()" style="margin-top: 16px;">
                        Adicionar Treino Pré-definido
                    </button>
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
                        <div class="plan-stats">
                            <span>Execuções: ${treino.execucoes || 0}</span>
                            ${treino.concluido ? '<span style="color: #34c759;">✅ Concluído</span>' : ''}
                        </div>
                    </div>
                    <div class="plan-actions">
                        <button class="action-btn" onclick="viewWorkoutDetails('${treino.id}')" title="Ver exercícios">👁️</button>
                        <button class="action-btn success" onclick="editWorkout('${treino.id}')" title="Editar">✏️</button>
                        <button class="action-btn danger" onclick="deleteWorkout('${treino.id}')" title="Excluir">🗑️</button>
                    </div>
                </div>
                
                <div class="workout-preview">
                    ${treino.exercicios.slice(0, 6).map(exercicio => `
                        <div class="workout-item">
                            <div class="workout-name">${exercicio.nome}</div>
                            <div class="workout-count">${exercicio.series}x${exercicio.repeticoes} • ${exercicio.carga}</div>
                        </div>
                    `).join('')}
                    ${treino.exercicios.length > 6 ? `
                        <div class="workout-item" style="text-align: center; color: #8e8e93;">
                            +${treino.exercicios.length - 6} exercícios
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }
}

// Função para mostrar templates de treino
function showWorkoutTemplates() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Escolher Treino Pré-definido</h2>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
            </div>
            <div class="modal-body">
                ${Object.entries(workoutTemplates).map(([key, template]) => `
                    <div class="template-item" onclick="addWorkoutFromTemplate('${key}')">
                        <div class="template-name">${template.nome}</div>
                        <div class="template-description">${template.foco}</div>
                        <div class="template-count">${template.exercicios.length} exercícios</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Função para adicionar treino a partir do template
function addWorkoutFromTemplate(templateKey) {
    const template = workoutTemplates[templateKey];
    if (!template || !appState.selectedPlan) return;
    
    const newWorkout = {
        ...template,
        exercicios: template.exercicios.map(ex => ({
            ...ex,
            id: Date.now() + Math.random(),
            concluido: false
        })),
        concluido: false,
        execucoes: 0
    };
    
    appState.selectedPlan.treinos.push(newWorkout);
    
    const planIndex = appState.workoutPlans.findIndex(p => p.id === appState.selectedPlan.id);
    if (planIndex >= 0) {
        appState.workoutPlans[planIndex] = appState.selectedPlan;
    }
    
    updateSharedPlan(appState.selectedPlan);
    saveToLocalStorage();
    renderPlanDetails();
    
    // Fechar modal
    document.querySelector('.modal-overlay').remove();
    
    alert('Treino adicionado com sucesso!');
}

function renderEditPlan() {
    const form = document.getElementById('planForm');
    const title = document.getElementById('editPlanTitle');
    
    if (appState.selectedPlan) {
        title.textContent = appState.selectedPlan.nome === "Novo Plano" ? 'Criar Plano' : 'Editar Plano';
        
        // Preencher formulário com dados existentes
        form.nome.value = appState.selectedPlan.nome || '';
        form.dias.value = appState.selectedPlan.dias || 5;
        form.dataInicio.value = appState.selectedPlan.dataInicio || '';
        form.dataFim.value = appState.selectedPlan.dataFim || '';
        form.idade.value = appState.selectedPlan.perfil?.idade || 30;
        form.altura.value = appState.selectedPlan.perfil?.altura || '1,70m';
        form.peso.value = appState.selectedPlan.perfil?.peso || '70kg';
        form.porte.value = appState.selectedPlan.perfil?.porte || 'medio';
        form.objetivo.value = appState.selectedPlan.perfil?.objetivo || 'Hipertrofia e ganho de massa muscular';
        form.frequencia.value = appState.selectedPlan.observacoes?.frequencia || '5x por semana';
        form.progressao.value = appState.selectedPlan.observacoes?.progressao || 'Aumente a carga gradualmente';
        form.descanso.value = appState.selectedPlan.observacoes?.descanso || '60-90 segundos entre séries';
        form.hidratacao.value = appState.selectedPlan.observacoes?.hidratacao || 'Beba pelo menos 3L de água por dia';
        form.alimentacao.value = appState.selectedPlan.observacoes?.alimentacao || 'Dieta rica em proteínas';
        form.suplementacao.value = appState.selectedPlan.observacoes?.suplementacao || 'Consulte nutricionista';
        form.sono.value = appState.selectedPlan.observacoes?.sono || '7-9 horas por noite';
        form.aquecimento.value = appState.selectedPlan.observacoes?.aquecimento || 'Sempre aqueça antes do treino';
        form.tecnica.value = appState.selectedPlan.observacoes?.tecnica || 'Priorize a técnica';
        form.periodizacao.value = appState.selectedPlan.observacoes?.periodizacao || 'Varie os treinos periodicamente';
        form.consulta.value = appState.selectedPlan.observacoes?.consulta || 'Acompanhamento profissional recomendado';
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
        
        // Mostrar estatísticas do treino
        const workoutInfo = document.getElementById('workoutInfo');
        if (workoutInfo) {
            const totalExercises = appState.selectedWorkout.exercicios.length;
            const completedExercises = appState.selectedWorkout.exercicios.filter(ex => ex.concluido).length;
            const totalSeries = appState.selectedWorkout.exercicios.reduce((sum, ex) => sum + ex.series, 0);
            
            workoutInfo.innerHTML = `
                <div class="workout-stats">
                    <div class="stat-item">
                        <span class="stat-label">Exercícios:</span>
                        <span class="stat-value">${totalExercises}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total de Séries:</span>
                        <span class="stat-value">${totalSeries}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Execuções:</span>
                        <span class="stat-value">${appState.selectedWorkout.execucoes || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Foco:</span>
                        <span class="stat-value">${appState.selectedWorkout.foco}</span>
                    </div>
                </div>
            `;
        }
        
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

        container.innerHTML = appState.selectedWorkout.exercicios.map((exercicio, index) => `
            <div class="exercise-item ${exercicio.concluido ? 'completed' : ''}">
                <div class="exercise-order">${index + 1}</div>
                <div class="exercise-info">
                    <div class="exercise-name">${exercicio.nome}</div>
                    <div class="exercise-details">
                        <span class="exercise-detail">Séries: ${exercicio.series}</span>
                        <span class="exercise-detail">Rep: ${exercicio.repeticoes}</span>
                        <span class="exercise-detail">Carga: ${exercicio.carga}</span>
                    </div>
                    ${exercicio.descricao ? `<div class="exercise-description">${exercicio.descricao}</div>` : ''}
                </div>
                <div class="exercise-actions">
                    <button class="action-btn" onclick="toggleExerciseComplete(${exercicio.id})" title="${exercicio.concluido ? 'Marcar como pendente' : 'Marcar como concluído'}">
                        ${exercicio.concluido ? '✅' : '⭕'}
                    </button>
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
    appState.selectedWorkout = { ...newWorkoutTemplate, id: generateWorkoutId() };
    showView('editWorkout');
}

function generateWorkoutId() {
    const existingIds = appState.selectedPlan.treinos.map(t => t.id);
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    
    for (let letter of letters) {
        if (!existingIds.includes(letter)) {
            return letter;
        }
    }
    
    return `${Date.now()}`;
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
    appState.editingExercise = appState.selectedWorkout.exercicios.find(e => e.id == exerciseId);
    showView('editExercise');
}

function toggleExerciseComplete(exerciseId) {
    const exercise = appState.selectedWorkout.exercicios.find(e => e.id == exerciseId);
    if (exercise) {
        exercise.concluido = !exercise.concluido;
        
        // Atualizar nos arrays principais
        const planIndex = appState.workoutPlans.findIndex(p => p.id === appState.selectedPlan.id);
        if (planIndex >= 0) {
            const workoutIndex = appState.workoutPlans[planIndex].treinos.findIndex(w => w.id == appState.selectedWorkout.id);
            if (workoutIndex >= 0) {
                appState.workoutPlans[planIndex].treinos[workoutIndex] = { ...appState.selectedWorkout };
                appState.selectedPlan = appState.workoutPlans[planIndex];
            }
        }
        
        updateSharedPlan(appState.selectedPlan);
        saveToLocalStorage();
        renderWorkoutDetails();
    }
}

function deleteWorkout(workoutId) {
    if (!confirm('Tem certeza que deseja excluir este treino?')) return;
    
    if (!appState.selectedPlan || !appState.selectedPlan.treinos) {
        console.error('Nenhum plano selecionado ou treinos não encontrados');
        return;
    }
    
    const workoutIndex = appState.selectedPlan.treinos.findIndex(w => w.id == workoutId);
    
    if (workoutIndex >= 0) {
        appState.selectedPlan.treinos.splice(workoutIndex, 1);
        
        // Atualizar no array principal
        const planIndex = appState.workoutPlans.findIndex(p => p.id === appState.selectedPlan.id);
        if (planIndex >= 0) {
            appState.workoutPlans[planIndex] = { ...appState.selectedPlan };
        }
        
        updateSharedPlan(appState.selectedPlan);
        saveToLocalStorage();
        renderPlanDetails();
        
        alert('Treino excluído com sucesso!');
    } else {
        alert('Erro: Treino não encontrado.');
    }
}

function deleteExercise(exerciseId) {
    if (!confirm('Tem certeza que deseja excluir este exercício?')) return;
    
    if (!appState.selectedWorkout || !appState.selectedWorkout.exercicios) {
        console.error('Nenhum treino selecionado ou exercícios não encontrados');
        return;
    }
    
    const exerciseIndex = appState.selectedWorkout.exercicios.findIndex(e => e.id == exerciseId);
    
    if (exerciseIndex >= 0) {
        appState.selectedWorkout.exercicios.splice(exerciseIndex, 1);
        
        // Atualizar nos arrays principais
        const planIndex = appState.workoutPlans.findIndex(p => p.id === appState.selectedPlan.id);
        if (planIndex >= 0) {
            const workoutIndex = appState.workoutPlans[planIndex].treinos.findIndex(w => w.id == appState.selectedWorkout.id);
            if (workoutIndex >= 0) {
                appState.workoutPlans[planIndex].treinos[workoutIndex] = { ...appState.selectedWorkout };
                appState.selectedPlan = appState.workoutPlans[planIndex];
            }
        }
        
        updateSharedPlan(appState.selectedPlan);
        saveToLocalStorage();
        renderWorkoutDetails();
        
        alert('Exercício excluído com sucesso!');
    } else {
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
            frequencia: formData.get('frequencia'),
            progressao: formData.get('progressao'),
            descanso: formData.get('descanso'),
            hidratacao: formData.get('hidratacao'),
            alimentacao: formData.get('alimentacao'),
            suplementacao: formData.get('suplementacao'),
            sono: formData.get('sono'),
            aquecimento: formData.get('aquecimento'),
            tecnica: formData.get('tecnica'),
            periodizacao: formData.get('periodizacao'),
            consulta: formData.get('consulta')
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

// Função para buscar treino compartilhado
async function importSharedPlan() {
    const shareId = document.getElementById('shareIdInput').value.trim().toUpperCase();
    
    if (!shareId || shareId.length !== 6) {
        alert('Por favor, insira um ID válido de 6 caracteres.');
        return;
    }
    
    showApiStatus('Buscando plano...', 'loading');
    
    try {
        // Tentar buscar do servidor primeiro
        if (appState.serverOnline) {
            const serverResponse = await WorkoutAPI.getFromServer(shareId);
            
            if (serverResponse.success && serverResponse.data && serverResponse.data.plan) {
                const importedPlan = loadPlanFromJSON({ plan: serverResponse.data.plan });
                importedPlan.nome = `${importedPlan.nome} - Compartilhado`;
                
                appState.workoutPlans.push(importedPlan);
                saveToLocalStorage();
                renderPlansList();
                
                showApiStatus('✅ Plano importado do servidor!', 'success');
                document.getElementById('shareIdInput').value = '';
                return;
            }
        }
        
        // Se não encontrou no servidor, buscar localmente
        const sharedPlans = getSharedPlans();
        if (sharedPlans[shareId] && sharedPlans[shareId].plan) {
            const importedPlan = loadPlanFromJSON({ plan: sharedPlans[shareId].plan });
            importedPlan.nome = `${importedPlan.nome} - Compartilhado`;
            
            appState.workoutPlans.push(importedPlan);
            saveToLocalStorage();
            renderPlansList();
            
            showApiStatus('✅ Plano importado do armazenamento local!', 'success');
            document.getElementById('shareIdInput').value = '';
            return;
        }
        
        showApiStatus('❌ Plano não encontrado. Verifique o ID.', 'error');
        
    } catch (error) {
        console.error('Erro ao buscar plano:', error);
        showApiStatus('❌ Erro ao buscar plano. Tente novamente.', 'error');
    }
}

// Função para criar plano ABCDE completo
function createABCDEPlan() {
    const abcdePlan = {
        ...newPlanTemplate,
        id: Date.now(),
        nome: "Plano ABCDE - Hipertrofia",
        dias: 5,
        perfil: {
            idade: 30,
            altura: "1,75m", 
            peso: "75kg",
            porte: "medio",
            objetivo: "Hipertrofia e ganho de massa muscular"
        },
        treinos: [
            { ...workoutTemplates.peito_triceps },
            { ...workoutTemplates.costas_biceps },
            { ...workoutTemplates.ombros_trapezio },
            { ...workoutTemplates.pernas_quadriceps },
            { ...workoutTemplates.posterior_core }
        ]
    };
    
    // Garantir IDs únicos para exercícios
    abcdePlan.treinos.forEach(treino => {
        treino.exercicios.forEach(exercicio => {
            exercicio.id = Date.now() + Math.random();
        });
    });
    
    appState.workoutPlans.push(abcdePlan);
    saveToLocalStorage();
    renderPlansList();
    
    alert('Plano ABCDE criado com sucesso! Personalize as cargas conforme sua necessidade.');
}

// Função para resetar progresso do plano
function resetPlanProgress(planId) {
    if (!confirm('Tem certeza que deseja resetar todo o progresso deste plano?')) {
        return;
    }
    
    const plan = appState.workoutPlans.find(p => p.id === planId);
    if (!plan) return;
    
    plan.treinos.forEach(treino => {
        treino.concluido = false;
        treino.execucoes = 0;
        treino.exercicios.forEach(exercicio => {
            exercicio.concluido = false;
        });
    });
    
    const planIndex = appState.workoutPlans.findIndex(p => p.id === planId);
    if (planIndex >= 0) {
        appState.workoutPlans[planIndex] = plan;
    }
    
    updateSharedPlan(plan);
    saveToLocalStorage();
    
    if (appState.selectedPlan && appState.selectedPlan.id === planId) {
        appState.selectedPlan = plan;
        renderPlanDetails();
    } else {
        renderPlansList();
    }
    
    alert('Progresso do plano resetado com sucesso!');
}

// Função para marcar treino como concluído
function completeWorkout(workoutId) {
    const workout = appState.selectedPlan.treinos.find(w => w.id === workoutId);
    if (!workout) return;
    
    // Marcar todos os exercícios como concluídos
    workout.exercicios.forEach(ex => {
        ex.concluido = true;
    });
    
    workout.concluido = true;
    workout.execucoes = (workout.execucoes || 0) + 1;
    
    // Atualizar no array principal
    const planIndex = appState.workoutPlans.findIndex(p => p.id === appState.selectedPlan.id);
    if (planIndex >= 0) {
        appState.workoutPlans[planIndex] = appState.selectedPlan;
    }
    
    updateSharedPlan(appState.selectedPlan);
    saveToLocalStorage();
    
    alert(`Parabéns! Treino "${workout.nome}" concluído! Esta foi a execução #${workout.execucoes}.`);
    
    if (appState.currentView === 'workoutDetails') {
        renderWorkoutDetails();
    } else {
        renderPlanDetails();
    }
}

// Função para gerar relatório do plano
function generatePlanReport(planId) {
    const plan = appState.workoutPlans.find(p => p.id === planId);
    if (!plan) return;
    
    const totalWorkouts = plan.treinos.length;
    const completedWorkouts = plan.treinos.filter(w => w.concluido).length;
    const totalExercises = plan.treinos.reduce((sum, w) => sum + w.exercicios.length, 0);
    const completedExercises = plan.treinos.reduce((sum, w) => sum + w.exercicios.filter(e => e.concluido).length, 0);
    const totalExecutions = plan.treinos.reduce((sum, w) => sum + (w.execucoes || 0), 0);
    
    const report = {
        planName: plan.nome,
        profile: plan.perfil,
        statistics: {
            totalWorkouts,
            completedWorkouts,
            workoutProgress: Math.round((completedWorkouts / totalWorkouts) * 100),
            totalExercises,
            completedExercises,
            exerciseProgress: Math.round((completedExercises / totalExercises) * 100),
            totalExecutions
        },
        workoutDetails: plan.treinos.map(w => ({
            name: w.nome,
            focus: w.foco,
            exerciseCount: w.exercicios.length,
            completedExercises: w.exercicios.filter(e => e.concluido).length,
            executions: w.execucoes || 0,
            completed: w.concluido
        }))
    };
    
    // Gerar e baixar relatório
    const reportText = `
RELATÓRIO DE TREINO - ${report.planName}
================================================

PERFIL DO ATLETA:
- Idade: ${report.profile.idade} anos
- Altura: ${report.profile.altura}
- Peso: ${report.profile.peso}
- Objetivo: ${report.profile.objetivo}

ESTATÍSTICAS GERAIS:
- Treinos Totais: ${report.statistics.totalWorkouts}
- Treinos Concluídos: ${report.statistics.completedWorkouts} (${report.statistics.workoutProgress}%)
- Exercícios Totais: ${report.statistics.totalExercises}
- Exercícios Concluídos: ${report.statistics.completedExercises} (${report.statistics.exerciseProgress}%)
- Total de Execuções: ${report.statistics.totalExecutions}

DETALHES POR TREINO:
${report.workoutDetails.map(w => `
• ${w.name}
  - Foco: ${w.focus}
  - Exercícios: ${w.completedExercises}/${w.exerciseCount}
  - Execuções: ${w.executions}
  - Status: ${w.completed ? 'Concluído' : 'Pendente'}
`).join('')}

Relatório gerado em: ${new Date().toLocaleString('pt-BR')}
    `.trim();
    
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `relatorio-${plan.nome.toLowerCase().replace(/\s+/g, '-')}.txt`;
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    URL.revokeObjectURL(url);
    
    alert('Relatório gerado e baixado com sucesso!');
}

// Função para configurar lembrete de treino (usando Notification API)
function setupWorkoutReminder() {
    if (!('Notification' in window)) {
        alert('Seu navegador não suporta notificações.');
        return;
    }
    
    if (Notification.permission === 'granted') {
        scheduleReminder();
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                scheduleReminder();
            }
        });
    }
}

function scheduleReminder() {
    const time = prompt('Em quantos minutos você gostaria de ser lembrado? (Digite apenas o número):');
    const minutes = parseInt(time);
    
    if (isNaN(minutes) || minutes <= 0) {
        alert('Por favor, digite um número válido de minutos.');
        return;
    }
    
    setTimeout(() => {
        new Notification('JS Fit App - Hora do Treino! 💪', {
            body: 'Não esqueça de fazer seu treino hoje!',
            icon: '/favicon.ico',
            tag: 'workout-reminder'
        });
    }, minutes * 60 * 1000);
    
    alert(`Lembrete configurado para ${minutes} minutos!`);
}

// Event listeners globais
document.addEventListener('keydown', function(e) {
    // ESC para voltar
    if (e.key === 'Escape' && appState.viewHistory.length > 0) {
        goBack();
    }
    
    // Ctrl+S para salvar (previne comportamento padrão)
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        
        switch (appState.currentView) {
            case 'editPlan':
                savePlan();
                break;
            case 'editWorkout':
                saveWorkout();
                break;
            case 'editExercise':
                saveExercise();
                break;
        }
    }
});

// Função para salvar automaticamente (autosave)
let autosaveTimer;

function enableAutosave() {
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
        saveToLocalStorage();
        console.log('[Autosave] Dados salvos automaticamente');
    }, 30000); // Salvar a cada 30 segundos
}

// Chamar autosave sempre que houver mudanças
function triggerAutosave() {
    enableAutosave();
}

// Função para fazer backup dos dados
function backupData() {
    try {
        const backupData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            workoutPlans: appState.workoutPlans,
            sharedPlans: getSharedPlans()
        };
        
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `backup-jsfitapp-${new Date().toISOString().split('T')[0]}.json`;
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        URL.revokeObjectURL(url);
        
        alert('Backup criado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao criar backup:', error);
        alert('Erro ao criar backup. Tente novamente.');
    }
}

// Função para restaurar backup
function restoreBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!confirm('Tem certeza que deseja restaurar este backup? Todos os dados atuais serão substituídos.')) {
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            
            if (backupData.workoutPlans) {
                appState.workoutPlans = backupData.workoutPlans;
                saveToLocalStorage();
            }
            
            if (backupData.sharedPlans) {
                localStorage.setItem('sharedWorkoutPlans', JSON.stringify(backupData.sharedPlans));
            }
            
            renderPlansList();
            alert('Backup restaurado com sucesso!');
            
        } catch (error) {
            console.error('Erro ao restaurar backup:', error);
            alert('Erro ao restaurar backup. Verifique se o arquivo está correto.');
        }
    };
    
    reader.readAsText(file);
    event.target.value = '';
}

// Inicializar autosave
document.addEventListener('DOMContentLoaded', function() {
    enableAutosave();
});

// Adicionar CSS dinâmico para melhor experiência
const dynamicStyles = `
    .exercise-item.completed {
        background-color: #f0f9ff;
        border-left: 4px solid #34c759;
    }
    
    .workout-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 12px;
        margin: 16px 0;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
    }
    
    .stat-item {
        text-align: center;
    }
    
    .stat-label {
        display: block;
        font-size: 12px;
        color: #8e8e93;
        margin-bottom: 4px;
    }
    
    .stat-value {
        display: block;
        font-size: 16px;
        font-weight: 600;
        color: #1d1d1f;
    }
    
    .plan-profile-info {
        background: #f8f9fa;
        padding: 16px;
        border-radius: 8px;
        margin: 16px 0;
    }
    
    .plan-profile-info h3 {
        margin: 0 0 12px 0;
        font-size: 16px;
        color: #1d1d1f;
    }
    
    .plan-profile-info p {
        margin: 8px 0;
        font-size: 14px;
        color: #3a3a3c;
    }
    
    .template-item {
        padding: 16px;
        border: 1px solid #d1d1d6;
        border-radius: 8px;
        margin-bottom: 12px;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .template-item:hover {
        background: #f8f9fa;
        border-color: #007aff;
    }
    
    .template-name {
        font-weight: 600;
        margin-bottom: 4px;
    }
    
    .template-description {
        font-size: 14px;
        color: #8e8e93;
        margin-bottom: 4px;
    }
    
    .template-count {
        font-size: 12px;
        color: #007aff;
    }
    
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .modal-content {
        background: white;
        border-radius: 12px;
        padding: 0;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    
    .modal-header {
        padding: 20px;
        border-bottom: 1px solid #d1d1d6;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-header h2 {
        margin: 0;
        font-size: 18px;
    }
    
    .close-btn {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #8e8e93;
    }
    
    .modal-body {
        padding: 20px;
        overflow-y: auto;
    }
    
    .exercise-order {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #007aff;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
        flex-shrink: 0;
    }
    
    .plan-profile, .plan-objective {
        font-size: 12px;
        color: #8e8e93;
        margin-top: 4px;
    }
    
    .plan-objective {
        font-weight: 500;
        color: #007aff;
    }
    
    .exercise-description {
        font-size: 12px;
        color: #8e8e93;
        margin-top: 4px;
        font-style: italic;
    }
    
    .plan-stats {
        font-size: 12px;
        color: #8e8e93;
        margin-top: 4px;
    }
    
    .plan-stats span {
        margin-right: 12px;
    }
`;

// Adicionar os estilos ao documento
const styleSheet = document.createElement('style');
styleSheet.textContent = dynamicStyles;
document.head.appendChild(styleSheet);