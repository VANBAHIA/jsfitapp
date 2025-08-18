/**
 * Base de dados de exercícios
 * @module ExerciseDatabase
 */

export const EXERCISE_DATABASE = {
    peito: {
        iniciante: [
            { nome: 'Flexão de Braços', series: 3, repeticoes: '8-12', carga: 'Peso corporal', descricao: 'Posição de prancha, descer o peito até quase tocar o chão, manter core contraído' },
            { nome: 'Supino com Halteres', series: 3, repeticoes: '10-12', carga: '12-15kg cada', descricao: 'Deitado no banco, empurrar halteres para cima, controlar a descida' },
            { nome: 'Crucifixo com Halteres', series: 3, repeticoes: '12-15', carga: '8-10kg cada', descricao: 'Abrir e fechar os braços em movimento de abraço, leve flexão no cotovelo' }
        ],
        intermediario: [
            { nome: 'Supino Reto com Barra', series: 4, repeticoes: '8-10', carga: '40-60kg', descricao: 'Exercício fundamental para desenvolvimento do peitoral, pegada média' },
            { nome: 'Supino Inclinado', series: 3, repeticoes: '10-12', carga: '30-45kg', descricao: 'Trabalha a parte superior do peitoral, banco a 30-45 graus' },
            { nome: 'Crossover', series: 3, repeticoes: '12-15', carga: '15-25kg', descricao: 'Movimento de cruz trabalhando definição, contração no final' }
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
};

/**
 * Obtém exercícios por grupo muscular e nível
 * @param {string} muscleGroup - Grupo muscular
 * @param {string} level - Nível do praticante
 * @returns {Array} Lista de exercícios
 */
export const getExercisesByGroup = (muscleGroup, level) => {
    return EXERCISE_DATABASE[muscleGroup]?.[level] || [];
};

/**
 * Obtém todos os grupos musculares disponíveis
 * @returns {Array} Lista de grupos musculares
 */
export const getMuscleGroups = () => {
    return Object.keys(EXERCISE_DATABASE);
};

/**
 * Obtém exercício específico por nome
 * @param {string} exerciseName - Nome do exercício
 * @returns {Object|null} Exercício encontrado
 */
export const getExerciseByName = (exerciseName) => {
    for (const muscleGroup of Object.values(EXERCISE_DATABASE)) {
        for (const level of Object.values(muscleGroup)) {
            const exercise = level.find(ex => ex.nome === exerciseName);
            if (exercise) return exercise;
        }
    }
    return null;
};

/**
 * Busca exercícios por termo
 * @param {string} searchTerm - Termo de busca
 * @returns {Array} Exercícios encontrados
 */
export const searchExercises = (searchTerm) => {
    const results = [];
    const term = searchTerm.toLowerCase();
    
    for (const [muscleGroup, levels] of Object.entries(EXERCISE_DATABASE)) {
        for (const [level, exercises] of Object.entries(levels)) {
            exercises.forEach(exercise => {
                if (exercise.nome.toLowerCase().includes(term) ||
                    exercise.descricao.toLowerCase().includes(term)) {
                    results.push({
                        ...exercise,
                        muscleGroup,
                        level
                    });
                }
            });
        }
    }
    
    return results;
};