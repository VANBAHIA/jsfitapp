// =============================================
// BASE DE DADOS DE EXERCÍCIOS
// =============================================

exerciseDatabase: {
    peito: {
        iniciante: [
            { 
                codigo: 'PEI001',
                nome: 'Flexão de Braços', 
                series: 3, 
                repeticoes: '8-12', 
                carga: 'Peso corporal', 
                descricao: 'Posição de prancha, descer o peito até quase tocar o chão, manter core contraído',
                gif: '/images/56.gif'
            },
            { 
                codigo: 'PEI002',
                nome: 'Supino com Halteres', 
                series: 3, 
                repeticoes: '10-12', 
                carga: '12-15kg cada', 
                descricao: 'Deitado no banco, empurrar halteres para cima, controlar a descida',
                gif: '/images/104.gif'
            },
            { 
                codigo: 'PEI003',
                nome: 'Crucifixo com Halteres', 
                series: 3, 
                repeticoes: '12-15', 
                carga: '8-10kg cada', 
                descricao: 'Abrir e fechar os braços em movimento de abraço, leve flexão no cotovelo',
                gif: '/images/38.gif'
            }
        ],
        intermediario: [
            { 
                codigo: 'PEE004',
                nome: 'Supino Reto com Barra', 
                series: 4, 
                repeticoes: '8-10', 
                carga: '40-60kg', 
                descricao: 'Exercício fundamental para desenvolvimento do peitoral, pegada média',
                gif: '/images/106.gif'
            },
            { 
                codigo: 'PEE005',
                nome: 'Supino Inclinado', 
                series: 3, 
                repeticoes: '10-12', 
                carga: '30-45kg', 
                descricao: 'Trabalha a parte superior do peitoral, banco a 30-45 graus',
                gif: '/images/107.gif'
            },
            { 
                codigo: 'PEE006',
                nome: 'Crossover', 
                series: 3, 
                repeticoes: '12-15', 
                carga: '15-25kg', 
                descricao: 'Movimento de cruz trabalhando definição, contração no final',
                gif: '/images/34.gif'
            }
        ],
        avancado: [
            { 
                codigo: 'PEA007',
                nome: 'Supino Reto com Barra', 
                series: 4, 
                repeticoes: '6-8', 
                carga: '60-80kg', 
                descricao: 'Foco em força e massa muscular, execução controlada',
                gif: '/images/106.gif'
            },
            { 
                codigo: 'PEA008',
                nome: 'Supino Inclinado com Halteres', 
                series: 4, 
                repeticoes: '8-10', 
                carga: '22-28kg cada', 
                descricao: 'Maior amplitude de movimento, rotação dos halteres',
                gif: '/images/105.gif'
            },
            { 
                codigo: 'PEA009',
                nome: 'Mergulho em Paralelas', 
                series: 3, 
                repeticoes: '8-12', 
                carga: 'Peso corporal + 10-20kg', 
                descricao: 'Exercício composto para peitoral inferior, inclinação frontal',
                gif: '/images/161.gif'
            }
        ]
    },
    costas: {
        iniciante: [
            { 
                codigo: 'COI010',
                nome: 'Puxada Frontal', 
                series: 3, 
                repeticoes: '10-12', 
                carga: '30-40kg', 
                descricao: 'Puxar barra até o peito, contrair escápulas, peito para fora',
                gif: '/images/85.gif'
            },
            { 
                codigo: 'COI011',
                nome: 'Remada Baixa', 
                series: 3, 
                repeticoes: '10-12', 
                carga: '25-35kg', 
                descricao: 'Puxar cabo em direção ao abdômen, manter tronco ereto',
                gif: '/images/251.gif'
            },
            { 
                codigo: 'COI012',
                nome: 'Remada com Halter', 
                series: 3, 
                repeticoes: '10-12', 
                carga: '12-16kg', 
                descricao: 'Apoiar joelho no banco, remar halter até o quadril',
                gif: '/images/97.gif'
            }
        ],
        intermediario: [
            { 
                codigo: 'COE013',
                nome: 'Puxada Frontal', 
                series: 4, 
                repeticoes: '8-10', 
                carga: '45-60kg', 
                descricao: 'Desenvolvimento do latíssimo do dorso, pegada média',
                gif: '/images/85.gif'
            },
            { 
                codigo: 'COE014',
                nome: 'Remada Curvada', 
                series: 4, 
                repeticoes: '8-10', 
                carga: '35-50kg', 
                descricao: 'Inclinar tronco a 45 graus, remar barra ao abdômen',
                gif: '/images/93.gif'
            },
            { 
                codigo: 'COE015',
                nome: 'Pullover', 
                series: 3, 
                repeticoes: '12-15', 
                carga: '15-20kg', 
                descricao: 'Alongamento e contração do latíssimo, movimento arqueado',
                gif: '/images/86.gif'
            }
        ],
        avancado: [
            { 
                codigo: 'COA016',
                nome: 'Barra Fixa', 
                series: 4, 
                repeticoes: '6-10', 
                carga: 'Peso corporal + 10-20kg', 
                descricao: 'Exercício funcional de peso corporal, pegada pronada',
                gif: '/images/29.gif'
            },
            { 
                codigo: 'COA017',
                nome: 'Remada T-Bar', 
                series: 4, 
                repeticoes: '8-10', 
                carga: '40-60kg', 
                descricao: 'Trabalha espessura das costas, pegada neutra',
                gif: '/images/93.gif'
            },
            { 
                codigo: 'COA018',
                nome: 'Levantamento Terra', 
                series: 4, 
                repeticoes: '6-8', 
                carga: '80-120kg', 
                descricao: 'Exercício completo para posterior, técnica perfeita essencial',
                gif: '/images/_terra.gif'
            }
        ]
    },
    ombros: {
        iniciante: [
            { 
                codigo: 'OMI019',
                nome: 'Desenvolvimento com Halteres', 
                series: 3, 
                repeticoes: '10-12', 
                carga: '8-12kg cada', 
                descricao: 'Elevar halteres acima da cabeça, trajetória ligeiramente frontal',
                gif: '/images/42.gif'
            },
            { 
                codigo: 'OMI020',
                nome: 'Elevação Lateral', 
                series: 3, 
                repeticoes: '12-15', 
                carga: '4-6kg cada', 
                descricao: 'Trabalha deltoide medial, cotovelos ligeiramente flexionados',
                gif: '/images/52.gif'
            },
            { 
                codigo: 'OMI021',
                nome: 'Elevação Frontal', 
                series: 3, 
                repeticoes: '12-15', 
                carga: '4-6kg cada', 
                descricao: 'Foco no deltoide anterior, alternado ou simultâneo',
                gif: '/images/51.gif'
            }
        ],
        intermediario: [
            { 
                codigo: 'OME022',
                nome: 'Desenvolvimento com Barra', 
                series: 4, 
                repeticoes: '8-10', 
                carga: '25-35kg', 
                descricao: 'Exercício base para ombros, pela frente ou atrás da nuca',
                gif: '/images/40.gif'
            },
            { 
                codigo: 'OME023',
                nome: 'Elevação Lateral', 
                series: 3, 
                repeticoes: '12-15', 
                carga: '6-8kg cada', 
                descricao: 'Definição lateral dos ombros, controle excêntrico',
                gif: '/images/52.gif'
            },
            { 
                codigo: 'OME024',
                nome: 'Elevação Posterior', 
                series: 3, 
                repeticoes: '12-15', 
                carga: '4-6kg cada', 
                descricao: 'Trabalha deltoide posterior, inclinado ou na polia',
                gif: '/images/36.gif'
            }
        ],
        avancado: [
            { 
                codigo: 'OMA025',
                nome: 'Desenvolvimento Arnold', 
                series: 4, 
                repeticoes: '8-10', 
                carga: '14-18kg cada', 
                descricao: 'Movimento completo de rotação, combina frontal e lateral',
                gif: '/images/42.gif'
            },
            { 
                codigo: 'OMA026',
                nome: 'Elevação Lateral 21', 
                series: 3, 
                repeticoes: '21 (7+7+7)', 
                carga: '6-8kg cada', 
                descricao: 'Método 21 para intensidade, 7 parciais + 7 parciais + 7 completas',
                gif: '/images/52.gif'
            },
            { 
                codigo: 'OMA027',
                nome: 'Face Pull', 
                series: 3, 
                repeticoes: '15-20', 
                carga: '15-25kg', 
                descricao: 'Trabalha deltoide posterior e trapézio, corda no rosto',
                gif: '/images/36.gif'
            }
        ]
    },
    biceps: {
        iniciante: [
            { 
                codigo: 'BII028',
                nome: 'Rosca Direta', 
                series: 3, 
                repeticoes: '10-12', 
                carga: '15-20kg', 
                descricao: 'Exercício básico para bíceps, pegada supinada, cotovelos fixos',
                gif: '/images/102.gif'
            },
            { 
                codigo: 'BII029',
                nome: 'Rosca Alternada', 
                series: 3, 
                repeticoes: '10-12', 
                carga: '8-10kg cada', 
                descricao: 'Alternando braços para melhor controle e concentração',
                gif: '/images/98.gif'
            },
            { 
                codigo: 'BII030',
                nome: 'Rosca Martelo', 
                series: 3, 
                repeticoes: '12-15', 
                carga: '6-8kg cada', 
                descricao: 'Trabalha bíceps e antebraço, pegada neutra',
                gif: '/images/99.gif'
            }
        ],
        intermediario: [
            { 
                codigo: 'BIE031',
                nome: 'Rosca Direta', 
                series: 4, 
                repeticoes: '8-10', 
                carga: '25-35kg', 
                descricao: 'Foco em força e massa, execução estrita',
                gif: '/images/102.gif'
            },
            { 
                codigo: 'BIE032',
                nome: 'Rosca Scott', 
                series: 3, 
                repeticoes: '10-12', 
                carga: '20-25kg', 
                descricao: 'Isolamento do bíceps no banco Scott, amplitude completa',
                gif: '/images/103.gif'
            },
            { 
                codigo: 'BIE033',
                nome: 'Rosca 21', 
                series: 3, 
                repeticoes: '21 (7+7+7)', 
                carga: '15-20kg', 
                descricao: 'Método intenso: 7 meias inferiores + 7 superiores + 7 completas',
                gif: '/images/102.gif'
            }
        ],
        avancado: [
            { 
                codigo: 'BIA034',
                nome: 'Rosca Direta Pegada Fechada', 
                series: 4, 
                repeticoes: '6-8', 
                carga: '30-40kg', 
                descricao: 'Variação para força máxima, pegada mais estreita',
                gif: '/images/102.gif'
            },
            { 
                codigo: 'BIA035',
                nome: 'Rosca Spider', 
                series: 3, 
                repeticoes: '8-10', 
                carga: '15-20kg', 
                descricao: 'Isolamento total do bíceps, banco inclinado inverso',
                gif: '/images/103.gif'
            },
            { 
                codigo: 'BIA036',
                nome: 'Rosca Drag Curl', 
                series: 3, 
                repeticoes: '10-12', 
                carga: '20-25kg', 
                descricao: 'Técnica avançada, barra "arrasta" no corpo',
                gif: '/images/102.gif'
            }
        ]
    },
    triceps: {
        iniciante: [
            { 
                codigo: 'TRI037',
                nome: 'Tríceps Testa', 
                series: 3, 
                repeticoes: '10-12', 
                carga: '15-20kg', 
                descricao: 'Flexionar apenas antebraços, cotovelos fixos, barra W',
                gif: '/images/121.gif'
            },
            { 
                codigo: 'TRI038',
                nome: 'Tríceps Pulley', 
                series: 3, 
                repeticoes: '12-15', 
                carga: '20-25kg', 
                descricao: 'Movimento de extensão no cabo, pegada pronada',
                gif: '/images/118.gif'
            },
            { 
                codigo: 'TRI039',
                nome: 'Mergulho no Banco', 
                series: 3, 
                repeticoes: '8-12', 
                carga: 'Peso corporal', 
                descricao: 'Exercício funcional, mãos no banco, pés no chão',
                gif: '/images/161.gif'
            }
        ],
        intermediario: [
            { 
                codigo: 'TRE040',
                nome: 'Tríceps Francês', 
                series: 4, 
                repeticoes: '8-10', 
                carga: '20-30kg', 
                descricao: 'Exercício clássico para tríceps, halter atrás da cabeça',
                gif: '/images/119.gif'
            },
            { 
                codigo: 'TRE041',
                nome: 'Tríceps Corda', 
                series: 3, 
                repeticoes: '10-12', 
                carga: '25-35kg', 
                descricao: 'Maior amplitude de movimento, abertura na contração',
                gif: '/images/120.gif'
            },
            { 
                codigo: 'TRE042',
                nome: 'Supino Fechado', 
                series: 3, 
                repeticoes: '8-10', 
                carga: '30-40kg', 
                descricao: 'Exercício composto, pegada fechada, cotovelos próximos',
                gif: '/images/161.gif'
            }
        ],
        avancado: [
            { 
                codigo: 'TRA043',
                nome: 'Tríceps Francês com Halter', 
                series: 4, 
                repeticoes: '6-8', 
                carga: '18-25kg', 
                descricao: 'Variação unilateral, maior instabilidade e ativação',
                gif: '/images/119.gif'
            },
            { 
                codigo: 'TRA044',
                nome: 'Mergulho em Paralelas', 
                series: 4, 
                repeticoes: '8-12', 
                carga: 'Peso corporal + 10-15kg', 
                descricao: 'Exercício funcional avançado, foco no tríceps',
                gif: '/images/161.gif'
            },
            { 
                codigo: 'TRA045',
                nome: 'JM Press', 
                series: 3, 
                repeticoes: '8-10', 
                carga: '25-35kg', 
                descricao: 'Técnica específica para força, meio termo supino/testa',
                gif: '/images/161.gif'
            }
        ]
    },
    quadriceps: {
        iniciante: [
            { 
                codigo: 'QUI046',
                nome: 'Agachamento Livre', 
                series: 3, 
                repeticoes: '12-15', 
                carga: '20-30kg', 
                descricao: 'Exercício fundamental para pernas, técnica perfeita essencial',
                gif: '/images/9.gif'
            },
            { 
                codigo: 'QUI047',
                nome: 'Leg Press', 
                series: 3, 
                repeticoes: '12-15', 
                carga: '80-100kg', 
                descricao: 'Exercício seguro para iniciantes, amplitude controlada',
                gif: '/images/72.gif'
            },
            { 
                codigo: 'QUI048',
                nome: 'Extensão de Pernas', 
                series: 3, 
                repeticoes: '15-20', 
                carga: '20-30kg', 
                descricao: 'Isolamento do quadríceps, sem sobrecarga na lombar',
                gif: '/images/54.gif'
            }
        ],
        intermediario: [
            { 
                codigo: 'QUE049',
                nome: 'Agachamento Livre', 
                series: 4, 
                repeticoes: '8-12', 
                carga: '40-60kg', 
                descricao: 'Aumento de carga e intensidade, profundidade adequada',
                gif: '/images/9.gif'
            },
            { 
                codigo: 'QUE050',
                nome: 'Leg Press 45°', 
                series: 4, 
                repeticoes: '10-12', 
                carga: '120-160kg', 
                descricao: 'Variação angular, pés na posição média',
                gif: '/images/72.gif'
            },
            { 
                codigo: 'QUE051',
                nome: 'Afundo', 
                series: 3, 
                repeticoes: '12 cada perna', 
                carga: '8-12kg cada', 
                descricao: 'Exercício unilateral, trabalha equilíbrio',
                gif: '/images/6.gif'
            }
        ],
        avancado: [
            { 
                codigo: 'QUA052',
                nome: 'Agachamento Livre', 
                series: 4, 
                repeticoes: '6-8', 
                carga: '70-100kg', 
                descricao: 'Foco em força máxima, técnica impecável obrigatória',
                gif: '/images/9.gif'
            },
            { 
                codigo: 'QUA053',
                nome: 'Agachamento Frontal', 
                series: 4, 
                repeticoes: '8-10', 
                carga: '40-60kg', 
                descricao: 'Variação técnica avançada, barra na frente, core ativo',
                gif: '/images/10.gif'
            },
            { 
                codigo: 'QUA054',
                nome: 'Agachamento Búlgaro', 
                series: 3, 
                repeticoes: '10-12 cada', 
                carga: '12-16kg cada', 
                descricao: 'Exercício unilateral desafiador, pé traseiro elevado',
                gif: '/images/8.gif'
            }
        ]
    },
    posterior: {
        iniciante: [
            { 
                codigo: 'POI055',
                nome: 'Stiff', 
                series: 3, 
                repeticoes: '10-12', 
                carga: '20-30kg', 
                descricao: 'Exercício para posterior de coxa, joelhos levemente flexionados',
                gif: '/images/115.gif'
            },
            { 
                codigo: 'POI056',
                nome: 'Flexão de Pernas', 
                series: 3, 
                repeticoes: '12-15', 
                carga: '20-30kg', 
                descricao: 'Isolamento dos isquiotibiais, contração no topo',
                gif: '/images/57.gif'
            },
            { 
                codigo: 'POI057',
                nome: 'Elevação Pélvica', 
                series: 3, 
                repeticoes: '15-20', 
                carga: 'Peso corporal', 
                descricao: 'Trabalha glúteos, contração de 2 segundos no topo',
                gif: '/images/_elevacao_pelvica.gif'
            }
        ],
        intermediario: [
            { 
                codigo: 'POE058',
                nome: 'Stiff com Barra', 
                series: 4, 
                repeticoes: '8-10', 
                carga: '35-50kg', 
                descricao: 'Versão mais intensa, manter lombar neutra',
                gif: '/images/115.gif'
            },
            { 
                codigo: 'POE059',
                nome: 'Mesa Flexora', 
                series: 3, 
                repeticoes: '10-12', 
                carga: '30-40kg', 
                descricao: 'Isolamento na máquina, evitar compensações',
                gif: '/images/57.gif'
            },
            { 
                codigo: 'POE060',
                nome: 'Good Morning', 
                series: 3, 
                repeticoes: '10-12', 
                carga: '20-30kg', 
                descricao: 'Exercício técnico, flexão apenas do quadril',
                gif: '/images/71.gif'
            }
        ],
        avancado: [
            { 
                codigo: 'POA061',
                nome: 'Levantamento Terra', 
                series: 4, 
                repeticoes: '6-8', 
                carga: '80-120kg', 
                descricao: 'Exercício completo de força, técnica perfeita essencial',
                gif: '/images/_terra.gif'
            },
            { 
                codigo: 'POA062',
                nome: 'Stiff Unilateral', 
                series: 3, 
                repeticoes: '10-12 cada', 
                carga: '15-20kg cada', 
                descricao: 'Versão unilateral, desafia equilíbrio e estabilidade',
                gif: '/images/115.gif'
            },
            { 
                codigo: 'POA063',
                nome: 'Hip Thrust', 
                series: 3, 
                repeticoes: '10-12', 
                carga: '40-60kg', 
                descricao: 'Foco nos glúteos, amplitude completa de movimento',
                gif: '/images/_hip_thrust.gif'
            }
        ]
    },
    panturrilha: {
        iniciante: [
            { 
                codigo: 'PAI064',
                nome: 'Panturrilha Sentado', 
                series: 3, 
                repeticoes: '15-20', 
                carga: '20-30kg', 
                descricao: 'Trabalha sóleo, amplitude completa de movimento',
                gif: '/images/81.gif'
            },
            { 
                codigo: 'PAI065',
                nome: 'Panturrilha em Pé', 
                series: 3, 
                repeticoes: '15-20', 
                carga: '40-60kg', 
                descricao: 'Trabalha gastrocnêmio, contração no topo',
                gif: '/images/80.gif'
            }
        ],
        intermediario: [
            { 
                codigo: 'PAE066',
                nome: 'Panturrilha Sentado', 
                series: 4, 
                repeticoes: '12-15', 
                carga: '35-45kg', 
                descricao: 'Maior intensidade, pausa de 1 segundo no topo',
                gif: '/images/81.gif'
            },
            { 
                codigo: 'PAE067',
                nome: 'Panturrilha Leg Press', 
                series: 3, 
                repeticoes: '15-20', 
                carga: '80-120kg', 
                descricao: 'Variação no leg press, apenas dedos na plataforma',
                gif: '/images/72.gif'
            }
        ],
        avancado: [
            { 
                codigo: 'PAA068',
                nome: 'Panturrilha Unilateral', 
                series: 3, 
                repeticoes: '12-15 cada', 
                carga: '20-30kg cada', 
                descricao: 'Trabalho unilateral, maior ativação neural',
                gif: '/images/80.gif'
            },
            { 
                codigo: 'PAA069',
                nome: 'Panturrilha com Pausa', 
                series: 4, 
                repeticoes: '10-12', 
                carga: '50-70kg', 
                descricao: 'Técnica de pausa, 3 segundos na contração máxima',
                gif: '/images/80.gif'
            }
        ]
    }
}