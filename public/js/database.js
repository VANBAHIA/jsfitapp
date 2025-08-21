 // =============================================
    // BASE DE DADOS DE TÉCNICAS AVANÇADAS
    // =============================================
    
    tecnicasDatabase: {
        'pre-exaustao': 'Exercício de isolamento antes do composto para pré-fadigar o músculo alvo',
        'pos-exaustao': 'Exercício de isolamento após o composto para finalizar o músculo',
        'bi-set': 'Dois exercícios executados em sequência sem descanso',
        'tri-set': 'Três exercícios executados em sequência sem descanso',
        'drop-set': 'Redução progressiva da carga na mesma série',
        'rest-pause': 'Pause breves durante a série para completar mais repetições',
        'serie-queima': 'Repetições parciais no final da série até a falha',
        'tempo-controlado': 'Execução lenta e controlada (3-4 segundos na fase excêntrica)',
        'pausa-contracao': 'Pausa de 1-2 segundos na contração máxima',
        'unilateral-alternado': 'Execução alternada entre membros',
        'piramide-crescente': 'Aumento progressivo da carga a cada série',
        'piramide-decrescente': 'Diminuição progressiva da carga a cada série',
        'clusters': 'Séries divididas em mini-séries com pausas curtas',
        'negativas': 'Enfase na fase excêntrica do movimento',
        'isometrico': 'Contração muscular sem movimento articular',
        'metodo-21': 'Série de 21 repetições (7 parciais + 7 parciais + 7 completas)',
        'onda': 'Variação de repetições em padrão ondulatório',
        'strip-set': 'Redução de carga sem pausa entre as mudanças'
    },

    // Técnicas por nível de experiência
    tecnicasPorNivel: {
        iniciante: ['tempo-controlado', 'pausa-contracao'],
        intermediario: ['pre-exaustao', 'pos-exaustao', 'drop-set', 'bi-set', 'tempo-controlado', 'pausa-contracao'],
        avancado: ['pre-exaustao', 'pos-exaustao', 'bi-set', 'tri-set', 'drop-set', 'rest-pause', 'serie-queima', 'clusters', 'negativas', 'metodo-21', 'strip-set']
    },

    // =============================================
    // BASE DE DADOS DE EXERCÍCIOS
    // =============================================
    
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
    },

    // =============================================
    // BASE DE DADOS DE DESCRIÇÕES DE EXERCÍCIOS
    // =============================================
    
    exerciseDescriptions: {
        'Supino Reto com Barra': 'Exercício fundamental para desenvolvimento do peitoral. Deitado no banco, segure a barra com pegada média, desça controladamente até o peito e empurre para cima.',
        'Supino Inclinado com Barra': 'Trabalha a parte superior do peitoral. Banco inclinado entre 30-45°, mesma execução do supino reto.',
        'Supino Declinado com Barra': 'Foco no peitoral inferior. Banco declinado, pés presos, execução similar ao supino reto.',
        'Supino com Halteres': 'Maior amplitude de movimento que a barra. Deitado no banco, empurre halteres para cima, controle a descida.',
        'Supino Inclinado com Halteres': 'Versão inclinada com halteres. Permite rotação dos punhos para melhor ativação muscular.',
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
