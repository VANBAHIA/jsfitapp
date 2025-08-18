/**
 * Classe principal da aplicação JS Fit App Personal - Versão Simplificada
 * @module App
 */

/**
 * Configurações básicas da aplicação
 */
const APP_CONFIG = {
    name: 'JS Fit App Personal',
    version: '1.0.0',
    defaultPlanDuration: 180
};

const STORAGE_KEYS = {
    plans: 'jsfitapp_plans',
    sharedPlans: 'jsfitapp_shared_plans'
};

/**
 * Classe principal da aplicação
 */
export class App {
    constructor() {
        this.currentView = 'planList';
        this.initialized = false;
        this.currentPlanId = null;
        this.plans = [];
        this.currentWorkouts = [];
        
        // Bind methods
        this.showPlanCreator = this.showPlanCreator.bind(this);
        this.showAIPlanCreator = this.showAIPlanCreator.bind(this);
        this.showPlanList = this.showPlanList.bind(this);
        this.savePlan = this.savePlan.bind(this);
        this.generateAIPlan = this.generateAIPlan.bind(this);
        this.importPlan = this.importPlan.bind(this);
    }

    /**
     * Inicializa a aplicação
     */
    async init() {
        try {
            console.log(`Inicializando ${APP_CONFIG.name} v${APP_CONFIG.version}`);
            
            // Carregar dados salvos
            this.loadPlans();
            
            // Configurar formulários
            this.setupForms();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Mostrar view inicial
            this.showPlanList();
            
            this.initialized = true;
            console.log('✅ Aplicação inicializada com sucesso');
            
        } catch (error) {
            console.error('Erro na inicialização:', error);
            throw error;
        }
    }

