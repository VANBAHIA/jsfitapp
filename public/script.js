// Application object to organize functions and prevent global conflicts
const app = {
    // Exercise database for AI generation and descriptions
    exerciseDatabase: {
        peito: {
            iniciante: [
                { nome: 'Flexão de Braços', series: 3, repeticoes: '8-12', carga: 'Peso corporal', descricao: 'Posição de prancha, descer o peito até quase tocar o chão, manter core contraído' },
                { nome: 'Supino com Halteres', series: 3, repeticoes: '10-12', carga: '12-15kg cada', descricao: 'Deitado no banco, empurrar halteres para cima, controlar a descida' },
                { nome: 'Crucifixo com Halteres', series: 3, repeticoes: '12-15', carga: '8-10kg cada', descricao: 'Abrir e fechar os braços em movimento de abraço, leve flexão no cotovelo' }
            ],
            intermediario: [
                { nome: 'Supino Reto com Barra', series: 4, repeticoes: '8-10', carga: '40-60kg', descricao: 'Exercício fundamental para desenvolvimento do peitoral, pegada média' },
                { nome: 'Supino Inclinado', series: 3, repeticoes: '10-12', carga: '30-45kg', descricao: 'Trabalha a parte superior do peitoral, banco a 30-45 graus' },
                { nome: 'Crossover', series: 3, repeticoes: '12-15', carga: '15-25kg', descricao: 'Movimento de cruz trabalhando definição, contraição no final' }
            ],
            avancado: [
                { nome: 'Supino Reto com Barra', series: 4, repeticoes: '6-8', carga: '60-80kg', descricao: 'Foco em força e massa muscular, execução controlada' },
                { nome: 'Supino Inclinado com Halteres', series: 4, repeticoes: '8-10', carga: '22-28kg cada', descricao: 'Maior amplitude de movimento, rotação dos halteres' },
                { nome: 'Mergulho em Paralelas', series: 3, repeticoes: '8-12', carga: 'Peso corporal + 10-20kg', descricao: 'Exercício composto para peitoral inferior, inclinação frontal' }
            ]
        },
        costas: {
            iniciante: [
                { nome: 'Puxada Frontal', series: 3, repeticoes: '10-12', carga: '30-40kg', descricao: 'Puxar barra até o peito, contrair escápulas, peito para fora' },
                { nome: 'Remada Baixa', series: 3, repeticoes: '10-12', carga: '25-35kg', descricao: 'Puxar cabo em direção ao abdômen, manter tronco ereto' },
                { nome: 'Remada com Halter', series: 3, repeticoes: '10-12', carga: '12-16kg', descricao: 'Apoiar joelho no banco, remar halter até o quadril' }
            ],
            intermediario: [
                { nome: 'Puxada Frontal', series: 4, repeticoes: '8-10', carga: '45-60kg', descricao: 'Desenvolvimento do latíssimo do dorso, pegada média' },
                { nome: 'Remada Curvada', series: 4, repeticoes: '8-10', carga: '35-50kg', descricao: 'Inclinar tronco a 45 graus, remar barra ao abdômen' },
                { nome: 'Pullover', series: 3, repeticoes: '12-15', carga: '15-20kg', descricao: 'Alongamento e contração do latíssimo, movimento arqueado' }
            ],
            avancado: [
                { nome: 'Barra Fixa', series: 4, repeticoes: '6-10', carga: 'Peso corporal + 10-20kg', descricao: 'Exercício funcional de peso corporal, pegada pronada' },
                { nome: 'Remada T-Bar', series: 4, repeticoes: '8-10', carga: '40-60kg', descricao: 'Trabalha espessura das costas, pegada neutra' },
                { nome: 'Levantamento Terra', series: 4, repeticoes: '6-8', carga: '80-120kg', descricao: 'Exercício completo para posterior, técnica perfeita essencial' }
            ]
        },
        ombros: {
            iniciante: [
                { nome: 'Desenvolvimento com Halteres', series: 3, repeticoes: '10-12', carga: '8-12kg cada', descricao: 'Elevar halteres acima da cabeça, trajetória ligeiramente frontal' },
                { nome: 'Elevação Lateral', series: 3, repeticoes: '12-15', carga: '4-6kg cada', descricao: 'Trabalha deltoide medial, cotovelos ligeiramente flexionados' },
                { nome: 'Elevação Frontal', series: 3, repeticoes: '12-15', carga: '4-6kg cada', descricao: 'Foco no deltoide anterior, alternado ou simultâneo' }
            ],
            intermediario: [
                { nome: 'Desenvolvimento com Barra', series: 4, repeticoes: '8-10', carga: '25-35kg', descricao: 'Exercício base para ombros, pela frente ou atrás da nuca' },
                { nome: 'Elevação Lateral', series: 3, repeticoes: '12-15', carga: '6-8kg cada', descricao: 'Definição lateral dos ombros, controle excêntrico' },
                { nome: 'Elevação Posterior', series: 3, repeticoes: '12-15', carga: '4-6kg cada', descricao: 'Trabalha deltoide posterior, inclinado ou na polia' }
            ],
            avancado: [
                { nome: 'Desenvolvimento Arnold', series: 4, repeticoes: '8-10', carga: '14-18kg cada', descricao: 'Movimento completo de rotação, combina frontal e lateral' },
                { nome: 'Elevação Lateral 21', series: 3, repeticoes: '21 (7+7+7)', carga: '6-8kg cada', descricao: 'Método 21 para intensidade, 7 parciais + 7 parciais + 7 completas' },
                { nome: 'Face Pull', series: 3, repeticoes: '15-20', carga: '15-25kg', descricao: 'Trabalha deltoide posterior e trapézio, corda no rosto' }
            ]
        },
        biceps: {
            iniciante: [
                { nome: 'Rosca Direta', series: 3, repeticoes: '10-12', carga: '15-20kg', descricao: 'Exercício básico para bíceps, pegada supinada, cotovelos fixos' },
                { nome: 'Rosca Alternada', series: 3, repeticoes: '10-12', carga: '8-10kg cada', descricao: 'Alternando braços para melhor controle e concentração' },
                { nome: 'Rosca Martelo', series: 3, repeticoes: '12-15', carga: '6-8kg cada', descricao: 'Trabalha bíceps e antebraço, pegada neutra' }
            ],
            intermediario: [
                { nome: 'Rosca Direta', series: 4, repeticoes: '8-10', carga: '25-35kg', descricao: 'Foco em força e massa, execução estrita' },
                { nome: 'Rosca Scott', series: 3, repeticoes: '10-12', carga: '20-25kg', descricao: 'Isolamento do bíceps no banco Scott, amplitude completa' },
                { nome: 'Rosca 21', series: 3, repeticoes: '21 (7+7+7)', carga: '15-20kg', descricao: 'Método intenso: 7 meias inferiores + 7 superiores + 7 completas' }
            ],
            avancado: [
                { nome: 'Rosca Direta Pegada Fechada', series: 4, repeticoes: '6-8', carga: '30-40kg', descricao: 'Variação para força máxima, pegada mais estreita' },
                { nome: 'Rosca Spider', series: 3, repeticoes: '8-10', carga: '15-20kg', descricao: 'Isolamento total do bíceps, banco inclinado inverso' },
                { nome: 'Rosca Drag Curl', series: 3, repeticoes: '10-12', carga: '20-25kg', descricao: 'Técnica avançada, barra "arrasta" no corpo' }
            ]
        },
        triceps: {
            iniciante: [
                { nome: 'Tríceps Testa', series: 3, repeticoes: '10-12', carga: '15-20kg', descricao: 'Flexionar apenas antebraços, cotovelos fixos, barra W' },
                { nome: 'Tríceps Pulley', series: 3, repeticoes: '12-15', carga: '20-25kg', descricao: 'Movimento de extensão no cabo, pegada pronada' },
                { nome: 'Mergulho no Banco', series: 3, repeticoes: '8-12', carga: 'Peso corporal', descricao: 'Exercício funcional, mãos no banco, pés no chão' }
            ],
            intermediario: [
                { nome: 'Tríceps Francês', series: 4, repeticoes: '8-10', carga: '20-30kg', descricao: 'Exercício clássico para tríceps, halter atrás da cabeça' },
                { nome: 'Tríceps Corda', series: 3, repeticoes: '10-12', carga: '25-35kg', descricao: 'Maior amplitude de movimento, abertura na contração' },
                { nome: 'Supino Fechado', series: 3, repeticoes: '8-10', carga: '30-40kg', descricao: 'Exercício composto, pegada fechada, cotovelos próximos' }
            ],
            avancado: [
                { nome: 'Tríceps Francês com Halter', series: 4, repeticoes: '6-8', carga: '18-25kg', descricao: 'Variação unilateral, maior instabilidade e ativação' },
                { nome: 'Mergulho em Paralelas', series: 4, repeticoes: '8-12', carga: 'Peso corporal + 10-15kg', descricao: 'Exercício funcional avançado, foco no tríceps' },
                { nome: 'JM Press', series: 3, repeticoes: '8-10', carga: '25-35kg', descricao: 'Técnica específica para força, meio termo supino/testa' }
            ]
        },
        quadriceps: {
            iniciante: [
                { nome: 'Agachamento Livre', series: 3, repeticoes: '12-15', carga: '20-30kg', descricao: 'Exercício fundamental para pernas, técnica perfeita essencial' },
                { nome: 'Leg Press', series: 3, repeticoes: '12-15', carga: '80-100kg', descricao: 'Exercício seguro para iniciantes, amplitude controlada' },
                { nome: 'Extensão de Pernas', series: 3, repeticoes: '15-20', carga: '20-30kg', descricao: 'Isolamento do quadríceps, sem sobrecarga na lombar' }
            ],
            intermediario: [
                { nome: 'Agachamento Livre', series: 4, repeticoes: '8-12', carga: '40-60kg', descricao: 'Aumento de carga e intensidade, profundidade adequada' },
                { nome: 'Leg Press 45°', series: 4, repeticoes: '10-12', carga: '120-160kg', descricao: 'Variação angular, pés na posição média' },
                { nome: 'Afundo', series: 3, repeticoes: '12 cada perna', carga: '8-12kg cada', descricao: 'Exercício unilateral, trabalha equilíbrio' }
            ],
            avancado: [
                { nome: 'Agachamento Livre', series: 4, repeticoes: '6-8', carga: '70-100kg', descricao: 'Foco em força máxima, técnica impecável obrigatória' },
                { nome: 'Agachamento Frontal', series: 4, repeticoes: '8-10', carga: '40-60kg', descricao: 'Variação técnica avançada, barra na frente, core ativo' },
                { nome: 'Agachamento Búlgaro', series: 3, repeticoes: '10-12 cada', carga: '12-16kg cada', descricao: 'Exercício unilateral desafiador, pé traseiro elevado' }
            ]
        },
        posterior: {
            iniciante: [
                { nome: 'Stiff', series: 3, repeticoes: '10-12', carga: '20-30kg', descricao: 'Exercício para posterior de coxa, joelhos levemente flexionados' },
                { nome: 'Flexão de Pernas', series: 3, repeticoes: '12-15', carga: '20-30kg', descricao: 'Isolamento dos isquiotibiais, contração no topo' },
                { nome: 'Elevação Pélvica', series: 3, repeticoes: '15-20', carga: 'Peso corporal', descricao: 'Trabalha glúteos, contração de 2 segundos no topo' }
            ],
            intermediario: [
                { nome: 'Stiff com Barra', series: 4, repeticoes: '8-10', carga: '35-50kg', descricao: 'Versão mais intensa, manter lombar neutra' },
                { nome: 'Mesa Flexora', series: 3, repeticoes: '10-12', carga: '30-40kg', descricao: 'Isolamento na máquina, evitar compensações' },
                { nome: 'Good Morning', series: 3, repeticoes: '10-12', carga: '20-30kg', descricao: 'Exercício técnico, flexão apenas do quadril' }
            ],
            avancado: [
                { nome: 'Levantamento Terra', series: 4, repeticoes: '6-8', carga: '80-120kg', descricao: 'Exercício completo de força, técnica perfeita essencial' },
                { nome: 'Stiff Unilateral', series: 3, repeticoes: '10-12 cada', carga: '15-20kg cada', descricao: 'Versão unilateral, desafia equilíbrio e estabilidade' },
                { nome: 'Hip Thrust', series: 3, repeticoes: '10-12', carga: '40-60kg', descricao: 'Foco nos glúteos, amplitude completa de movimento' }
            ]
        },
        panturrilha: {
            iniciante: [
                { nome: 'Panturrilha Sentado', series: 3, repeticoes: '15-20', carga: '20-30kg', descricao: 'Trabalha sóleo, amplitude completa de movimento' },
                { nome: 'Panturrilha em Pé', series: 3, repeticoes: '15-20', carga: '40-60kg', descricao: 'Trabalha gastrocnêmio, contração no topo' }
            ],
            intermediario: [
                { nome: 'Panturrilha Sentado', series: 4, repeticoes: '12-15', carga: '35-45kg', descricao: 'Maior intensidade, pausa de 1 segundo no topo' },
                { nome: 'Panturrilha Leg Press', series: 3, repeticoes: '15-20', carga: '80-120kg', descricao: 'Variação no leg press, apenas dedos na plataforma' }
            ],
            avancado: [
                { nome: 'Panturrilha Unilateral', series: 3, repeticoes: '12-15 cada', carga: '20-30kg cada', descricao: 'Trabalho unilateral, maior ativação neural' },
                { nome: 'Panturrilha com Pausa', series: 4, repeticoes: '10-12', carga: '50-70kg', descricao: 'Técnica de pausa, 3 segundos na contração máxima' }
            ]
        }
    },

    // Exercise descriptions database
    exerciseDescriptions: {
        'Supino Reto com Barra': 'Exercício fundamental para desenvolvimento do peitoral. Deitado no banco, segure a barra com pegada média, desça controladamente até o peito e empurre para cima.',
        'Supino Inclinado com Barra': 'Trabalha a parte superior do peitoral. Banco inclinado entre 30-45°, mesma execução do supino reto.',
        'Supino Declinado com Barra': 'Foco no peitoral inferior. Banco declinado, pés presos, execução similar ao supino reto.',
        'Supino com Halteres': 'Maior amplitude de movimento que a barra. Deitado no banco, empurre halteres para cima, controle a descida.',
        'Supino Inclinado with Halteres': 'Versão inclinada com halteres. Permite rotação dos punhos para melhor ativação muscular.',
        'Crucifixo com Halteres': 'Isolamento do peitoral. Movimento de abraço, mantenha cotovelos levemente flexionados.',
        'Crucifixo Inclinado': 'Versão inclinada do crucifixo, trabalha fibras superiores do peitoral.',
        'Crossover': 'Exercício no cabo, movimento cruzado. Excelente para definição e contração muscular.',
        'Flexão de Braços': 'Exercício básico de peso corporal. Mantenha corpo alinhado, desça até quase tocar o peito no solo.',
        'Mergulho em Paralelas': 'Exercício composto. Nas paralelas, desça flexionando os cotovelos, suba controladamente.',
        
        'Puxada Frontal': 'Exercício básico para latíssimo. Puxe a barra até o peito, retraia as escápulas.',
        'Puxada Atrás da Nuca': 'Variação da puxada, cuidado com a amplitude para evitar lesões no ombro.',
        'Barra Fixa': 'Exercício funcional clássico. Pegada pronada, puxe até o queixo passar da barra.',
        'Remada Baixa': 'Exercício sentado no cabo. Puxe até o abdômen, mantenha tronco ereto.',
        'Remada Curvada': 'Tronco inclinado, reme a barra até o abdômen. Mantenha lombar neutra.',
        'Remada com Halter': 'Unilateral, apoie no banco. Reme o halter até o quadril, cotovelo próximo ao corpo.',
        'Remada T-Bar': 'Exercício específico para espessura das costas. Use a máquina ou barra T.',
        'Levantamento Terra': 'Exercício complexo e completo. Técnica perfeita é essencial para evitar lesões.',
        'Pullover': 'Movimento arqueado, trabalha latíssimo e serrátil. Pode ser feito com halter ou barra.',
        
        'Desenvolvimento com Barra': 'Exercício base para ombros. Pode ser feito pela frente ou atrás da nuca.',
        'Desenvolvimento com Halteres': 'Versão com halteres, maior estabilização. Trajetória ligeiramente frontal.',
        'Desenvolvimento Arnold': 'Criado por Arnold Schwarzenegger. Combina rotação com desenvolvimento.',
        'Elevação Lateral': 'Isolamento do deltoide medial. Eleve os halteres até a linha dos ombros.',
        'Elevação Frontal': 'Trabalha deltoide anterior. Eleve à frente até a linha dos ombros.',
        'Elevação Posterior': 'Para deltoide posterior. Pode ser feito inclinado ou na polia.',
        'Encolhimento': 'Para trapézio. "Encolha" os ombros carregando peso.',
        'Face Pull': 'Exercício no cabo, puxe até o rosto. Excelente para postura e ombros posteriores.',
        
        'Rosca Direta': 'Exercício básico para bíceps. Pegada supinada, cotovelos fixos.',
        'Rosca Alternada': 'Versão alternada da rosca. Permite melhor concentração em cada braço.',
        'Rosca Martelo': 'Pegada neutra, trabalha bíceps e braquiorradial.',
        'Rosca Scott': 'No banco Scott, isolamento máximo do bíceps.',
        'Rosca Concentrada': 'Sentado, cotovelo apoiado na coxa. Máxima concentração.',
        'Rosca 21': 'Método especial: 7 parciais inferiores + 7 superiores + 7 completas.',
        'Rosca Spider': 'No banco inclinado invertido, isolamento total.',
        'Rosca no Cabo': 'Versão no cabo, tensão constante durante todo movimento.',
        
        'Tríceps Testa': 'Clássico para tríceps. Flexione apenas antebraços, cotovelos fixos.',
        'Tríceps Francês': 'Com halter atrás da cabeça. Movimento apenas dos antebraços.',
        'Tríceps Pulley': 'No cabo, extensão dos antebraços. Pegada pronada.',
        'Tríceps Corda': 'Com corda, permite abertura na contração final.',
        'Supino Fechado': 'Pegada fechada no supino, trabalha tríceps intensamente.',
        'Mergulho no Banco': 'Mãos no banco, exercício funcional básico.',
        
        'Agachamento Livre': 'Rei dos exercícios. Técnica perfeita é fundamental.',
        'Agachamento Frontal': 'Barra na frente, maior ativação do core e quadríceps.',
        'Leg Press': 'Exercício seguro para iniciantes, permite cargas altas.',
        'Extensão de Pernas': 'Isolamento do quadríceps, evite hiperextensão.',
        'Afundo': 'Exercício unilateral, trabalha equilíbrio e coordenação.',
        'Agachamento Búlgaro': 'Versão avançada do afundo, pé traseiro elevado.',
        'Hack Squat': 'Na máquina específica, movimento guiado e seguro.',
        
        'Stiff': 'Para posterior de coxa. Flexione quadril, joelhos levemente flexionados.',
        'Flexão de Pernas': 'Isolamento dos isquiotibiais. Contração forte no topo.',
        'Mesa Flexora': 'Versão deitada da flexão de pernas.',
        'Good Morning': 'Exercício técnico, flexão apenas do quadril.',
        'Hip Thrust': 'Excelente para glúteos, ombros apoiados no banco.',
        'Elevação Pélvica': 'Versão básica do hip thrust, no solo.',
        
        'Panturrilha em Pé': 'Para gastrocnêmio, pernas estendidas.',
        'Panturrilha Sentado': 'Para sóleo, joelhos flexionados.',
        'Panturrilha no Leg Press': 'Variação no leg press, apenas dedos na plataforma.',
        
        'Esteira': 'Aquecimento cardiovascular básico. 5-10 minutos em ritmo moderado.',
        'Bicicleta': 'Aquecimento para membros inferiores. Baixa intensidade inicial.',
        'Elíptico': 'Exercício completo de baixo impacto. Bom para aquecimento geral.',
        'Aquecimento Articular': 'Movimentos articulares específicos para preparar o corpo.',
        'Alongamento': 'Essencial para flexibilidade e recuperação muscular.'
    },

    // Application State
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

    // Initialize app
    init() {
        this.loadSavedPlans();
        this.setDefaultDates();
        this.showPlanList();
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Close modal when clicking outside
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.savePlan();
            }
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.showPlanCreator();
            }
            if (e.ctrlKey && e.key === 'i') {
                e.preventDefault();
                this.showAIPlanCreator();
            }
        });

        // Exercise name change handler
        const exerciseSelect = document.getElementById('exerciseName');
        if (exerciseSelect) {
            exerciseSelect.addEventListener('change', this.updateExerciseDescription.bind(this));
        }
    },

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.classList.remove('active'));
    },

    setDefaultDates() {
        const today = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 6);
        
        const startInput = document.getElementById('planStartDate');
        const endInput = document.getElementById('planEndDate');
        
        if (startInput) startInput.value = today.toISOString().split('T')[0];
        if (endInput) endInput.value = endDate.toISOString().split('T')[0];
    },

    showAIPlanCreator() {
        document.getElementById('aiPlanCreator').style.display = 'block';
        document.getElementById('planCreator').style.display = 'none';
        document.getElementById('planList').style.display = 'none';
        
        // Clear form
        const form = document.getElementById('aiPlanCreator');
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (input.type !== 'number') {
                input.value = '';
            }
        });
        
        // Set default values
        document.getElementById('aiStudentAge').value = 25;
        document.getElementById('aiAvailableDays').value = '3';
        document.getElementById('aiSessionTime').value = '60';
    },

    showPlanCreator(planId = null) {
        document.getElementById('planCreator').style.display = 'block';
        document.getElementById('aiPlanCreator').style.display = 'none';
        document.getElementById('planList').style.display = 'none';
        
        if (planId) {
            this.loadPlanForEditing(planId);
        } else {
            this.resetPlanForm();
            this.selectPlanType(1, 'A', document.querySelector('.plan-type-btn'));
        }
    },

    loadPlanForEditing(planId) {
        const plan = this.savedPlans.find(p => p.id === planId);
        if (!plan) return;

        this.isEditing = true;
        this.currentPlan = { ...plan };
        
        // Fill form with plan data
        document.getElementById('currentPlanId').value = planId;
        document.getElementById('studentName').value = plan.aluno?.nome || '';
        document.getElementById('studentAge').value = plan.perfil?.idade || '';
        document.getElementById('studentHeight').value = plan.perfil?.altura || '';
        document.getElementById('studentWeight').value = plan.perfil?.peso || '';
        document.getElementById('planName').value = plan.nome || '';
        document.getElementById('planObjective').value = plan.perfil?.objetivo || '';
        document.getElementById('planStartDate').value = plan.dataInicio || '';
        document.getElementById('planEndDate').value = plan.dataFim || '';
        document.getElementById('planObservations').value = plan.observacoes?.geral || '';
        
        // Set plan type
        this.selectedDays = plan.dias;
        this.selectPlanTypeForEdit(plan.dias);
        
        // Show cancel button
        document.getElementById('cancelEditBtn').style.display = 'inline-flex';
        
        this.showMessage('Modo de edição ativado 📝', 'success');
    },

    selectPlanTypeForEdit(days) {
        // Update active button
        document.querySelectorAll('.plan-type-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.plan-type-btn')[days - 1]?.classList.add('active');
        
        this.selectedDays = days;
        this.generateWorkoutEditorForEdit(days);
    },

    generateWorkoutEditorForEdit(days) {
        const editor = document.getElementById('workoutEditor');
        let html = '<div class="form-section"><h2>🏋️ Treinos</h2>';
        
        for (let i = 0; i < days; i++) {
            const workout = this.currentPlan.treinos[i] || {
                id: String.fromCharCode(65 + i), // A, B, C, etc.
                nome: `Treino ${String.fromCharCode(65 + i)}`,
                foco: 'Treino geral',
                exercicios: []
            };
            
            html += `
                <div class="workout-editor">
                    <div class="workout-header">
                        <h3 class="workout-title">${workout.nome}</h3>
                        <button class="btn btn-primary btn-small" onclick="app.addExercise(${i})">
                            ➕ Adicionar Exercício
                        </button>
                    </div>
                    <div class="exercise-list" id="exerciseList${i}">
                        ${this.renderExercises(workout.exercicios, i)}
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        editor.innerHTML = html;
    },

    cancelEdit() {
        this.isEditing = false;
        this.currentPlan = {
            id: null,
            nome: '',
            aluno: { nome: '', idade: 25, altura: '1,75m', peso: '75kg' },
            dias: 1,
            dataInicio: '',
            dataFim: '',
            perfil: { objetivo: 'Hipertrofia e ganho de massa muscular' },
            observacoes: {},
            treinos: []
        };
        document.getElementById('cancelEditBtn').style.display = 'none';
        document.getElementById('currentPlanId').value = '';
        this.showPlanList();
    },

    showPlanList() {
        document.getElementById('planCreator').style.display = 'none';
        document.getElementById('aiPlanCreator').style.display = 'none';
        document.getElementById('planList').style.display = 'block';
        this.renderPlanList();
    },

    resetPlanForm() {
        // Clear form inputs
        const inputs = document.querySelectorAll('#planCreator input, #planCreator textarea, #planCreator select');
        inputs.forEach(input => {
            if (input.type === 'number') {
                input.value = input.placeholder || '';
            } else {
                input.value = '';
            }
        });
        
        this.setDefaultDates();
        this.currentPlan.treinos = [];
        this.selectedDays = 1;
        this.isEditing = false;
        document.getElementById('cancelEditBtn').style.display = 'none';
        document.getElementById('currentPlanId').value = '';
    },

    selectPlanType(days, letters, element) {
        // Update active button
        document.querySelectorAll('.plan-type-btn').forEach(btn => btn.classList.remove('active'));
        element.classList.add('active');
        
        this.selectedDays = days;
        this.generateWorkoutEditor(days);
    },

    generateWorkoutEditor(days) {
        const editor = document.getElementById('workoutEditor');
        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        const workoutNames = {
            1: ['A - Corpo Inteiro'],
            2: ['A - Membros Superiores', 'B - Membros Inferiores'],
            3: ['A - Peito e Tríceps', 'B - Costas e Bíceps', 'C - Pernas e Ombros'],
            4: ['A - Peito e Tríceps', 'B - Costas e Bíceps', 'C - Ombros', 'D - Pernas'],
            5: ['A - Peito e Tríceps', 'B - Costas e Bíceps', 'C - Ombros e Trapézio', 'D - Pernas (Quadríceps)', 'E - Posterior e Core'],
            6: ['A - Peito', 'B - Costas', 'C - Ombros', 'D - Braços', 'E - Pernas (Quadríceps)', 'F - Posterior e Core']
        };

        let html = '<div class="form-section"><h2>🏋️ Treinos</h2>';
        
        // Initialize treinos array
        this.currentPlan.treinos = [];
        
        for (let i = 0; i < days; i++) {
            const workout = {
                id: letters[i],
                nome: workoutNames[days][i],
                foco: workoutNames[days][i].split(' - ')[1] || 'Treino geral',
                exercicios: [
                    {
                        id: i * 10 + 1,
                        nome: 'Aquecimento',
                        descricao: 'Aquecimento geral de 5-10 minutos',
                        series: 1,
                        repeticoes: '8-10 min',
                        carga: 'Leve',
                        descanso: '0',
                        observacoesEspeciais: '',
                        concluido: false
                    }
                ],
                concluido: false,
                execucoes: 0
            };
            
            this.currentPlan.treinos.push(workout);
            
            html += `
                <div class="workout-editor">
                    <div class="workout-header">
                        <h3 class="workout-title">${workout.nome}</h3>
                        <button class="btn btn-primary btn-small" onclick="app.addExercise(${i})">
                            ➕ Adicionar Exercício
                        </button>
                    </div>
                    <div class="exercise-list" id="exerciseList${i}">
                        ${this.renderExercises(workout.exercicios, i)}
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        editor.innerHTML = html;
    },

    renderExercises(exercicios, workoutIndex) {
        if (!exercicios || exercicios.length === 0) {
            return '<p>Nenhum exercício adicionado</p>';
        }

        return exercicios.map((ex, exIndex) => `
            <div class="exercise-item">
                <div class="exercise-info">
                    <div>
                        <div class="exercise-name">${ex.nome}</div>
                        <div class="exercise-description">${ex.descricao}</div>
                        ${ex.observacoesEspeciais ? `<div class="exercise-special-notes">${ex.observacoesEspeciais}</div>` : ''}
                    </div>
                    <div><strong>Séries:</strong> ${ex.series}</div>
                    <div><strong>Reps:</strong> ${ex.repeticoes}</div>
                    <div><strong>Carga:</strong> ${ex.carga}</div>
                    <div><strong>Descanso:</strong> ${ex.descanso || '60s'}</div>
                </div>
                <div class="exercise-actions">
                    <button class="btn btn-outline btn-small" onclick="app.editExercise(${workoutIndex}, ${exIndex})">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-danger btn-small" onclick="app.removeExercise(${workoutIndex}, ${exIndex})">
                        🗑️ Remover
                    </button>
                </div>
            </div>
        `).join('');
    },

    addExercise(workoutIndex) {
        const newExercise = {
            id: Date.now(),
            nome: 'Novo Exercício',
            descricao: 'Descrição do exercício',
            series: 3,
            repeticoes: '10-12',
            carga: '20kg',
            descanso: '90 segundos',
            observacoesEspeciais: '',
            concluido: false
        };
        
        this.currentPlan.treinos[workoutIndex].exercicios.push(newExercise);
        this.updateExerciseList(workoutIndex);
    },

    editExercise(workoutIndex, exerciseIndex) {
        this.currentWorkoutIndex = workoutIndex;
        this.currentExerciseIndex = exerciseIndex;
        
        const exercise = this.currentPlan.treinos[workoutIndex].exercicios[exerciseIndex];
        
        // Fill modal with exercise data
        const exerciseSelect = document.getElementById('exerciseName');
        const customGroup = document.getElementById('customExerciseGroup');
        const customInput = document.getElementById('customExerciseName');
        
        // Check if exercise name exists in options
        const option = Array.from(exerciseSelect.options).find(opt => opt.value === exercise.nome);
        if (option) {
            exerciseSelect.value = exercise.nome;
            customGroup.style.display = 'none';
        } else {
            exerciseSelect.value = 'custom';
            customGroup.style.display = 'block';
            customInput.value = exercise.nome;
        }
        
        document.getElementById('exerciseSets').value = exercise.series;
        document.getElementById('exerciseReps').value = exercise.repeticoes;
        document.getElementById('exerciseWeight').value = exercise.carga;
        document.getElementById('exerciseRest').value = exercise.descanso || '90 segundos';
        document.getElementById('exerciseDescription').value = exercise.descricao;
        
        // Handle special notes
        const specialSelect = document.getElementById('exerciseSpecialNotes');
        const customNotesGroup = document.getElementById('customNotesGroup');
        const customNotesInput = document.getElementById('customSpecialNotes');
        
        if (exercise.observacoesEspeciais) {
            const specialOption = Array.from(specialSelect.options).find(opt => opt.value === exercise.observacoesEspeciais);
            if (specialOption) {
                specialSelect.value = exercise.observacoesEspeciais;
                customNotesGroup.style.display = 'none';
            } else {
                specialSelect.value = 'custom';
                customNotesGroup.style.display = 'block';
                customNotesInput.value = exercise.observacoesEspeciais;
            }
        } else {
            specialSelect.value = '';
            customNotesGroup.style.display = 'none';
        }
        
        // Show modal
        document.getElementById('exerciseModal').classList.add('active');
    },

    updateExerciseDescription() {
        const exerciseSelect = document.getElementById('exerciseName');
        const customGroup = document.getElementById('customExerciseGroup');
        const descriptionTextarea = document.getElementById('exerciseDescription');
        
        if (exerciseSelect.value === 'custom') {
            customGroup.style.display = 'block';
            descriptionTextarea.value = '';
        } else {
            customGroup.style.display = 'none';
            // Set description from database
            const description = this.exerciseDescriptions[exerciseSelect.value] || 'Descrição não disponível';
            descriptionTextarea.value = description;
        }
    },

    updateSpecialNotesInput() {
        const specialSelect = document.getElementById('exerciseSpecialNotes');
        const customGroup = document.getElementById('customNotesGroup');
        
        if (specialSelect.value === 'custom') {
            customGroup.style.display = 'block';
        } else {
            customGroup.style.display = 'none';
        }
    },

    saveExercise() {
        if (this.currentWorkoutIndex === null || this.currentExerciseIndex === null) return;
        
        const exercise = this.currentPlan.treinos[this.currentWorkoutIndex].exercicios[this.currentExerciseIndex];
        
        const exerciseSelect = document.getElementById('exerciseName');
        const customName = document.getElementById('customExerciseName');
        const specialSelect = document.getElementById('exerciseSpecialNotes');
        const customNotes = document.getElementById('customSpecialNotes');
        
        // Set exercise name
        exercise.nome = exerciseSelect.value === 'custom' ? customName.value : exerciseSelect.value;
        exercise.series = parseInt(document.getElementById('exerciseSets').value) || 3;
        exercise.repeticoes = document.getElementById('exerciseReps').value;
        exercise.carga = document.getElementById('exerciseWeight').value;
        exercise.descanso = document.getElementById('exerciseRest').value;
        exercise.descricao = document.getElementById('exerciseDescription').value;
        
        // Set special notes
        exercise.observacoesEspeciais = specialSelect.value === 'custom' ? customNotes.value : specialSelect.value;
        
        this.updateExerciseList(this.currentWorkoutIndex);
        this.closeExerciseModal();
    },

    removeExercise(workoutIndex, exerciseIndex) {
        if (confirm('Tem certeza que deseja remover este exercício?')) {
            this.currentPlan.treinos[workoutIndex].exercicios.splice(exerciseIndex, 1);
            this.updateExerciseList(workoutIndex);
        }
    },

    updateExerciseList(workoutIndex) {
        const container = document.getElementById(`exerciseList${workoutIndex}`);
        if (container) {
            container.innerHTML = this.renderExercises(
                this.currentPlan.treinos[workoutIndex].exercicios, 
                workoutIndex
            );
        }
    },

    closeExerciseModal() {
        document.getElementById('exerciseModal').classList.remove('active');
        this.currentWorkoutIndex = null;
        this.currentExerciseIndex = null;
    },

    generateAIPlan() {
        // Get AI form data
        const aiData = {
            nome: document.getElementById('aiStudentName').value,
            idade: parseInt(document.getElementById('aiStudentAge').value) || 25,
            altura: document.getElementById('aiStudentHeight').value || '1,75m',
            peso: document.getElementById('aiStudentWeight').value || '75kg',
            objetivo: document.getElementById('aiPlanObjective').value,
            nivel: document.getElementById('aiExperienceLevel').value,
            dias: parseInt(document.getElementById('aiAvailableDays').value),
            tempo: parseInt(document.getElementById('aiSessionTime').value),
            equipamentos: document.getElementById('aiEquipment').value,
            foco: document.getElementById('aiMusclePreference').value,
            limitacoes: document.getElementById('aiLimitations').value,
            observacoes: document.getElementById('aiSpecialNotes').value
        };

        // Validation
        if (!aiData.nome) {
            this.showMessage('Por favor, preencha o nome do aluno', 'error');
            return;
        }

        // Show generating indicator
        const indicator = document.getElementById('generatingIndicator');
        const progressFill = document.getElementById('progressFill');
        indicator.classList.add('active');

        // Simulate AI generation with progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            progressFill.style.width = progress + '%';
        }, 200);

        // Generate plan after delay
        setTimeout(() => {
            clearInterval(progressInterval);
            progressFill.style.width = '100%';

            try {
                // Create AI-generated plan
                const aiGeneratedPlan = this.createAIPlan(aiData);
                
                // Save the AI generated plan
                const existingIndex = this.savedPlans.findIndex(p => p.id === aiGeneratedPlan.id);
                if (existingIndex >= 0) {
                    this.savedPlans[existingIndex] = { ...aiGeneratedPlan };
                } else {
                    this.savedPlans.push({ ...aiGeneratedPlan });
                }

                // Save to localStorage
                this.savePlansToStorage();
                
                // Hide indicator
                indicator.classList.remove('active');
                
                // Show success message and redirect to plan list
                this.showMessage('Plano gerado com sucesso pela IA! ✨', 'success');
                
                // Redirect to plan list after a short delay
                setTimeout(() => {
                    this.showPlanList();
                }, 1500);

            } catch (error) {
                console.error('Erro ao gerar plano:', error);
                indicator.classList.remove('active');
                this.showMessage('Erro ao gerar plano. Tente novamente.', 'error');
            }

        }, 2000 + Math.random() * 2000); // 2-4 seconds
    },

    createAIPlan(aiData) {
        const plan = {
            id: Date.now(),
            nome: `${this.getWorkoutLetters(aiData.dias)} - ${aiData.dias} Dias ${aiData.objetivo.split(' ')[0]} (${aiData.idade} anos)`,
            aluno: {
                nome: aiData.nome,
                idade: aiData.idade,
                altura: aiData.altura,
                peso: aiData.peso
            },
            dias: aiData.dias,
            dataInicio: new Date().toISOString().split('T')[0],
            dataFim: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 months
            perfil: {
                idade: aiData.idade,
                altura: aiData.altura,
                peso: aiData.peso,
                porte: this.calculateBodyType(aiData.altura, aiData.peso),
                objetivo: aiData.objetivo
            },
            treinos: this.generateAIWorkouts(aiData),
            observacoes: this.generateObservations(aiData)
        };

        return plan;
    },

    getWorkoutLetters(days) {
        const letters = ['A', 'AB', 'ABC', 'ABCD', 'ABCDE', 'ABCDEF'];
        return letters[days - 1] || 'A';
    },

    calculateBodyType(altura, peso) {
        const height = parseFloat(altura.replace('m', '').replace(',', '.'));
        const weight = parseFloat(peso.replace('kg', ''));
        const imc = weight / (height * height);
        
        if (imc < 18.5) return 'pequeno';
        if (imc < 25) return 'médio';
        return 'grande';
    },

    generateAIWorkouts(aiData) {
        const workouts = [];
        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        
        const workoutSplits = {
            2: [
                { nome: 'A - Membros Superiores', grupos: ['peito', 'costas', 'ombros', 'biceps', 'triceps'] },
                { nome: 'B - Membros Inferiores e Core', grupos: ['quadriceps', 'posterior', 'panturrilha'] }
            ],
            3: [
                { nome: 'A - Peito e Tríceps', grupos: ['peito', 'triceps'] },
                { nome: 'B - Costas e Bíceps', grupos: ['costas', 'biceps'] },
                { nome: 'C - Pernas e Ombros', grupos: ['quadriceps', 'posterior', 'ombros', 'panturrilha'] }
            ],
            4: [
                { nome: 'A - Peito e Tríceps', grupos: ['peito', 'triceps'] },
                { nome: 'B - Costas e Bíceps', grupos: ['costas', 'biceps'] },
                { nome: 'C - Ombros', grupos: ['ombros'] },
                { nome: 'D - Pernas', grupos: ['quadriceps', 'posterior', 'panturrilha'] }
            ],
            5: [
                { nome: 'A - Peito e Tríceps', grupos: ['peito', 'triceps'] },
                { nome: 'B - Costas e Bíceps', grupos: ['costas', 'biceps'] },
                { nome: 'C - Ombros e Trapézio', grupos: ['ombros'] },
                { nome: 'D - Pernas (Quadríceps e Glúteos)', grupos: ['quadriceps'] },
                { nome: 'E - Posterior de Coxa e Core', grupos: ['posterior', 'panturrilha'] }
            ],
            6: [
                { nome: 'A - Peito', grupos: ['peito'] },
                { nome: 'B - Costas', grupos: ['costas'] },
                { nome: 'C - Ombros', grupos: ['ombros'] },
                { nome: 'D - Braços', grupos: ['biceps', 'triceps'] },
                { nome: 'E - Pernas (Quadríceps)', grupos: ['quadriceps'] },
                { nome: 'F - Posterior e Core', grupos: ['posterior', 'panturrilha'] }
            ]
        };

        const split = workoutSplits[aiData.dias];
        
        split.forEach((workout, index) => {
            const exercises = this.generateExercisesForMuscleGroups(
                workout.grupos, 
                aiData.nivel, 
                aiData.objetivo,
                aiData.equipamentos,
                index + 1
            );

            workouts.push({
                id: letters[index],
                nome: workout.nome,
                foco: `Hipertrofia - ${workout.grupos.join(', ')}`,
                exercicios: exercises,
                concluido: false,
                execucoes: 0
            });
        });

        return workouts;
    },

    generateExercisesForMuscleGroups(grupos, nivel, objetivo, equipamentos, workoutNumber) {
        const exercises = [];
        let exerciseId = workoutNumber * 10;

        // Aquecimento
        exercises.push({
            id: exerciseId++,
            nome: this.getWarmupExercise(grupos),
            descricao: this.getWarmupDescription(grupos),
            series: 1,
            repeticoes: "8-10 min",
            carga: this.getWarmupIntensity(),
            descanso: '0',
            observacoesEspeciais: '',
            concluido: false
        });

        // Exercícios por grupo muscular
        grupos.forEach(grupo => {
            if (this.exerciseDatabase[grupo] && this.exerciseDatabase[grupo][nivel]) {
                const groupExercises = this.exerciseDatabase[grupo][nivel];
                
                // Selecionar 2-4 exercícios por grupo dependendo do número de grupos
                const numExercises = grupos.length <= 2 ? 4 : (grupos.length <= 3 ? 3 : 2);
                
                for (let i = 0; i < Math.min(numExercises, groupExercises.length); i++) {
                    const baseExercise = groupExercises[i];
                    exercises.push({
                        id: exerciseId++,
                        nome: baseExercise.nome,
                        descricao: baseExercise.descricao,
                        series: baseExercise.series,
                        repeticoes: baseExercise.repeticoes,
                        carga: this.adjustLoadForLevel(baseExercise.carga, nivel),
                        descanso: this.getRestByObjective(objetivo),
                        observacoesEspeciais: this.getRandomSpecialNote(nivel),
                        concluido: false
                    });
                }
            }
        });

        // Alongamento
        if (exercises.length > 1) {
            exercises.push({
                id: exerciseId++,
                nome: "Alongamento",
                descricao: "Relaxamento e flexibilidade dos grupos musculares trabalhados",
                series: 1,
                repeticoes: "8-10 min",
                carga: "Peso corporal",
                descanso: '0',
                observacoesEspeciais: '',
                concluido: false
            });
        }

        return exercises;
    },

    getWarmupExercise(grupos) {
        if (grupos.includes('quadriceps') || grupos.includes('posterior')) {
            return "Bicicleta";
        } else if (grupos.includes('costas')) {
            return "Remo Ergômetro";
        } else if (grupos.includes('ombros')) {
            return "Elíptico";
        } else {
            return "Esteira";
        }
    },

    getWarmupDescription(grupos) {
        if (grupos.includes('quadriceps') || grupos.includes('posterior')) {
            return "Aquecimento específico para membros inferiores em ritmo moderado";
        } else if (grupos.includes('costas')) {
            return "Aquecimento específico para movimentos de puxar";
        } else if (grupos.includes('ombros')) {
            return "Aquecimento com mobilização de braços";
        } else {
            return "Caminhada moderada para aquecimento geral";
        }
    },

    getWarmupIntensity() {
        return "Intensidade moderada";
    },

    getRandomSpecialNote(nivel) {
        const specialNotes = {
            iniciante: ['', '', '', ''], // Mais chances de nenhuma observação especial
            intermediario: ['', '', 'Drop set', 'Bi-set', 'Tempo controlado'],
            avancado: ['Drop set', 'Bi-set', 'Rest-pause', 'Negativa', 'Método 21', 'Pirâmide crescente']
        };
        
        const notes = specialNotes[nivel] || specialNotes.intermediario;
        return notes[Math.floor(Math.random() * notes.length)];
    },

    adjustLoadForLevel(baseCarga, nivel) {
        if (typeof baseCarga !== 'string') return baseCarga;
        
        const multipliers = {
            iniciante: 0.7,
            intermediario: 1.0,
            avancado: 1.3
        };
        
        const multiplier = multipliers[nivel] || 1.0;
        
        // Extract numbers from carga string and adjust
        return baseCarga.replace(/(\d+)/g, (match) => {
            const num = parseInt(match);
            const adjusted = Math.round(num * multiplier);
            return adjusted.toString();
        });
    },

    generateObservations(aiData) {
        return {
            frequencia: `${aiData.dias}x por semana com ${7 - aiData.dias} dia${7 - aiData.dias > 1 ? 's' : ''} de descanso por semana`,
            progressao: this.getProgressionByLevel(aiData.nivel),
            descanso: this.getRestByObjective(aiData.objetivo),
            hidratacao: "Beba pelo menos 2,5-3L de água por dia, especialmente durante os treinos",
            alimentacao: this.getNutritionByObjective(aiData.objetivo),
            suplementacao: "Considere whey protein, creatina e multivitamínico (consulte nutricionista)",
            sono: "Durma 7-9 horas por noite para recuperação muscular adequada",
            aquecimento: "Sempre faça aquecimento específico antes dos exercícios principais",
            tecnica: "Priorize a execução perfeita sobre cargas altas",
            periodizacao: "A cada 6-8 semanas, faça uma semana de deload com 60% da carga",
            consulta: "Acompanhamento profissional é essencial para ajustes e progressão segura",
            geral: aiData.observacoes || ''
        };
    },

    getProgressionByLevel(nivel) {
        const progressions = {
            iniciante: "Aumente a carga em 2,5kg quando conseguir executar todas as séries no limite superior de repetições",
            intermediario: "Aumente a carga em 2,5-5kg quando conseguir executar todas as séries no limite superior de repetições",
            avancado: "Aumente a carga em 2,5-5kg ou use técnicas avançadas quando conseguir executar todas as séries facilmente"
        };
        return progressions[nivel] || progressions.intermediario;
    },

    getRestByObjective(objetivo) {
        if (objetivo.includes('Hipertrofia')) {
            return "90-120 segundos";
        } else if (objetivo.includes('Força')) {
            return "180-300 segundos";
        } else if (objetivo.includes('Perda de peso')) {
            return "60-90 segundos";
        } else {
            return "90 segundos";
        }
    },

    getNutritionByObjective(objetivo) {
        if (objetivo.includes('Hipertrofia')) {
            return "Consuma 2,0-2,2g de proteína por kg de peso corporal diariamente para hipertrofia";
        } else if (objetivo.includes('Perda de peso')) {
            return "Mantenha déficit calórico moderado com 1,8-2,0g de proteína por kg de peso";
        } else if (objetivo.includes('Força')) {
            return "Consuma 1,8-2,0g de proteína por kg de peso com carboidratos adequados para energia";
        } else {
            return "Siga uma dieta balanceada com 1,6-2,0g de proteína por kg de peso corporal";
        }
    },

    savePlan() {
        try {
            // Get data from manual form
            const currentPlanId = document.getElementById('currentPlanId').value;
            const isEditingPlan = this.isEditing && currentPlanId;
            
            const planData = {
                id: isEditingPlan ? parseInt(currentPlanId) : Date.now(),
                nome: document.getElementById('planName')?.value || 'Plano sem nome',
                aluno: {
                    nome: document.getElementById('studentName')?.value || '',
                    idade: parseInt(document.getElementById('studentAge')?.value) || 25,
                    altura: document.getElementById('studentHeight')?.value || '1,75m',
                    peso: document.getElementById('studentWeight')?.value || '75kg'
                },
                dias: this.selectedDays,
                dataInicio: document.getElementById('planStartDate')?.value || new Date().toISOString().split('T')[0],
                dataFim: document.getElementById('planEndDate')?.value || '',
                perfil: {
                    idade: parseInt(document.getElementById('studentAge')?.value) || 25,
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

            // Validation
            if (!planData.nome || planData.nome === 'Plano sem nome') {
                this.showMessage('Por favor, preencha o nome do plano', 'error');
                return;
            }

            // Save or update plan
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

    editPlan(planId) {
        this.showPlanCreator(planId);
    },

    deletePlan(planId) {
        if (confirm('Tem certeza que deseja excluir este plano?')) {
            this.savedPlans = this.savedPlans.filter(plan => plan.id !== planId);
            this.savePlansToStorage();
            this.showMessage('Plano excluído com sucesso', 'success');
            this.renderPlanList();
        }
    },

    exportPlan(planId) {
        const plan = this.savedPlans.find(p => p.id === planId);
        if (!plan) return;

        // Create export structure similar to the JSON format
        const exportData = {
            planos: [plan]
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `plano_${plan.nome.replace(/\s+/g, '_').toLowerCase().replace(/[^a-z0-9_]/g, '')}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showMessage('Plano exportado com sucesso! 📤', 'success');
    },

    importPlan(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Handle different import formats
                let plansToImport = [];
                
                if (importedData.planos) {
                    // New format with planos array
                    plansToImport = importedData.planos;
                } else if (Array.isArray(importedData)) {
                    // Array of plans
                    plansToImport = importedData;
                } else {
                    // Single plan object
                    plansToImport = [importedData];
                }
                
                plansToImport.forEach(planData => {
                    // Assign new ID to avoid conflicts
                    planData.id = Date.now() + Math.random();
                    planData.nome = planData.nome + ' (Importado)';
                    
                    // Ensure proper structure
                    if (!planData.aluno) {
                        planData.aluno = {
                            nome: '',
                            idade: planData.perfil?.idade || 25,
                            altura: planData.perfil?.altura || '1,75m',
                            peso: planData.perfil?.peso || '75kg'
                        };
                    }
                    
                    // Ensure exercises have all required fields
                    if (planData.treinos) {
                        planData.treinos.forEach(treino => {
                            if (treino.exercicios) {
                                treino.exercicios.forEach(ex => {
                                    if (!ex.descanso) ex.descanso = '90 segundos';
                                    if (!ex.observacoesEspeciais) ex.observacoesEspeciais = '';
                                });
                            }
                        });
                    }
                    
                    this.savedPlans.push(planData);
                });
                
                this.savePlansToStorage();
                
                this.showMessage(`${plansToImport.length} plano(s) importado(s) com sucesso! 📥`, 'success');
                this.renderPlanList();
                
            } catch (error) {
                console.error('Erro ao importar plano:', error);
                this.showMessage('Erro ao importar plano. Verifique o arquivo.', 'error');
            }
        };
        reader.readAsText(file);
        
        // Clear file input
        event.target.value = '';
    },

    loadSavedPlans() {
        try {
            const stored = localStorage.getItem('jsfitapp_plans');
            if (stored) {
                this.savedPlans = JSON.parse(stored);
                
                // Migrate old plans to new structure
                this.savedPlans.forEach(plan => {
                    if (!plan.aluno && plan.perfil) {
                        plan.aluno = {
                            nome: '',
                            idade: plan.perfil.idade || 25,
                            altura: plan.perfil.altura || '1,75m',
                            peso: plan.perfil.peso || '75kg'
                        };
                    }
                    
                    // Ensure exercises have all required fields
                    if (plan.treinos) {
                        plan.treinos.forEach(treino => {
                            if (treino.exercicios) {
                                treino.exercicios.forEach(ex => {
                                    if (!ex.descanso) ex.descanso = '90 segundos';
                                    if (!ex.observacoesEspeciais) ex.observacoesEspeciais = '';
                                });
                            }
                        });
                    }
                });
                
                this.savePlansToStorage(); // Save migrated data
            }
        } catch (error) {
            console.error('Erro ao carregar planos:', error);
            this.savedPlans = [];
        }
    },

    savePlansToStorage() {
        try {
            localStorage.setItem('jsfitapp_plans', JSON.stringify(this.savedPlans));
        } catch (error) {
            console.error('Erro ao salvar planos:', error);
        }
    },

    renderPlanList() {
        const container = document.getElementById('planListContent');
        if (!container) return;

        if (this.savedPlans.length === 0) {
            container.innerHTML = `
                <div class="plan-card">
                    <h3>Nenhum plano encontrado</h3>
                    <p>Crie seu primeiro plano de treino clicando em "Novo Plano" ou "Criar com IA"!</p>
                    <div class="plan-card-actions">
                        <button class="btn btn-primary btn-small" onclick="app.showAIPlanCreator()">
                            🤖 Criar com IA
                        </button>
                        <button class="btn btn-secondary btn-small" onclick="app.showPlanCreator()">
                            ➕ Criar Manualmente
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.savedPlans.map(plan => `
            <div class="plan-card">
                <h3>${plan.nome}</h3>
                <p><strong>Aluno:</strong> ${plan.aluno?.nome || 'Não informado'}</p>
                <p><strong>Período:</strong> ${this.formatDate(plan.dataInicio)} até ${this.formatDate(plan.dataFim)}</p>
                <p><strong>Frequência:</strong> ${plan.dias} dias por semana</p>
                <p><strong>Objetivo:</strong> ${plan.perfil?.objetivo || 'Não especificado'}</p>
                <p><strong>Treinos:</strong> ${plan.treinos?.length || 0} dias configurados</p>
                <div class="plan-card-actions">
                    <button class="btn btn-primary btn-small" onclick="app.viewPlan(${plan.id})">
                        👁️ Visualizar
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="app.editPlan(${plan.id})">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-outline btn-small" onclick="app.exportPlan(${plan.id})">
                        📤 Exportar
                    </button>
                    <button class="btn btn-danger btn-small" onclick="app.deletePlan(${plan.id})">
                        🗑️ Excluir
                    </button>
                </div>
            </div>
        `).join('');
    },

    viewPlan(planId) {
        const plan = this.savedPlans.find(p => p.id === planId);
        if (!plan) return;

        // Fill modal with plan details
        document.getElementById('planModalTitle').textContent = plan.nome;
        
        let content = `
            <div class="plan-details">
                <h3>📊 Informações Gerais</h3>
                <p><strong>Aluno:</strong> ${plan.aluno?.nome || 'Não informado'}</p>
                <p><strong>Frequência:</strong> ${plan.dias} dias por semana</p>
                <p><strong>Período:</strong> ${this.formatDate(plan.dataInicio)} até ${this.formatDate(plan.dataFim)}</p>
                <p><strong>Objetivo:</strong> ${plan.perfil?.objetivo || 'Não especificado'}</p>
                ${plan.perfil?.idade ? `<p><strong>Idade:</strong> ${plan.perfil.idade} anos</p>` : ''}
                ${plan.perfil?.altura ? `<p><strong>Altura:</strong> ${plan.perfil.altura}</p>` : ''}
                ${plan.perfil?.peso ? `<p><strong>Peso:</strong> ${plan.perfil.peso}</p>` : ''}
            </div>
        `;

        if (plan.treinos && plan.treinos.length > 0) {
            content += `
                <div class="workout-tabs">
                    ${plan.treinos.map((treino, index) => `
                        <div class="workout-tab ${index === 0 ? 'active' : ''}" onclick="app.switchWorkoutTab(${index})">
                            ${treino.id || treino.nome}
                        </div>
                    `).join('')}
                </div>
            `;

            plan.treinos.forEach((treino, index) => {
                content += `
                    <div class="workout-content ${index === 0 ? 'active' : ''}" id="workoutContent${index}">
                        <h3>${treino.nome}</h3>
                        <p><strong>Foco:</strong> ${treino.foco}</p>
                        
                        ${treino.exercicios ? treino.exercicios.map(ex => `
                            <div class="exercise-card">
                                <div class="exercise-header">
                                    <strong>${ex.nome}</strong>
                                    ${ex.observacoesEspeciais ? `<div class="exercise-special-display">${ex.observacoesEspeciais}</div>` : ''}
                                </div>
                                <p>${ex.descricao}</p>
                                <div class="exercise-specs">
                                    <div class="spec-item">
                                        <span class="spec-label">Séries</span>
                                        <span class="spec-value">${ex.series}</span>
                                    </div>
                                    <div class="spec-item">
                                        <span class="spec-label">Reps</span>
                                        <span class="spec-value">${ex.repeticoes}</span>
                                    </div>
                                    <div class="spec-item">
                                        <span class="spec-label">Carga</span>
                                        <span class="spec-value">${ex.carga}</span>
                                    </div>
                                    <div class="spec-item">
                                        <span class="spec-label">Descanso</span>
                                        <span class="spec-value">${ex.descanso || '90s'}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('') : '<p>Nenhum exercício configurado</p>'}
                    </div>
                `;
            });
        }

        if (plan.observacoes) {
            content += `
                <div class="plan-details">
                    <h3>📝 Observações</h3>
                    ${Object.entries(plan.observacoes).map(([key, value]) => 
                        value ? `<p><strong>${this.getObservationLabel(key)}:</strong> ${value}</p>` : ''
                    ).join('')}
                </div>
            `;
        }

        document.getElementById('planModalContent').innerHTML = content;
        document.getElementById('planModal').classList.add('active');
    },

    switchWorkoutTab(index) {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.workout-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.workout-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        document.querySelectorAll('.workout-tab')[index].classList.add('active');
        document.getElementById(`workoutContent${index}`).classList.add('active');
    },

    getObservationLabel(key) {
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
    },

    closePlanModal() {
        document.getElementById('planModal').classList.remove('active');
    },

    formatDate(dateString) {
        if (!dateString) return 'Não definido';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    },

    showMessage(message, type = 'success') {
        // Remove any existing messages
        const existingMessages = document.querySelectorAll('.success-message, .error-message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.innerHTML = `
            <span>${type === 'success' ? '✅' : '❌'}</span>
            <span>${message}</span>
        `;

        // Insert after header
        const header = document.querySelector('.header');
        if (header) {
            header.insertAdjacentElement('afterend', messageDiv);
            
            // Auto remove after 3 seconds
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 3000);
        }
    }
};

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', function() {
    app.init();
});

// Fallback initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init.bind(app));
} else {
    app.init();
} 