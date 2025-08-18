// personal.js - SISTEMA COMPLETO FUNCIONAL - JS Fit App v2.1.0

const app = {
    // ✅ Configurações da API
    apiConfig: {
        baseUrl: window.location.hostname === 'localhost' ? 
            'http://localhost:8888/api' : 
            'https://jsfitapp.netlify.app/api',
        timeout: 10000,
        retries: 3,
        endpoints: {
            share: '/share',
            plans: '/plans',
            health: '/health'
        }
    },

    // ✅ Sistema de autenticação temporário
    authState: {
        isAuthenticated: false,
        token: null,
        user: null
    },

    // Estado do compartilhamento
    sharingState: {
        isSharing: false,
        currentShareId: null,
        lastSharedPlan: null
    },

    // Estado da aplicação
    currentPlan: {
        id: null,
        nome: '',
        aluno: { nome: '', idade: 25, altura: '1,75m', peso: '75kg' },
        dias: 1,
        dataInicio: '',
        dataFim: '',
        perfil: { objetivo: 'Hipertrofia e ganho de massa muscular' },
        observacoes: {},
        treinos: []
    },

    savedPlans: [],
    currentExerciseIndex: null,
    currentWorkoutIndex: null,
    selectedDays: 1,
    isEditing: false,

    // ✅ BANCO DE DADOS DE EXERCÍCIOS
    exerciseDatabase: {
        "Supino Reto com Barra": {
            description: "Deite-se no banco, posicione a barra na altura do peito. Empurre para cima até a extensão completa dos braços.",
            equipment: "Barra e anilhas"
        },
        "Supino Inclinado com Barra": {
            description: "No banco inclinado (30-45°), empurre a barra do peito para cima, focando na parte superior do peitoral.",
            equipment: "Banco inclinado, barra"
        },
        "Puxada Frontal": {
            description: "Sentado, puxe a barra em direção ao peito, contraindo as escápulas. Controle a subida.",
            equipment: "Pulley alto"
        },
        "Agachamento Livre": {
            description: "Com a barra nas costas, desça mantendo o tronco ereto até as coxas ficarem paralelas ao chão.",
            equipment: "Barra e anilhas"
        },
        "Rosca Direta": {
            description: "Em pé, flexione os cotovelos levando a barra em direção ao peito, mantendo os cotovelos fixos.",
            equipment: "Barra W ou reta"
        },
        "Tríceps Pulley": {
            description: "De frente para o pulley, empurre a corda/barra para baixo estendendo completamente os braços.",
            equipment: "Pulley alto com corda"
        },
        "Leg Press": {
            description: "Sentado no aparelho, empurre a plataforma com os pés, mantendo os joelhos alinhados.",
            equipment: "Leg Press"
        },
        "Panturrilha em Pé": {
            description: "Em pé no aparelho, eleve-se na ponta dos pés contraindo a panturrilha, desça controladamente.",
            equipment: "Aparelho de panturrilha"
        }
    },

    // ✅ SISTEMA DE TOKEN TEMPORÁRIO
    async getOrCreateToken() {
        const storedToken = localStorage.getItem('jsfitapp_temp_token');
        if (storedToken) {
            this.authState.token = storedToken;
            this.authState.isAuthenticated = true;
            return storedToken;
        }

        const tempToken = 'temp_' + Date.now() + '_' + Math.random();
        localStorage.setItem('jsfitapp_temp_token', tempToken);
        
        this.authState.token = tempToken;
        this.authState.isAuthenticated = true;
        this.authState.user = {
            id: 'temp_user_' + Date.now(),
            email: 'personal@example.com',
            name: 'Personal Trainer Demo'
        };
        
        return tempToken;
    },

    // ✅ REQUISIÇÕES COM AUTENTICAÇÃO
    async makeAPIRequest(url, options = {}) {
        if (!this.authState.token) {
            await this.getOrCreateToken();
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.apiConfig.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authState.token}`,
                    ...options.headers
                }
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
    },

    // ✅ VERIFICAR STATUS DA API
    async checkAPIStatus() {
        try {
            const response = await this.makeAPIRequest(`${this.apiConfig.baseUrl}${this.apiConfig.endpoints.health}`);
            return response.ok;
        } catch (error) {
            console.error('Erro ao verificar API:', error);
            return false;
        }
    },

    // ✅ GERAR ID ÚNICO
    generateShareId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    // ✅ MOSTRAR MENSAGEM
    showMessage(message, type = 'success') {
        const existingMessages = document.querySelectorAll('.message-success, .message-error, .message-warning, .message-info');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `message-${type}`;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            min-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        
        messageDiv.style.backgroundColor = colors[type] || colors.info;
        
        const icon = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        }[type] || 'ℹ️';
        
        messageDiv.innerHTML = `${icon} ${message}`;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    },

    // ✅ MOSTRAR CRIADOR DE PLANOS
    showPlanCreator() {
        document.getElementById('planList').style.display = 'none';
        document.getElementById('aiPlanCreator').style.display = 'none';
        document.getElementById('planCreator').style.display = 'block';
        
        if (!this.isEditing) {
            this.resetPlanCreator();
        }
        this.generateWorkoutEditor();
    },

    // ✅ MOSTRAR CRIADOR COM IA
    showAIPlanCreator() {
        document.getElementById('planList').style.display = 'none';
        document.getElementById('planCreator').style.display = 'none';
        document.getElementById('aiPlanCreator').style.display = 'block';
        
        this.setDefaultDates();
    },

    // ✅ MOSTRAR LISTA DE PLANOS
    showPlanList() {
        document.getElementById('planCreator').style.display = 'none';
        document.getElementById('aiPlanCreator').style.display = 'none';
        document.getElementById('planList').style.display = 'block';
        
        this.renderPlanList();
    },

    // ✅ RESETAR CRIADOR DE PLANOS
    resetPlanCreator() {
        document.getElementById('studentName').value = '';
        document.getElementById('studentBirthDate').value = '';
        document.getElementById('studentCpf').value = '';
        document.getElementById('studentHeight').value = '1,75m';
        document.getElementById('studentWeight').value = '75kg';
        document.getElementById('planName').value = '';
        document.getElementById('planObjective').value = 'Hipertrofia e ganho de massa muscular';
        document.getElementById('planObservations').value = '';
        document.getElementById('currentPlanId').value = '';
        
        this.currentPlan.treinos = [];
        this.selectedDays = 1;
        this.isEditing = false;
        
        document.getElementById('cancelEditBtn').style.display = 'none';
        
        // Resetar seletor de tipo de plano
        const buttons = document.querySelectorAll('.plan-type-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        buttons[0].classList.add('active');
    },

    // ✅ DEFINIR DATAS PADRÃO
    setDefaultDates() {
        const today = new Date();
        const startDate = today.toISOString().split('T')[0];
        const endDate = new Date(today.setDate(today.getDate() + 90)).toISOString().split('T')[0];
        
        const startInput = document.getElementById('planStartDate') || document.getElementById('aiStudentBirthDate');
        const endInput = document.getElementById('planEndDate');
        
        if (startInput) startInput.value = startDate;
        if (endInput) endInput.value = endDate;
    },

    // ✅ SELECIONAR TIPO DE PLANO
    selectPlanType(days, letters, element) {
        this.selectedDays = days;
        
        // Remove active class from all buttons
        document.querySelectorAll('.plan-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        element.classList.add('active');
        
        this.generateWorkoutEditor();
    },

    // ✅ GERAR EDITOR DE TREINOS
    generateWorkoutEditor() {
        const workoutEditor = document.getElementById('workoutEditor');
        workoutEditor.innerHTML = '';

        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        this.currentPlan.treinos = [];

        for (let i = 0; i < this.selectedDays; i++) {
            const letter = letters[i];
            const workout = {
                id: letter,
                nome: `Treino ${letter}`,
                foco: this.getWorkoutFocus(i, this.selectedDays),
                exercicios: []
            };

            this.currentPlan.treinos.push(workout);

            const workoutDiv = document.createElement('div');
            workoutDiv.className = 'workout-section';
            workoutDiv.innerHTML = `
                <div class="workout-header">
                    <h3>💪 Treino ${letter}</h3>
                    <div class="workout-actions">
                        <input type="text" 
                               value="${workout.foco}" 
                               class="workout-focus-input" 
                               placeholder="Foco do treino"
                               onchange="app.updateWorkoutFocus(${i}, this.value)">
                        <button class="btn btn-small btn-primary" onclick="app.addExercise(${i})">
                            ➕ Exercício
                        </button>
                    </div>
                </div>
                <div id="exerciseList${i}" class="exercise-list">
                    <div class="no-exercises">
                        <p>Nenhum exercício adicionado</p>
                        <button class="btn btn-outline" onclick="app.addExercise(${i})">
                            ➕ Adicionar primeiro exercício
                        </button>
                    </div>
                </div>
            `;

            workoutEditor.appendChild(workoutDiv);
        }
    },

    // ✅ OBTER FOCO DO TREINO
    getWorkoutFocus(index, totalDays) {
        const focusMap = {
            1: ['Corpo inteiro'],
            2: ['Membros superiores', 'Membros inferiores'],
            3: ['Peito e Tríceps', 'Costas e Bíceps', 'Pernas e Ombros'],
            4: ['Peito e Tríceps', 'Costas e Bíceps', 'Pernas', 'Ombros e Abdome'],
            5: ['Peito', 'Costas', 'Pernas', 'Ombros e Trapézio', 'Braços e Abdome'],
            6: ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Cardio e Abdome']
        };

        return focusMap[totalDays] ? focusMap[totalDays][index] : 'Treino personalizado';
    },

    // ✅ ATUALIZAR FOCO DO TREINO
    updateWorkoutFocus(workoutIndex, focus) {
        if (this.currentPlan.treinos[workoutIndex]) {
            this.currentPlan.treinos[workoutIndex].foco = focus;
        }
    },

    // ✅ ADICIONAR EXERCÍCIO
    addExercise(workoutIndex) {
        this.currentWorkoutIndex = workoutIndex;
        this.currentExerciseIndex = null;
        
        // Reset modal
        document.getElementById('exerciseName').value = 'custom';
        document.getElementById('customExerciseName').value = '';
        document.getElementById('exerciseSets').value = '3';
        document.getElementById('exerciseReps').value = '8-12';
        document.getElementById('exerciseWeight').value = '';
        document.getElementById('exerciseRest').value = '90 segundos';
        document.getElementById('exerciseDescription').value = '';
        document.getElementById('exerciseSpecialNotes').value = '';
        
        this.updateExerciseDescription();
        document.getElementById('exerciseModal').classList.add('active');
    },

    // ✅ EDITAR EXERCÍCIO
    editExercise(workoutIndex, exerciseIndex) {
        this.currentWorkoutIndex = workoutIndex;
        this.currentExerciseIndex = exerciseIndex;
        
        const exercise = this.currentPlan.treinos[workoutIndex].exercicios[exerciseIndex];
        
        // Preencher modal com dados do exercício
        const exerciseSelect = document.getElementById('exerciseName');
        const customName = document.getElementById('customExerciseName');
        
        if (this.exerciseDatabase[exercise.nome]) {
            exerciseSelect.value = exercise.nome;
            customName.style.display = 'none';
        } else {
            exerciseSelect.value = 'custom';
            customName.value = exercise.nome;
            customName.style.display = 'block';
        }
        
        document.getElementById('exerciseSets').value = exercise.series || '3';
        document.getElementById('exerciseReps').value = exercise.repeticoes || '8-12';
        document.getElementById('exerciseWeight').value = exercise.carga || '';
        document.getElementById('exerciseRest').value = exercise.descanso || '90 segundos';
        document.getElementById('exerciseDescription').value = exercise.descricao || '';
        document.getElementById('exerciseSpecialNotes').value = exercise.observacoesEspeciais || '';
        
        this.updateExerciseDescription();
        document.getElementById('exerciseModal').classList.add('active');
    },

    // ✅ ATUALIZAR DESCRIÇÃO DO EXERCÍCIO
    updateExerciseDescription() {
        const select = document.getElementById('exerciseName');
        const customGroup = document.getElementById('customExerciseGroup');
        const description = document.getElementById('exerciseDescription');
        
        if (select.value === 'custom') {
            customGroup.style.display = 'block';
            description.value = '';
        } else {
            customGroup.style.display = 'none';
            const exerciseData = this.exerciseDatabase[select.value];
            if (exerciseData) {
                description.value = exerciseData.description;
            }
        }
    },

    // ✅ ATUALIZAR INPUT DE OBSERVAÇÕES ESPECIAIS
    updateSpecialNotesInput() {
        const select = document.getElementById('exerciseSpecialNotes');
        const customGroup = document.getElementById('customNotesGroup');
        
        if (select.value === 'custom') {
            customGroup.style.display = 'block';
        } else {
            customGroup.style.display = 'none';
        }
    },

    // ✅ SALVAR EXERCÍCIO
    saveExercise() {
        const nameSelect = document.getElementById('exerciseName');
        const customName = document.getElementById('customExerciseName');
        const sets = document.getElementById('exerciseSets');
        const reps = document.getElementById('exerciseReps');
        const weight = document.getElementById('exerciseWeight');
        const rest = document.getElementById('exerciseRest');
        const description = document.getElementById('exerciseDescription');
        const specialNotesSelect = document.getElementById('exerciseSpecialNotes');
        const customNotes = document.getElementById('customSpecialNotes');
        
        // Validações
        if (nameSelect.value === 'custom' && !customName.value.trim()) {
            this.showMessage('Por favor, digite o nome do exercício', 'error');
            return;
        }
        
        if (!sets.value || !reps.value) {
            this.showMessage('Por favor, preencha séries e repetições', 'error');
            return;
        }
        
        // Preparar dados do exercício
        const exerciseName = nameSelect.value === 'custom' ? customName.value.trim() : nameSelect.value;
        const specialNotes = specialNotesSelect.value === 'custom' ? customNotes.value.trim() : specialNotesSelect.value;
        
        const exerciseData = {
            id: this.currentExerciseIndex !== null ? 
                this.currentPlan.treinos[this.currentWorkoutIndex].exercicios[this.currentExerciseIndex].id :
                Date.now(),
            nome: exerciseName,
            series: parseInt(sets.value),
            repeticoes: reps.value.trim(),
            carga: weight.value.trim(),
            descanso: rest.value.trim(),
            descricao: description.value.trim(),
            observacoesEspeciais: specialNotes,
            equipment: this.exerciseDatabase[exerciseName]?.equipment || 'Geral'
        };
        
        // Salvar exercício
        if (this.currentExerciseIndex !== null) {
            // Editando exercício existente
            this.currentPlan.treinos[this.currentWorkoutIndex].exercicios[this.currentExerciseIndex] = exerciseData;
        } else {
            // Adicionando novo exercício
            this.currentPlan.treinos[this.currentWorkoutIndex].exercicios.push(exerciseData);
        }
        
        this.renderExerciseList(this.currentWorkoutIndex);
        this.closeExerciseModal();
        this.showMessage('Exercício salvo com sucesso!', 'success');
    },

    // ✅ RENDERIZAR LISTA DE EXERCÍCIOS
    renderExerciseList(workoutIndex) {
        const exerciseList = document.getElementById(`exerciseList${workoutIndex}`);
        const exercises = this.currentPlan.treinos[workoutIndex].exercicios;
        
        if (exercises.length === 0) {
            exerciseList.innerHTML = `
                <div class="no-exercises">
                    <p>Nenhum exercício adicionado</p>
                    <button class="btn btn-outline" onclick="app.addExercise(${workoutIndex})">
                        ➕ Adicionar primeiro exercício
                    </button>
                </div>
            `;
            return;
        }
        
        exerciseList.innerHTML = exercises.map((exercise, index) => `
            <div class="exercise-card">
                <div class="exercise-header">
                    <h4>${exercise.nome}</h4>
                    <div class="exercise-actions">
                        <button class="btn btn-small btn-outline" onclick="app.editExercise(${workoutIndex}, ${index})">
                            ✏️
                        </button>
                        <button class="btn btn-small btn-danger" onclick="app.removeExercise(${workoutIndex}, ${index})">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="exercise-details">
                    <span><strong>Séries:</strong> ${exercise.series}</span>
                    <span><strong>Reps:</strong> ${exercise.repeticoes}</span>
                    <span><strong>Carga:</strong> ${exercise.carga || 'Não informado'}</span>
                    <span><strong>Descanso:</strong> ${exercise.descanso}</span>
                </div>
                ${exercise.observacoesEspeciais ? `
                    <div class="exercise-notes">
                        <strong>Observações:</strong> ${exercise.observacoesEspeciais}
                    </div>
                ` : ''}
                ${exercise.descricao ? `
                    <div class="exercise-description">
                        <strong>Técnica:</strong> ${exercise.descricao}
                    </div>
                ` : ''}
            </div>
        `).join('');
    },

    // ✅ REMOVER EXERCÍCIO
    removeExercise(workoutIndex, exerciseIndex) {
        if (confirm('Tem certeza que deseja remover este exercício?')) {
            this.currentPlan.treinos[workoutIndex].exercicios.splice(exerciseIndex, 1);
            this.renderExerciseList(workoutIndex);
            this.showMessage('Exercício removido!', 'success');
        }
    },

    // ✅ FECHAR MODAL DE EXERCÍCIO
    closeExerciseModal() {
        document.getElementById('exerciseModal').classList.remove('active');
        this.currentExerciseIndex = null;
        this.currentWorkoutIndex = null;
    },

    // ✅ CALCULAR IDADE
    calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    },

    // ✅ SALVAR PLANO
    async savePlan() {
        try {
            const currentPlanId = document.getElementById('currentPlanId').value;
            const isEditingPlan = this.isEditing && currentPlanId;
            
            const birthDate = document.getElementById('studentBirthDate')?.value;
            const calculatedAge = birthDate ? this.calculateAge(birthDate) : 25;
            
            const planData = {
                id: isEditingPlan ? parseInt(currentPlanId) : Date.now(),
                nome: document.getElementById('planName')?.value || 'Plano sem nome',
                aluno: {
                    nome: document.getElementById('studentName')?.value || '',
                    dataNascimento: birthDate || '',
                    cpf: document.getElementById('studentCpf')?.value || '',
                    idade: calculatedAge,
                    altura: document.getElementById('studentHeight')?.value || '1,75m',
                    peso: document.getElementById('studentWeight')?.value || '75kg'
                },
                dias: this.selectedDays,
                dataInicio: document.getElementById('planStartDate')?.value || new Date().toISOString().split('T')[0],
                dataFim: document.getElementById('planEndDate')?.value || '',
                perfil: {
                    idade: calculatedAge,
                    altura: document.getElementById('studentHeight')?.value || '1,75m',
                    peso: document.getElementById('studentWeight')?.value || '75kg',
                    porte: 'médio',
                    objetivo: document.getElementById('planObjective')?.value || 'Condicionamento geral'
                },
                treinos: [...this.currentPlan.treinos],
                observacoes: {
                    geral: document.getElementById('planObservations')?.value || '',
                    frequencia: `${this.selectedDays}x por semana`,
                    progressao: 'Aumente a carga gradualmente quando conseguir completar todas as repetições',
                    descanso: '60-90 segundos entre séries',
                    hidratacao: 'Mantenha-se bem hidratado durante todo o treino',
                    consulta: 'Acompanhamento profissional recomendado'
                }
            };

            // Validations
            if (!planData.nome || planData.nome === 'Plano sem nome') {
                this.showMessage('Por favor, preencha o nome do plano', 'error');
                return;
            }

            if (planData.treinos.length === 0) {
                this.showMessage('Adicione pelo menos um treino ao plano', 'error');
                return;
            }

            // Verificar se todos os treinos têm pelo menos um exercício
            const emptytWorkouts = planData.treinos.filter(t => !t.exercicios || t.exercicios.length === 0);
            if (emptytWorkouts.length > 0) {
                this.showMessage('Todos os treinos devem ter pelo menos um exercício', 'error');
                return;
            }

            this.showMessage('Salvando plano...', 'info');

            // Tentar salvar no PostgreSQL
            try {
                const savedPlan = await this.savePlanToDatabase(planData);
                planData.dbId = savedPlan.dbId;
                console.log('Plano salvo no PostgreSQL com ID:', savedPlan.dbId);
            } catch (dbError) {
                console.warn('Falha ao salvar no PostgreSQL, continuando com localStorage:', dbError);
            }

            // Save locally
            if (isEditingPlan) {
                const existingIndex = this.savedPlans.findIndex(p => p.id == currentPlanId);
                if (existingIndex >= 0) {
                    this.savedPlans[existingIndex] = planData;
                    this.showMessage('Plano atualizado com sucesso! 📝', 'success');
                } else {
                    this.savedPlans.push(planData);
                    this.showMessage('Plano salvo com sucesso! 💾', 'success');
                }
            } else {
                this.savedPlans.push(planData);
                this.showMessage('Plano salvo com sucesso! 💾', 'success');
            }
            
            this.savePlansToStorage();
            
            // Reset editing state
            this.isEditing = false;
            document.getElementById('cancelEditBtn').style.display = 'none';
            
            setTimeout(() => {
                this.showPlanList();
            }, 1500);

        } catch (error) {
            console.error('Erro ao salvar plano:', error);
            this.showMessage('Erro ao salvar plano. Tente novamente.', 'error');
        }
    },

    // ✅ SALVAR PLANO NO POSTGRESQL
    async savePlanToDatabase(plan) {
        try {
            console.log('Salvando plano no PostgreSQL:', plan.nome);
            
            const response = await this.makeAPIRequest(
                `${this.apiConfig.baseUrl}${this.apiConfig.endpoints.plans}`,
                {
                    method: 'POST',
                    body: JSON.stringify(this.convertPlanToBackendFormat(plan))
                }
            );

            if (response.ok) {
                const result = await response.json();
                console.log('Plano salvo no PostgreSQL:', result);
                
                plan.dbId = result.data.planId;
                this.savePlansToStorage();
                return { ...plan, dbId: result.data.planId };
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erro HTTP ${response.status}`);
            }
        } catch (error) {
            console.warn('Falha ao salvar no PostgreSQL:', error);
            return plan;
        }
    },

    // ✅ CONVERTER PLANO PARA FORMATO BACKEND
    convertPlanToBackendFormat(plan) {
        return {
            name: plan.nome,
            description: plan.observacoes?.geral || '',
            objective: plan.perfil?.objetivo || '',
            frequencyPerWeek: plan.dias,
            startDate: plan.dataInicio,
            endDate: plan.dataFim,
            difficultyLevel: 'intermediate',
            equipmentType: 'gym',
            estimatedDuration: 60,
            aiGenerated: false,
            student: plan.aluno ? {
                name: plan.aluno.nome,
                email: plan.aluno.email || '',
                birthDate: plan.aluno.dataNascimento,
                age: plan.aluno.idade,
                height: plan.aluno.altura,
                weight: plan.aluno.peso,
                cpf: plan.aluno.cpf
            } : null,
            workouts: plan.treinos?.map((treino) => ({
                name: treino.nome,
                workoutLetter: treino.id,
                focusArea: treino.foco,
                description: treino.foco,
                estimatedDuration: 60,
                difficultyLevel: 'intermediate',
                exercises: treino.exercicios?.map((ex) => ({
                    name: ex.nome,
                    description: ex.descricao || '',
                    sets: ex.series,
                    reps: ex.repeticoes,
                    weight: ex.carga,
                    restTime: ex.descanso,
                    equipment: ex.equipment || 'geral',
                    specialInstructions: ex.observacoesEspeciais || ''
                })) || []
            })) || [],
            observations: plan.observacoes || {}
        };
    },

    // ✅ CARREGAR PLANOS SALVOS
    loadSavedPlans() {
        try {
            const saved = localStorage.getItem('jsfitapp_personal_plans');
            this.savedPlans = saved ? JSON.parse(saved) : [];
            console.log(`${this.savedPlans.length} planos carregados`);
        } catch (error) {
            console.error('Erro ao carregar planos:', error);
            this.savedPlans = [];
        }
    },

    // ✅ SALVAR PLANOS NO LOCALSTORAGE
    savePlansToStorage() {
        try {
            localStorage.setItem('jsfitapp_personal_plans', JSON.stringify(this.savedPlans));
        } catch (error) {
            console.error('Erro ao salvar planos:', error);
        }
    },

    // ✅ RENDERIZAR LISTA DE PLANOS
    renderPlanList() {
        const planListContent = document.getElementById('planListContent');
        
        if (this.savedPlans.length === 0) {
            planListContent.innerHTML = `
                <div class="plan-card">
                    <h3>🎯 Nenhum plano encontrado</h3>
                    <p>Crie seu primeiro plano de treino!</p>
                    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
                        <button class="btn btn-primary" onclick="app.showPlanCreator()">
                            ➕ Novo Plano
                        </button>
                        <button class="btn btn-ai" onclick="app.showAIPlanCreator()">
                            🤖 Criar com IA
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        planListContent.innerHTML = this.savedPlans.map(plan => `
            <div class="plan-card">
                <div class="plan-card-header">
                    <h3>${plan.nome}</h3>
                    <div class="plan-actions">
                        <button class="btn btn-small btn-primary" onclick="app.editPlan(${plan.id})" title="Editar">
                            ✏️
                        </button>
                        <button class="btn btn-small btn-success" onclick="app.sharePlan(${plan.id})" title="Compartilhar">
                            🔗
                        </button>
                        <button class="btn btn-small btn-secondary" onclick="app.exportPlan(${plan.id})" title="Exportar">
                            💾
                        </button>
                        <button class="btn btn-small btn-danger" onclick="app.deletePlan(${plan.id})" title="Excluir">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="plan-card-content">
                    <div class="plan-info">
                        <span><strong>👤 Aluno:</strong> ${plan.aluno?.nome || 'Não informado'}</span>
                        <span><strong>🎯 Objetivo:</strong> ${plan.perfil?.objetivo || 'Não informado'}</span>
                        <span><strong>📅 Frequência:</strong> ${plan.dias || 0}x por semana</span>
                        <span><strong>💪 Treinos:</strong> ${plan.treinos?.length || 0}</span>
                        ${plan.dbId ? '<span class="db-indicator">🌐 Salvo no servidor</span>' : '<span class="local-indicator">💾 Salvo localmente</span>'}
                    </div>
                    <div class="plan-dates">
                        <small><strong>Início:</strong> ${plan.dataInicio ? new Date(plan.dataInicio).toLocaleDateString('pt-BR') : 'Não definido'}</small>
                        <small><strong>Fim:</strong> ${plan.dataFim ? new Date(plan.dataFim).toLocaleDateString('pt-BR') : 'Não definido'}</small>
                    </div>
                    ${plan.observacoes?.geral ? `
                        <div class="plan-observations">
                            <strong>📝 Observações:</strong> ${plan.observacoes.geral.substring(0, 100)}${plan.observacoes.geral.length > 100 ? '...' : ''}
                        </div>
                    ` : ''}
                </div>
                <div class="plan-card-footer">
                    <button class="btn btn-outline" onclick="app.viewPlanDetails(${plan.id})">
                        👁️ Ver Detalhes
                    </button>
                </div>
            </div>
        `).join('');
    },

    // ✅ EDITAR PLANO
    editPlan(planId) {
        const plan = this.savedPlans.find(p => p.id === planId);
        if (!plan) {
            this.showMessage('Plano não encontrado', 'error');
            return;
        }

        // Preencher formulário
        document.getElementById('currentPlanId').value = plan.id;
        document.getElementById('studentName').value = plan.aluno?.nome || '';
        document.getElementById('studentBirthDate').value = plan.aluno?.dataNascimento || '';
        document.getElementById('studentCpf').value = plan.aluno?.cpf || '';
        document.getElementById('studentHeight').value = plan.aluno?.altura || '1,75m';
        document.getElementById('studentWeight').value = plan.aluno?.peso || '75kg';
        document.getElementById('planName').value = plan.nome || '';
        document.getElementById('planObjective').value = plan.perfil?.objetivo || 'Hipertrofia e ganho de massa muscular';
        document.getElementById('planStartDate').value = plan.dataInicio || '';
        document.getElementById('planEndDate').value = plan.dataFim || '';
        document.getElementById('planObservations').value = plan.observacoes?.geral || '';

        // Configurar tipo de plano
        this.selectedDays = plan.dias || 1;
        this.currentPlan.treinos = plan.treinos || [];
        
        // Atualizar UI
        const buttons = document.querySelectorAll('.plan-type-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        if (buttons[this.selectedDays - 1]) {
            buttons[this.selectedDays - 1].classList.add('active');
        }

        this.isEditing = true;
        document.getElementById('cancelEditBtn').style.display = 'block';
        
        this.generateWorkoutEditor();
        
        // Renderizar exercícios existentes
        this.currentPlan.treinos.forEach((treino, index) => {
            this.renderExerciseList(index);
        });

        this.showPlanCreator();
        this.showMessage('Plano carregado para edição', 'info');
    },

    // ✅ CANCELAR EDIÇÃO
    cancelEdit() {
        this.isEditing = false;
        document.getElementById('cancelEditBtn').style.display = 'none';
        this.resetPlanCreator();
        this.showPlanList();
    },

    // ✅ VER DETALHES DO PLANO
    viewPlanDetails(planId) {
        const plan = this.savedPlans.find(p => p.id === planId);
        if (!plan) {
            this.showMessage('Plano não encontrado', 'error');
            return;
        }

        const modalTitle = document.getElementById('planModalTitle');
        const modalContent = document.getElementById('planModalContent');

        modalTitle.textContent = plan.nome;

        let workoutsHtml = '';
        if (plan.treinos && plan.treinos.length > 0) {
            workoutsHtml = plan.treinos.map(treino => `
                <div class="workout-detail">
                    <h4>💪 ${treino.nome} - ${treino.foco}</h4>
                    ${treino.exercicios && treino.exercicios.length > 0 ? `
                        <div class="exercises-detail">
                            ${treino.exercicios.map((ex, index) => `
                                <div class="exercise-detail-card">
                                    <div class="exercise-number">${index + 1}</div>
                                    <div class="exercise-detail-content">
                                        <h5>${ex.nome}</h5>
                                        <div class="exercise-specs">
                                            <span>📊 ${ex.series} séries</span>
                                            <span>🔄 ${ex.repeticoes} repetições</span>
                                            <span>⚖️ ${ex.carga || 'Peso livre'}</span>
                                            <span>⏱️ ${ex.descanso}</span>
                                        </div>
                                        ${ex.observacoesEspeciais ? `
                                            <div class="exercise-special-notes">
                                                <strong>📝 Observações:</strong> ${ex.observacoesEspeciais}
                                            </div>
                                        ` : ''}
                                        ${ex.descricao ? `
                                            <div class="exercise-technique">
                                                <strong>🎯 Técnica:</strong> ${ex.descricao}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p>Nenhum exercício adicionado</p>'}
                </div>
            `).join('');
        } else {
            workoutsHtml = '<p>Nenhum treino configurado</p>';
        }

        modalContent.innerHTML = `
            <div class="plan-detail-content">
                <div class="student-info">
                    <h3>👤 Informações do Aluno</h3>
                    <div class="info-grid">
                        <span><strong>Nome:</strong> ${plan.aluno?.nome || 'Não informado'}</span>
                        <span><strong>Idade:</strong> ${plan.aluno?.idade || 'Não informado'}</span>
                        <span><strong>Altura:</strong> ${plan.aluno?.altura || 'Não informado'}</span>
                        <span><strong>Peso:</strong> ${plan.aluno?.peso || 'Não informado'}</span>
                        ${plan.aluno?.cpf ? `<span><strong>CPF:</strong> ${plan.aluno.cpf}</span>` : ''}
                    </div>
                </div>

                <div class="plan-info-detail">
                    <h3>🎯 Informações do Plano</h3>
                    <div class="info-grid">
                        <span><strong>Objetivo:</strong> ${plan.perfil?.objetivo || 'Não informado'}</span>
                        <span><strong>Frequência:</strong> ${plan.dias}x por semana</span>
                        <span><strong>Data de Início:</strong> ${plan.dataInicio ? new Date(plan.dataInicio).toLocaleDateString('pt-BR') : 'Não definido'}</span>
                        <span><strong>Data de Fim:</strong> ${plan.dataFim ? new Date(plan.dataFim).toLocaleDateString('pt-BR') : 'Não definido'}</span>
                    </div>
                    ${plan.observacoes?.geral ? `
                        <div class="plan-observations-detail">
                            <strong>📝 Observações Gerais:</strong>
                            <p>${plan.observacoes.geral}</p>
                        </div>
                    ` : ''}
                </div>

                <div class="workouts-detail">
                    <h3>💪 Treinos (${plan.treinos?.length || 0})</h3>
                    ${workoutsHtml}
                </div>

                <div class="plan-actions-detail">
                    <button class="btn btn-primary" onclick="app.editPlan(${plan.id}); app.closePlanModal();">
                        ✏️ Editar Plano
                    </button>
                    <button class="btn btn-success" onclick="app.sharePlan(${plan.id})">
                        🔗 Compartilhar
                    </button>
                    <button class="btn btn-secondary" onclick="app.exportPlan(${plan.id})">
                        💾 Exportar
                    </button>
                </div>
            </div>
        `;

        document.getElementById('planModal').classList.add('active');
    },

    // ✅ FECHAR MODAL DE PLANO
    closePlanModal() {
        document.getElementById('planModal').classList.remove('active');
    },

    // ✅ DELETAR PLANO
    deletePlan(planId) {
        const plan = this.savedPlans.find(p => p.id === planId);
        if (!plan) {
            this.showMessage('Plano não encontrado', 'error');
            return;
        }

        if (confirm(`Tem certeza que deseja excluir o plano "${plan.nome}"?\n\nEsta ação não pode ser desfeita.`)) {
            this.savedPlans = this.savedPlans.filter(p => p.id !== planId);
            this.savePlansToStorage();
            this.renderPlanList();
            this.showMessage('Plano excluído com sucesso!', 'success');
        }
    },

    // ✅ EXPORTAR PLANO
    exportPlan(planId) {
        const plan = this.savedPlans.find(p => p.id === planId);
        if (!plan) {
            this.showMessage('Plano não encontrado', 'error');
            return;
        }

        try {
            const dataStr = JSON.stringify(plan, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `${plan.nome.replace(/[^a-z0-9]/gi, '_')}_${new Date().getTime()}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            this.showMessage('Plano exportado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao exportar:', error);
            this.showMessage('Erro ao exportar plano', 'error');
        }
    },

    // ✅ IMPORTAR PLANO
    importPlan(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedPlan = JSON.parse(e.target.result);
                
                // Validar estrutura básica
                if (!importedPlan.nome || !importedPlan.treinos) {
                    throw new Error('Arquivo inválido');
                }

                // Gerar novo ID para evitar conflitos
                importedPlan.id = Date.now();
                importedPlan.nome = `${importedPlan.nome} (Importado)`;

                this.savedPlans.push(importedPlan);
                this.savePlansToStorage();
                this.renderPlanList();
                this.showMessage('Plano importado com sucesso!', 'success');
            } catch (error) {
                console.error('Erro ao importar:', error);
                this.showMessage('Erro ao importar plano. Verifique se o arquivo está correto.', 'error');
            }
        };
        reader.readAsText(file);
        
        // Reset input
        event.target.value = '';
    },

    // ✅ COMPARTILHAR PLANO
    async sharePlan(planId) {
        const plan = this.savedPlans.find(p => p.id === planId);
        if (!plan) {
            this.showMessage('Plano não encontrado', 'error');
            return;
        }

        this.sharingState.isSharing = true;
        this.showMessage('Compartilhando plano...', 'info');

        try {
            console.log('Iniciando compartilhamento do plano:', plan.nome);
            
            // 1. Primeiro salvar no PostgreSQL se ainda não foi salvo
            let savedPlan = plan;
            if (!plan.dbId) {
                console.log('Salvando plano no PostgreSQL...');
                savedPlan = await this.savePlanToDatabase(plan);
            }
            
            // 2. Gerar ID único
            const shareId = this.generateShareId();
            console.log('ID de compartilhamento gerado:', shareId);
            
            // 3. Criar compartilhamento
            const shareResponse = await this.makeAPIRequest(
                `${this.apiConfig.baseUrl}${this.apiConfig.endpoints.share}`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        shareId: shareId,
                        plan: this.convertPlanToFrontendFormat(savedPlan),
                        workoutPlanId: savedPlan.dbId || null
                    })
                }
            );

            if (shareResponse.ok) {
                const result = await shareResponse.json();
                console.log('Plano compartilhado com sucesso:', result);
                
                this.sharingState.currentShareId = shareId;
                this.sharingState.lastSharedPlan = plan;
                
                // Salvar localmente como backup
                this.saveSharedPlanLocally(shareId, savedPlan);
                
                this.showShareSuccessModal(shareId, 'server');
                this.showMessage('✅ Plano compartilhado com sucesso!', 'success');
            } else {
                const errorData = await shareResponse.json().catch(() => ({}));
                throw new Error(errorData.error || `Erro do servidor: ${shareResponse.status}`);
            }

        } catch (error) {
            console.error('Erro ao compartilhar:', error);
            
            // Fallback: salvar apenas localmente
            const shareId = this.generateShareId();
            this.saveSharedPlanLocally(shareId, plan);
            this.showShareSuccessModal(shareId, 'local');
            this.showMessage('⚠️ Plano compartilhado localmente (servidor indisponível)', 'warning');
            
        } finally {
            this.sharingState.isSharing = false;
        }
    },

    // ✅ CONVERTER PLANO PARA FORMATO FRONTEND
    convertPlanToFrontendFormat(plan) {
        return {
            id: plan.id || plan.dbId,
            nome: plan.nome,
            descricao: plan.observacoes?.geral || '',
            objetivo: plan.perfil?.objetivo || '',
            dias: plan.dias,
            dataInicio: plan.dataInicio,
            dataFim: plan.dataFim,
            aluno: plan.aluno ? {
                nome: plan.aluno.nome,
                email: plan.aluno.email || '',
                dataNascimento: plan.aluno.dataNascimento,
                idade: plan.aluno.idade,
                altura: plan.aluno.altura,
                peso: plan.aluno.peso,
                cpf: plan.aluno.cpf
            } : null,
            perfil: {
                objetivo: plan.perfil?.objetivo || '',
                altura: plan.aluno?.altura || '',
                peso: plan.aluno?.peso || '',
                idade: plan.aluno?.idade || null
            },
            treinos: plan.treinos?.map(treino => ({
                id: treino.id,
                nome: treino.nome,
                foco: treino.foco,
                concluido: false,
                execucoes: 0,
                exercicios: treino.exercicios?.map(ex => ({
                    id: ex.id,
                    nome: ex.nome,
                    descricao: ex.descricao || '',
                    series: ex.series,
                    repeticoes: ex.repeticoes,
                    carga: ex.carga,
                    currentCarga: ex.carga,
                    descanso: ex.descanso,
                    observacoesEspeciais: ex.observacoesEspeciais || '',
                    concluido: false
                })) || []
            })) || [],
            observacoes: plan.observacoes || {},
            execucoesPlanCompleto: 0
        };
    },

    // ✅ SALVAR PLANO COMPARTILHADO LOCALMENTE
    saveSharedPlanLocally(shareId, planData) {
        try {
            const sharedPlans = this.getSharedPlansFromStorage();
            sharedPlans[shareId] = planData;
            localStorage.setItem('jsfitapp_shared_plans', JSON.stringify(sharedPlans));
            console.log(`Plano ${shareId} salvo localmente`);
        } catch (error) {
            console.error('Erro ao salvar plano localmente:', error);
            throw new Error('Falha ao salvar plano localmente');
        }
    },

    // ✅ OBTER PLANOS COMPARTILHADOS DO LOCALSTORAGE
    getSharedPlansFromStorage() {
        try {
            const stored = localStorage.getItem('jsfitapp_shared_plans');
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Erro ao carregar planos compartilhados:', error);
            return {};
        }
    },

    // ✅ MOSTRAR MODAL DE SUCESSO DO COMPARTILHAMENTO
    showShareSuccessModal(shareId, source) {
        // Remover modal existente se houver
        const existingModal = document.getElementById('shareSuccessModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Criar modal
        const modal = document.createElement('div');
        modal.id = 'shareSuccessModal';
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content share-success-modal">
                <div class="modal-header">
                    <h2>🎉 Plano Compartilhado com Sucesso!</h2>
                    <button class="close-btn" onclick="app.closeShareModal()">&times;</button>
                </div>
                <div class="share-success-content">
                    <div class="share-id-display">
                        <h3>ID do Plano:</h3>
                        <div class="share-id-code">${shareId}</div>
                        <p class="share-id-subtitle">
                            ${source === 'server' ? 
                                '🌐 Armazenado no servidor' : 
                                '💾 Armazenado localmente'
                            }
                        </p>
                    </div>
                    
                    <div class="share-instructions">
                        <h4>📋 Como usar:</h4>
                        <ol>
                            <li>Compartilhe este ID com seu aluno</li>
                            <li>O aluno deve abrir o app do aluno</li>
                            <li>Clicar em "Importar por ID"</li>
                            <li>Digitar o código: <strong>${shareId}</strong></li>
                        </ol>
                    </div>

                    <div class="share-actions">
                        <button class="btn btn-primary" onclick="app.copyShareId('${shareId}')">
                            📋 Copiar ID
                        </button>
                        <button class="btn btn-secondary" onclick="app.shareViaWhatsApp('${shareId}')">
                            📱 Compartilhar no WhatsApp
                        </button>
                        <button class="btn btn-outline" onclick="app.closeShareModal()">
                            ✅ Fechar
                        </button>
                    </div>

                    <div class="share-qr-section">
                        <p><small>💡 Dica: O aluno pode usar este ID a qualquer momento para importar o plano</small></p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    // ✅ FECHAR MODAL DE COMPARTILHAMENTO
    closeShareModal() {
        const modal = document.getElementById('shareSuccessModal');
        if (modal) {
            modal.remove();
        }
    },

    // ✅ COPIAR ID PARA CLIPBOARD
    async copyShareId(shareId) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(shareId);
                this.showMessage('📋 ID copiado para a área de transferência!', 'success');
            } else {
                // Fallback para browsers antigos
                const textArea = document.createElement('textarea');
                textArea.value = shareId;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showMessage('📋 ID copiado!', 'success');
            }
        } catch (error) {
            console.error('Erro ao copiar:', error);
            this.showMessage('Erro ao copiar ID. Copie manualmente: ' + shareId, 'error');
        }
    },

    // ✅ COMPARTILHAR VIA WHATSAPP
    shareViaWhatsApp(shareId) {
        const planName = this.sharingState.lastSharedPlan?.nome || 'Plano de Treino';
        const studentName = this.sharingState.lastSharedPlan?.aluno?.nome || 'Aluno';
        
        const message = `🏋️ *${planName}*\n\n` +
                       `Olá ${studentName}! Seu plano de treino está pronto!\n\n` +
                       `📱 Para importar:\n` +
                       `1. Abra o JS Fit App (Aluno)\n` +
                       `2. Clique em "Importar por ID"\n` +
                       `3. Digite o código: *${shareId}*\n\n` +
                       `💪 Bons treinos!`;
        
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    },

    // ✅ GERAR PLANO COM IA (SIMULADO)
    async generateAIPlan() {
        // Validações
        const studentName = document.getElementById('aiStudentName').value.trim();
        const objective = document.getElementById('aiPlanObjective').value;
        const days = parseInt(document.getElementById('aiAvailableDays').value);

        if (!studentName) {
            this.showMessage('Por favor, preencha o nome do aluno', 'error');
            return;
        }

        const generatingIndicator = document.getElementById('generatingIndicator');
        generatingIndicator.style.display = 'block';

        // Simular carregamento
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress > 100) progress = 100;
            document.getElementById('progressFill').style.width = progress + '%';
        }, 200);

        try {
            await new Promise(resolve => setTimeout(resolve, 3000)); // Simular 3s de processamento
            
            clearInterval(progressInterval);
            document.getElementById('progressFill').style.width = '100%';

            // Gerar plano simulado
            const aiPlan = this.generateSimulatedAIPlan();
            
            // Salvar plano
            this.savedPlans.push(aiPlan);
            this.savePlansToStorage();
            
            generatingIndicator.style.display = 'none';
            this.showMessage('🤖 Plano criado com IA com sucesso!', 'success');
            
            setTimeout(() => {
                this.showPlanList();
            }, 1500);

        } catch (error) {
            clearInterval(progressInterval);
            generatingIndicator.style.display = 'none';
            console.error('Erro ao gerar plano com IA:', error);
            this.showMessage('Erro ao gerar plano com IA', 'error');
        }
    },

    // ✅ GERAR PLANO SIMULADO COM IA
    generateSimulatedAIPlan() {
        const studentName = document.getElementById('aiStudentName').value.trim();
        const birthDate = document.getElementById('aiStudentBirthDate').value;
        const height = document.getElementById('aiStudentHeight').value || '1,75m';
        const weight = document.getElementById('aiStudentWeight').value || '75kg';
        const objective = document.getElementById('aiPlanObjective').value;
        const experienceLevel = document.getElementById('aiExperienceLevel').value;
        const days = parseInt(document.getElementById('aiAvailableDays').value);
        const sessionTime = parseInt(document.getElementById('aiSessionTime').value);
        const equipment = document.getElementById('aiEquipment').value;
        const limitations = document.getElementById('aiLimitations').value.trim();
        const specialNotes = document.getElementById('aiSpecialNotes').value.trim();

        const age = birthDate ? this.calculateAge(birthDate) : 25;

        // Templates de exercícios baseados no nível e objetivo
        const exerciseTemplates = this.getExerciseTemplatesForObjective(objective, experienceLevel, equipment);
        
        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        const treinos = [];

        for (let i = 0
                