    /**
     * Carrega planos do localStorage
     */
    loadPlans() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.plans);
            this.plans = saved ? JSON.parse(saved) : [];
            console.log(`${this.plans.length} planos carregados`);
        } catch (error) {
            console.error('Erro ao carregar planos:', error);
            this.plans = [];
        }
    }

    /**
     * Salva planos no localStorage
     */
    savePlansToStorage() {
        try {
            localStorage.setItem(STORAGE_KEYS.plans, JSON.stringify(this.plans));
            return true;
        } catch (error) {
            console.error('Erro ao salvar planos:', error);
            return false;
        }
    }

    /**
     * Configura formulários
     */
    setupForms() {
        // Configurar datas padrão
        const today = new Date().toISOString().split('T')[0];
        const sixMonthsLater = new Date();
        sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
        const endDate = sixMonthsLater.toISOString().split('T')[0];
        
        const startInput = document.getElementById('planStartDate');
        const endInput = document.getElementById('planEndDate');
        
        if (startInput && !startInput.value) startInput.value = today;
        if (endInput && !endInput.value) endInput.value = endDate;
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // CPF mask
        const cpfInputs = document.querySelectorAll('#studentCpf, #aiStudentCpf');
        cpfInputs.forEach(input => {
            input.addEventListener('input', this.maskCPF.bind(this));
        });
    }

    /**
     * Máscara para CPF
     */
    maskCPF(e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = value;
    }

    /**
     * Mostra criador de planos manual
     */
    showPlanCreator(planId = null) {
        this.currentView = 'planCreator';
        
        // Esconder outras views
        this.hideAllViews();
        document.getElementById('planCreator').style.display = 'block';
        
        if (planId) {
            // Modo edição
            this.loadPlanForEdit(planId);
        } else {
            // Modo criação
            this.clearForm();
            this.selectPlanType(3, 'ABC'); // Padrão 3 dias
        }
    }

    /**
     * Mostra criador de planos com IA
     */
    showAIPlanCreator() {
        this.currentView = 'aiPlanCreator';
        
        this.hideAllViews();
        document.getElementById('aiPlanCreator').style.display = 'block';
        
        // Limpar formulário de IA
        this.clearAIForm();
    }

    /**
     * Mostra lista de planos
     */
    showPlanList() {
        this.currentView = 'planList';
        
        this.hideAllViews();
        document.getElementById('planList').style.display = 'block';
        
        // Atualizar lista
        this.renderPlanList();
    }

    /**
     * Esconde todas as views
     */
    hideAllViews() {
        const views = ['planList', 'planCreator', 'aiPlanCreator'];
        views.forEach(viewId => {
            const view = document.getElementById(viewId);
            if (view) {
                view.style.display = 'none';
            }
        });
    }

    /**
     * Renderiza lista de planos
     */
    renderPlanList() {
        const container = document.getElementById('planListContent');
        if (!container) return;

        if (this.plans.length === 0) {
            container.innerHTML = `
                <div class="plan-card">
                    <h3>🎯 Nenhum plano encontrado</h3>
                    <p>Crie seu primeiro plano de treino clicando em "Novo Plano" ou "Criar com IA"!</p>
                    <div style="margin-top: 15px;">
                        <button class="btn btn-primary" onclick="app.showPlanCreator()">
                            ➕ Criar Primeiro Plano
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        const plansHTML = this.plans.map(plan => `
            <div class="plan-card">
                <div class="plan-header">
                    <h3>${plan.nome || 'Plano sem nome'}</h3>
                    <div class="plan-actions">
                        <button class="btn btn-small btn-outline" onclick="app.editPlan('${plan.id}')">
                            ✏️ Editar
                        </button>
                        <button class="btn btn-small btn-success" onclick="app.sharePlan('${plan.id}')">
                            📤 Compartilhar
                        </button>
                        <button class="btn btn-small btn-danger" onclick="app.deletePlan('${plan.id}')">
                            🗑️ Excluir
                        </button>
                    </div>
                </div>
                <div class="plan-info">
                    <p><strong>👤 Aluno:</strong> ${plan.aluno?.nome || 'Não informado'}</p>
                    <p><strong>🎯 Objetivo:</strong> ${plan.perfil?.objetivo || 'Não especificado'}</p>
                    <p><strong>📅 Período:</strong> ${this.formatDate(plan.dataInicio)} - ${this.formatDate(plan.dataFim)}</p>
                    <p><strong>💪 Treinos:</strong> ${plan.dias || 0} dias por semana</p>
                </div>
            </div>
        `).join('');

        container.innerHTML = plansHTML;
    }

    /**
     * Seleciona tipo de plano (número de dias)
     */
    selectPlanType(days, letters, buttonElement = null) {
        // Atualizar botões ativos
        if (buttonElement) {
            document.querySelectorAll('.plan-type-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            buttonElement.classList.add('active');
        }

        // Gerar treinos para o número de dias
        this.generateWorkouts(days);
        
        this.showMessage(`Plano configurado para ${days} dias por semana`, 'info');
    }

    /**
     * Gera treinos baseado no número de dias
     */
    generateWorkouts(days) {
        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        const workouts = [];

        for (let i = 0; i < days; i++) {
            workouts.push({
                id: letters[i],
                nome: `Treino ${letters[i]}`,
                foco: 'Treino geral',
                exercicios: [{
                    nome: 'Aquecimento',
                    series: 1,
                    repeticoes: '8-10 min',
                    carga: 'Leve',
                    descanso: '0',
                    descricao: 'Aquecimento geral de 5-10 minutos'
                }]
            });
        }

        this.currentWorkouts = workouts;
        this.renderWorkoutEditor();
    }

    /**
     * Renderiza editor de treinos
     */
    renderWorkoutEditor() {
        const container = document.getElementById('workoutEditor');
        if (!container) return;

        const workoutsHTML = this.currentWorkouts.map((workout, workoutIndex) => `
            <div class="workout-section">
                <div class="workout-header">
                    <h3>💪 ${workout.nome}</h3>
                    <input type="text" value="${workout.foco}" 
                           onchange="app.updateWorkoutFocus(${workoutIndex}, this.value)"
                           placeholder="Foco do treino">
                </div>
                <div class="exercises-list">
                    ${workout.exercicios.map((exercise, exerciseIndex) => `
                        <div class="exercise-item">
                            <div class="exercise-info">
                                <strong>${exercise.nome}</strong>
                                <span>${exercise.series}x ${exercise.repeticoes} - ${exercise.carga}</span>
                            </div>
                            <div class="exercise-actions">
                                <button class="btn btn-small btn-outline" 
                                        onclick="app.editExercise(${workoutIndex}, ${exerciseIndex})">
                                    ✏️ Editar
                                </button>
                                <button class="btn btn-small btn-danger" 
                                        onclick="app.removeExercise(${workoutIndex}, ${exerciseIndex})">
                                    ❌ Remover
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="btn btn-outline" onclick="app.addExercise(${workoutIndex})">
                    ➕ Adicionar Exercício
                </button>
            </div>
        `).join('');

        container.innerHTML = workoutsHTML;
    }

    /**
     * Salva plano
     */
    savePlan() {
        try {
            const planData = this.getFormData();
            
            if (!this.validatePlan(planData)) {
                return;
            }

            const plan = {
                id: this.currentPlanId || Date.now(),
                ...planData,
                treinos: this.currentWorkouts,
                createdAt: this.currentPlanId ? this.getCurrentPlan()?.createdAt : new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            if (this.currentPlanId) {
                // Atualizar plano existente
                const index = this.plans.findIndex(p => p.id == this.currentPlanId);
                if (index !== -1) {
                    this.plans[index] = plan;
                }
            } else {
                // Adicionar novo plano
                this.plans.push(plan);
            }

            this.savePlansToStorage();
            this.showMessage('✅ Plano salvo com sucesso!', 'success');
            
            setTimeout(() => {
                this.showPlanList();
            }, 1500);

        } catch (error) {
            console.error('Erro ao salvar plano:', error);
            this.showMessage('❌ Erro ao salvar plano', 'error');
        }
    }

    /**
     * Obtém dados do formulário
     */
    getFormData() {
        return {
            nome: document.getElementById('planName')?.value || '',
            aluno: {
                nome: document.getElementById('studentName')?.value || '',
                dataNascimento: document.getElementById('studentBirthDate')?.value || '',
                cpf: document.getElementById('studentCpf')?.value || '',
                altura: document.getElementById('studentHeight')?.value || '1,75m',
                peso: document.getElementById('studentWeight')?.value || '75kg'
            },
            perfil: {
                objetivo: document.getElementById('planObjective')?.value || 'Condicionamento geral'
            },
            dataInicio: document.getElementById('planStartDate')?.value || '',
            dataFim: document.getElementById('planEndDate')?.value || '',
            observacoes: {
                geral: document.getElementById('planObservations')?.value || ''
            },
            dias: this.currentWorkouts.length
        };
    }

    /**
     * Valida dados do plano
     */
    validatePlan(planData) {
        const errors = [];

        if (!planData.nome.trim()) {
            errors.push('Nome do plano é obrigatório');
        }

        if (!planData.aluno.nome.trim()) {
            errors.push('Nome do aluno é obrigatório');
        }

        if (errors.length > 0) {
            this.showMessage('❌ ' + errors.join('<br>'), 'error');
            return false;
        }

        return true;
    }

    /**
     * Gera plano com IA (simulado)
     */
    async generateAIPlan() {
        try {
            this.showGeneratingIndicator();
            
            // Simular delay da IA
            await this.sleep(3000);
            
            const aiData = this.getAIFormData();
            const generatedPlan = this.simulateAIGeneration(aiData);
            
            // Criar o plano
            this.plans.push(generatedPlan);
            this.savePlansToStorage();
            
            this.hideGeneratingIndicator();
            this.showMessage('🤖 ✅ Plano criado com IA com sucesso!', 'success');
            
            setTimeout(() => {
                this.showPlanList();
            }, 2000);

        } catch (error) {
            this.hideGeneratingIndicator();
            console.error('Erro ao gerar plano com IA:', error);
            this.showMessage('❌ Erro ao gerar plano com IA', 'error');
        }
    }

    /**
     * Simula geração de plano com IA
     */
    simulateAIGeneration(aiData) {
        const workoutTemplates = this.getWorkoutTemplates(aiData.objective, aiData.days);
        
        return {
            id: Date.now(),
            nome: `Plano ${aiData.objective} - ${aiData.studentName}`,
            aluno: {
                nome: aiData.studentName,
                dataNascimento: aiData.birthDate,
                altura: aiData.height,
                peso: aiData.weight
            },
            perfil: {
                objetivo: aiData.objective
            },
            dataInicio: new Date().toISOString().split('T')[0],
            dataFim: this.getEndDate(6), // 6 meses
            treinos: workoutTemplates,
            dias: aiData.days,
            observacoes: {
                geral: `Plano gerado automaticamente com IA para ${aiData.objective.toLowerCase()}`
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    /**
     * Obtém templates de treino baseado no objetivo
     */
    getWorkoutTemplates(objective, days) {
        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        const templates = [];

        for (let i = 0; i < days; i++) {
            templates.push({
                id: letters[i],
                nome: `Treino ${letters[i]}`,
                foco: this.getWorkoutFocus(i, objective),
                exercicios: this.getExerciseTemplate(i, objective)
            });
        }

        return templates;
    }

    /**
     * Obtém foco do treino baseado no dia e objetivo
     */
    getWorkoutFocus(day, objective) {
        const focuses = {
            'Hipertrofia e ganho de massa muscular': [
                'Peito e Tríceps',
                'Costas e Bíceps',
                'Pernas e Glúteos',
                'Ombros e Abdomen',
                'Membros Superiores',
                'Membros Inferiores'
            ],
            'Condicionamento geral': [
                'Corpo Todo',
                'Cardio e Força',
                'Funcional',
                'Resistência',
                'Mobilidade',
                'Core'
            ]
        };

        return focuses[objective]?.[day] || 'Treino Geral';
    }

    /**
     * Obtém template de exercícios
     */
    getExerciseTemplate(day, objective) {
        // Templates básicos de exercícios
        const basicExercises = [
            {
                nome: 'Aquecimento',
                series: 1,
                repeticoes: '10 min',
                carga: 'Leve',
                descanso: '0',
                descricao: 'Aquecimento articular e cardio leve'
            },
            {
                nome: 'Exercício Principal',
                series: 4,
                repeticoes: '8-12',
                carga: '70% 1RM',
                descanso: '90s',
                descricao: 'Exercício principal do dia'
            },
            {
                nome: 'Exercício Auxiliar 1',
                series: 3,
                repeticoes: '10-15',
                carga: 'Moderada',
                descanso: '60s',
                descricao: 'Exercício auxiliar'
            },
            {
                nome: 'Exercício Auxiliar 2',
                series: 3,
                repeticoes: '12-15',
                carga: 'Leve a moderada',
                descanso: '45s',
                descricao: 'Exercício de finalização'
            }
        ];

        return basicExercises;
    }

    /**
     * Obtém dados do formulário de IA
     */
    getAIFormData() {
        return {
            studentName: document.getElementById('aiStudentName')?.value || '',
            birthDate: document.getElementById('aiStudentBirthDate')?.value || '',
            height: document.getElementById('aiStudentHeight')?.value || '1,75m',
            weight: document.getElementById('aiStudentWeight')?.value || '75kg',
            objective: document.getElementById('aiPlanObjective')?.value || 'Condicionamento geral',
            days: parseInt(document.getElementById('aiAvailableDays')?.value) || 3
        };
    }

    /**
     * Mostra indicador de geração
     */
    showGeneratingIndicator() {
        const indicator = document.getElementById('generatingIndicator');
        if (indicator) {
            indicator.style.display = 'block';
            
            // Simular progresso
            const progressBar = document.getElementById('progressFill');
            if (progressBar) {
                let progress = 0;
                const interval = setInterval(() => {
                    progress += Math.random() * 20;
                    if (progress > 90) progress = 90;
                    progressBar.style.width = progress + '%';
                }, 200);
                
                // Completar após 3 segundos
                setTimeout(() => {
                    clearInterval(interval);
                    progressBar.style.width = '100%';
                }, 2800);
            }
        }
    }

    /**
     * Esconde indicador de geração
     */
    hideGeneratingIndicator() {
        const indicator = document.getElementById('generatingIndicator');
        if (indicator) {
            indicator.style.display = 'none';
            
            const progressBar = document.getElementById('progressFill');
            if (progressBar) {
                progressBar.style.width = '0%';
            }
        }
    }

    /**
     * Importa plano de arquivo
     */
    async importPlan(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        try {
            for (const file of files) {
                const text = await file.text();
                const data = JSON.parse(text);
                
                // Validar estrutura básica
                if (data.nome && data.aluno) {
                    data.id = Date.now() + Math.random();
                    data.nome = data.nome + ' (Importado)';
                    
                    this.plans.push(data);
                    this.savePlansToStorage();
                    
                    this.showMessage('✅ Plano importado com sucesso!', 'success');
                } else {
                    this.showMessage('❌ Arquivo não é um plano válido', 'error');
                }
            }
            
            this.renderPlanList();
            
        } catch (error) {
            console.error('Erro na importação:', error);
            this.showMessage('❌ Erro ao importar arquivo', 'error');
        }
        
        // Limpar input
        event.target.value = '';
    }

    /**
     * Edita plano existente
     */
    editPlan(planId) {
        this.showPlanCreator(planId);
    }

    /**
     * Carrega plano para edição
     */
    loadPlanForEdit(planId) {
        const plan = this.plans.find(p => p.id == planId);
        if (!plan) return;

        this.currentPlanId = planId;
        
        // Preencher formulário
        this.fillForm(plan);
        
        // Carregar treinos
        this.currentWorkouts = plan.treinos || [];
        this.renderWorkoutEditor();
        
        // Mostrar botão cancelar
        const cancelBtn = document.getElementById('cancelEditBtn');
        if (cancelBtn) {
            cancelBtn.style.display = 'inline-block';
        }
        
        this.showMessage('📝 Modo de edição ativado', 'info');
    }

    /**
     * Preenche formulário com dados do plano
     */
    fillForm(plan) {
        const fields = [
            { id: 'planName', value: plan.nome },
            { id: 'studentName', value: plan.aluno?.nome },
            { id: 'studentBirthDate', value: plan.aluno?.dataNascimento },
            { id: 'studentCpf', value: plan.aluno?.cpf },
            { id: 'studentHeight', value: plan.aluno?.altura },
            { id: 'studentWeight', value: plan.aluno?.peso },
            { id: 'planObjective', value: plan.perfil?.objetivo },
            { id: 'planStartDate', value: plan.dataInicio },
            { id: 'planEndDate', value: plan.dataFim },
            { id: 'planObservations', value: plan.observacoes?.geral }
        ];

        fields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element && field.value) {
                element.value = field.value;
            }
        });
    }

    /**
     * Cancela edição
     */
    cancelEdit() {
        this.currentPlanId = null;
        this.currentWorkouts = [];
        
        const cancelBtn = document.getElementById('cancelEditBtn');
        if (cancelBtn) {
            cancelBtn.style.display = 'none';
        }
        
        this.showPlanList();
    }

    /**
     * Compartilha plano (simulado)
     */
    async sharePlan(planId) {
        const plan = this.plans.find(p => p.id == planId);
        if (!plan) return;

        try {
            // Simular compartilhamento
            const shareId = this.generateShareId();
            
            // Salvar compartilhamento localmente
            const sharedPlans = JSON.parse(localStorage.getItem(STORAGE_KEYS.sharedPlans) || '{}');
            sharedPlans[shareId] = {
                ...plan,
                sharedAt: new Date().toISOString(),
                originalId: plan.id
            };
            localStorage.setItem(STORAGE_KEYS.sharedPlans, JSON.stringify(sharedPlans));
            
            // Gerar URL do WhatsApp
            const whatsappUrl = this.generateWhatsAppUrl(shareId, plan);
            
            // Mostrar modal de sucesso
            this.showShareModal(shareId, whatsappUrl);
            
        } catch (error) {
            console.error('Erro ao compartilhar:', error);
            this.showMessage('❌ Erro ao compartilhar plano', 'error');
        }
    }

    /**
     * Gera ID de compartilhamento
     */
    generateShareId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Gera URL do WhatsApp
     */
    generateWhatsAppUrl(shareId, plan) {
        const message = `🏋️ *${plan.nome}*\n\n` +
                       `Olá ${plan.aluno?.nome}! Seu plano de treino está pronto!\n\n` +
                       `📱 Para importar:\n` +
                       `1. Abra o JS Fit App (Aluno)\n` +
                       `2. Clique em "Importar por ID"\n` +
                       `3. Digite o código: *${shareId}*\n\n` +
                       `💪 Bons treinos!`;
        
        return `https://wa.me/?text=${encodeURIComponent(message)}`;
    }

    /**
     * Mostra modal de compartilhamento
     */
    showShareModal(shareId, whatsappUrl) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📤 Plano Compartilhado com Sucesso!</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div style="padding: 20px; text-align: center;">
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>🔑 ID de Compartilhamento</h3>
                        <div style="font-size: 24px; font-weight: bold; color: #7945ff; margin: 10px 0;">
                            ${shareId}
                        </div>
                        <button class="btn btn-outline" onclick="navigator.clipboard.writeText('${shareId}')">
                            📋 Copiar ID
                        </button>
                    </div>
                    
                    <div style="margin: 20px 0;">
                        <a href="${whatsappUrl}" target="_blank" class="btn btn-success">
                            📱 Enviar via WhatsApp
                        </a>
                    </div>
                    
                    <div style="font-size: 0.9rem; color: #666; margin-top: 20px;">
                        <p>O aluno pode usar este ID para importar o plano no app do aluno.</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * Exclui plano
     */
    deletePlan(planId) {
        if (!confirm('Tem certeza que deseja excluir este plano?')) {
            return;
        }

        const index = this.plans.findIndex(p => p.id == planId);
        if (index !== -1) {
            this.plans.splice(index, 1);
            this.savePlansToStorage();
            this.renderPlanList();
            this.showMessage('🗑️ Plano excluído com sucesso', 'success');
        }
    }

    /**
     * Adiciona exercício ao treino
     */
    addExercise(workoutIndex) {
        if (!this.currentWorkouts[workoutIndex]) return;

        const newExercise = {
            nome: 'Novo Exercício',
            series: 3,
            repeticoes: '10-12',
            carga: '20kg',
            descanso: '90s',
            descricao: 'Descrição do exercício'
        };

        this.currentWorkouts[workoutIndex].exercicios.push(newExercise);
        this.renderWorkoutEditor();
        
        // Editar o novo exercício imediatamente
        const exerciseIndex = this.currentWorkouts[workoutIndex].exercicios.length - 1;
        this.editExercise(workoutIndex, exerciseIndex);
    }

    /**
     * Remove exercício do treino
     */
    removeExercise(workoutIndex, exerciseIndex) {
        if (!confirm('Remover este exercício?')) return;

        if (this.currentWorkouts[workoutIndex]?.exercicios[exerciseIndex]) {
            this.currentWorkouts[workoutIndex].exercicios.splice(exerciseIndex, 1);
            this.renderWorkoutEditor();
            this.showMessage('Exercício removido', 'info');
        }
    }

    /**
     * Edita exercício
     */
    editExercise(workoutIndex, exerciseIndex) {
        const exercise = this.currentWorkouts[workoutIndex]?.exercicios[exerciseIndex];
        if (!exercise) return;

        this.currentEditingExercise = { workoutIndex, exerciseIndex };
        
        // Preencher modal de exercício
        document.getElementById('exerciseName').value = 'custom';
        document.getElementById('customExerciseName').value = exercise.nome || '';
        document.getElementById('exerciseSets').value = exercise.series || 3;
        document.getElementById('exerciseReps').value = exercise.repeticoes || '10-12';
        document.getElementById('exerciseWeight').value = exercise.carga || '20kg';
        document.getElementById('exerciseRest').value = exercise.descanso || '90s';
        document.getElementById('exerciseDescription').value = exercise.descricao || '';

        // Mostrar campos personalizados
        document.getElementById('customExerciseGroup').style.display = 'block';
        
        // Mostrar modal
        document.getElementById('exerciseModal').style.display = 'block';
    }

    /**
     * Salva exercício editado
     */
    saveExercise() {
        if (!this.currentEditingExercise) return;

        const { workoutIndex, exerciseIndex } = this.currentEditingExercise;
        const exercise = this.currentWorkouts[workoutIndex]?.exercicios[exerciseIndex];
        
        if (exercise) {
            const exerciseName = document.getElementById('exerciseName').value;
            
            exercise.nome = exerciseName === 'custom' ? 
                          document.getElementById('customExerciseName').value : 
                          exerciseName;
            exercise.series = parseInt(document.getElementById('exerciseSets').value) || 3;
            exercise.repeticoes = document.getElementById('exerciseReps').value || '10-12';
            exercise.carga = document.getElementById('exerciseWeight').value || '20kg';
            exercise.descanso = document.getElementById('exerciseRest').value || '90s';
            exercise.descricao = document.getElementById('exerciseDescription').value || '';

            this.renderWorkoutEditor();
            this.closeExerciseModal();
            this.showMessage('✅ Exercício atualizado', 'success');
        }
    }

    /**
     * Fecha modal de exercício
     */
    closeExerciseModal() {
        document.getElementById('exerciseModal').style.display = 'none';
        this.currentEditingExercise = null;
    }

    /**
     * Atualiza foco do treino
     */
    updateWorkoutFocus(workoutIndex, newFocus) {
        if (this.currentWorkouts[workoutIndex]) {
            this.currentWorkouts[workoutIndex].foco = newFocus;
        }
    }

    /**
     * Limpa formulário
     */
    clearForm() {
        const inputs = document.querySelectorAll('#planCreator input, #planCreator textarea, #planCreator select');
        inputs.forEach(input => {
            if (input.type !== 'date') {
                input.value = '';
            }
        });
        
        this.currentPlanId = null;
        this.currentWorkouts = [];
        
        const cancelBtn = document.getElementById('cancelEditBtn');
        if (cancelBtn) {
            cancelBtn.style.display = 'none';
        }
    }

    /**
     * Limpa formulário de IA
     */
    clearAIForm() {
        const inputs = document.querySelectorAll('#aiPlanCreator input, #aiPlanCreator textarea, #aiPlanCreator select');
        inputs.forEach(input => {
            if (input.type !== 'date' && input.tagName !== 'SELECT') {
                input.value = '';
            }
        });
    }

    /**
     * Fecha todos os modais
     */
    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        
        this.currentEditingExercise = null;
    }

    /**
     * Obtém plano atual
     */
    getCurrentPlan() {
        if (!this.currentPlanId) return null;
        return this.plans.find(p => p.id == this.currentPlanId);
    }

    /**
     * Verifica se há mudanças não salvas
     */
    hasUnsavedChanges() {
        // Implementação simples - pode ser expandida
        return false;
    }

    /**
     * Manipula salvamento (Ctrl+S)
     */
    handleSave() {
        if (this.currentView === 'planCreator') {
            this.savePlan();
        }
    }

    /**
     * Mostra mensagem
     */
    showMessage(message, type = 'info') {
        const colors = {
            success: '#2ed573',
            error: '#ff4757',
            warning: '#ffa502',
            info: '#5352ed'
        };

        const messageEl = document.createElement('div');
        messageEl.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${colors[type]};
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                z-index: 10000;
                font-family: Arial, sans-serif;
                max-width: 400px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                animation: slideIn 0.3s ease;
            ">
                ${message}
            </div>
            <style>
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
        `;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            if (messageEl.parentElement) {
                messageEl.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => messageEl.remove(), 300);
            }
        }, 4000);
    }

    /**
     * Formata data
     */
    formatDate(dateString) {
        if (!dateString) return 'Não definido';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    /**
     * Obtém data de fim baseada em meses
     */
    getEndDate(months) {
        const date = new Date();
        date.setMonth(date.getMonth() + months);
        return date.toISOString().split('T')[0];
    }

    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Obtém informações de debug
     */
    getDebugInfo() {
        return {
            version: APP_CONFIG.version,
            currentView: this.currentView,
            initialized: this.initialized,
            totalPlans: this.plans.length,
            currentPlanId: this.currentPlanId
        };
    }
}