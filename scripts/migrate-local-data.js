// scripts/migrate-local-data.js
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

require('dotenv').config();

class DataMigrator {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
        this.defaultTrainerId = null;
    }

    async migrate() {
        try {
            console.log('🔄 Iniciando migração de dados...');

            // Criar personal trainer padrão
            await this.createDefaultTrainer();

            // Migrar dados dos arquivos JSON existentes
            await this.migrateFromJsonFiles();

            // Migrar dados simulados do localStorage (exemplo)
            await this.migrateExampleData();

            console.log('✅ Migração concluída com sucesso!');

        } catch (error) {
            console.error('❌ Erro na migração:', error);
            throw error;
        } finally {
            await this.pool.end();
        }
    }

    async createDefaultTrainer() {
        console.log('👨‍🏫 Criando personal trainer padrão...');

        const hashedPassword = await bcrypt.hash('123456', 10);

        const result = await this.pool.query(`
            INSERT INTO personal_trainers (name, email, password_hash, cref, specialty, bio)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (email) DO NOTHING
            RETURNING id
        `, [
            'Personal Trainer Demo',
            'demo@jsfitapp.com',
            hashedPassword,
            'CREF 123456-G/SP',
            'Hipertrofia e Condicionamento',
            'Personal trainer com experiência em treinamento funcional e hipertrofia muscular.'
        ]);

        if (result.rows.length > 0) {
            this.defaultTrainerId = result.rows[0].id;
            console.log(`✅ Trainer criado com ID: ${this.defaultTrainerId}`);
        } else {
            // Se já existe, buscar o ID
            const existingResult = await this.pool.query(
                'SELECT id FROM personal_trainers WHERE email = $1',
                ['demo@jsfitapp.com']
            );
            this.defaultTrainerId = existingResult.rows[0].id;
            console.log(`✅ Trainer existente encontrado: ${this.defaultTrainerId}`);
        }
    }

    async migrateFromJsonFiles() {
        console.log('📁 Procurando arquivos JSON para migração...');

        const dataDir = path.join(__dirname, '..', 'public', 'data', 'workouts');
        
        if (!fs.existsSync(dataDir)) {
            console.log('📂 Diretório de dados não encontrado, pulando migração de arquivos');
            return;
        }

        const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));
        
        if (files.length === 0) {
            console.log('📄 Nenhum arquivo JSON encontrado');
            return;
        }

        for (const file of files) {
            try {
                console.log(`📋 Migrando arquivo: ${file}`);
                
                const filePath = path.join(dataDir, file);
                const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                
                if (jsonData.planos && Array.isArray(jsonData.planos)) {
                    for (const plano of jsonData.planos) {
                        await this.migratePlan(plano);
                    }
                } else if (jsonData.id) {
                    // Arquivo contém um plano único
                    await this.migratePlan(jsonData);
                }
                
            } catch (error) {
                console.error(`❌ Erro ao migrar arquivo ${file}:`, error.message);
            }
        }
    }

    async migratePlan(planData) {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');

            // 1. Criar ou encontrar aluno
            const studentId = await this.createStudent(client, planData.aluno);

            // 2. Criar plano de treino
            const planId = await this.createWorkoutPlan(client, planData, studentId);

            // 3. Criar treinos (A, B, C, etc.)
            if (planData.treinos && Array.isArray(planData.treinos)) {
                for (let i = 0; i < planData.treinos.length; i++) {
                    const treinoData = planData.treinos[i];
                    const workoutId = await this.createWorkout(client, treinoData, planId, i);

                    // 4. Criar exercícios
                    if (treinoData.exercicios && Array.isArray(treinoData.exercicios)) {
                        for (let j = 0; j < treinoData.exercicios.length; j++) {
                            const exercicioData = treinoData.exercicios[j];
                            await this.createExercise(client, exercicioData, workoutId, j);
                        }
                    }
                }
            }

            // 5. Criar compartilhamento se necessário
            if (planData.originalShareId) {
                await this.createSharedPlan(client, planData.originalShareId, planId);
            }

            await client.query('COMMIT');
            console.log(`✅ Plano "${planData.nome}" migrado com sucesso`);

        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`❌ Erro ao migrar plano "${planData.nome}":`, error.message);
            throw error;
        } finally {
            client.release();
        }
    }

    async createStudent(client, alunoData) {
        if (!alunoData || !alunoData.nome) {
            return null;
        }

        const result = await client.query(`
            INSERT INTO students (name, birth_date, age, height, weight, cpf)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (cpf) DO UPDATE SET
                name = EXCLUDED.name,
                birth_date = EXCLUDED.birth_date,
                age = EXCLUDED.age,
                height = EXCLUDED.height,
                weight = EXCLUDED.weight
            RETURNING id
        `, [
            alunoData.nome,
            alunoData.dataNascimento || null,
            alunoData.idade || null,
            alunoData.altura || null,
            alunoData.peso || null,
            alunoData.cpf || null
        ]);

        return result.rows[0].id;
    }

    async createWorkoutPlan(client, planData, studentId) {
        const result = await client.query(`
            INSERT INTO workout_plans (
                personal_trainer_id, student_id, name, description, objective,
                frequency_per_week, start_date, end_date, observations,
                ai_generated, completed_cycles
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id
        `, [
            this.defaultTrainerId,
            studentId,
            planData.nome || 'Plano Migrado',
            planData.descricao || null,
            planData.perfil?.objetivo || 'Condicionamento geral',
            planData.dias || 3,
            planData.dataInicio || null,
            planData.dataFim || null,
            JSON.stringify(planData.observacoes || {}),
            planData.aiGenerated || false,
            planData.execucoesPlanCompleto || 0
        ]);

        return result.rows[0].id;
    }

    async createWorkout(client, treinoData, planId, orderIndex) {
        const result = await client.query(`
            INSERT INTO workouts (
                workout_plan_id, name, workout_letter, focus_area,
                description, order_index, is_completed, execution_count
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
        `, [
            planId,
            treinoData.nome || `Treino ${treinoData.id}`,
            treinoData.id || String.fromCharCode(65 + orderIndex), // A, B, C...
            treinoData.foco || 'Treino geral',
            treinoData.descricao || null,
            orderIndex,
            treinoData.concluido || false,
            treinoData.execucoes || 0
        ]);

        return result.rows[0].id;
    }

    async createExercise(client, exercicioData, workoutId, orderIndex) {
        // Extrair grupos musculares da descrição ou nome
        const muscleGroups = this.extractMuscleGroups(exercicioData.nome, exercicioData.descricao);

        await client.query(`
            INSERT INTO exercises (
                workout_id, name, description, muscle_groups, sets, reps,
                weight, rest_time, order_index, special_instructions,
                is_completed, current_weight
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
            workoutId,
            exercicioData.nome || 'Exercício',
            exercicioData.descricao || null,
            muscleGroups,
            exercicioData.series || 3,
            exercicioData.repeticoes || '10-12',
            exercicioData.carga || 'A definir',
            exercicioData.descanso || '90 segundos',
            orderIndex,
            exercicioData.observacoesEspeciais || null,
            exercicioData.concluido || false,
            exercicioData.currentCarga || exercicioData.carga
        ]);
    }

    async createSharedPlan(client, shareId, planId) {
        await client.query(`
            INSERT INTO shared_plans (share_id, workout_plan_id, personal_trainer_id, is_active)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (share_id) DO NOTHING
        `, [
            shareId,
            planId,
            this.defaultTrainerId,
            true
        ]);
    }

    extractMuscleGroups(nome, descricao) {
        const text = `${nome} ${descricao || ''}`.toLowerCase();
        const groups = [];

        const muscleMap = {
            'peito': ['peito', 'peitoral', 'supino', 'crucifixo'],
            'costas': ['costas', 'dorso', 'puxada', 'remada', 'pullover'],
            'ombros': ['ombro', 'deltoide', 'desenvolvimento', 'elevação'],
            'bíceps': ['bíceps', 'rosca'],
            'tríceps': ['tríceps', 'francês', 'testa', 'pulley'],
            'quadríceps': ['quadríceps', 'agachamento', 'leg press', 'extensão'],
            'posterior': ['posterior', 'flexor', 'stiff', 'mesa flexora'],
            'glúteos': ['glúteo', 'glúteos', 'hip thrust'],
            'panturrilha': ['panturrilha', 'gastrocnêmio'],
            'core': ['abdominal', 'prancha', 'core', 'abdômen']
        };

        for (const [group, keywords] of Object.entries(muscleMap)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                groups.push(group);
            }
        }

        return groups.length > 0 ? groups : ['geral'];
    }

    async migrateExampleData() {
        console.log('📋 Criando dados de exemplo...');

        // Dados de exemplo que simulariam o localStorage
        const examplePlans = [
            {
                nome: "Plano Hipertrofia Iniciante",
                aluno: {
                    nome: "João Silva",
                    idade: 28,
                    altura: "1,75m",
                    peso: "75kg"
                },
                dias: 3,
                dataInicio: "2024-01-01",
                dataFim: "2024-06-01",
                perfil: {
                    objetivo: "Hipertrofia e ganho de massa muscular"
                },
                treinos: [
                    {
                        id: "A",
                        nome: "A - Peito e Tríceps",
                        foco: "Peito e Tríceps",
                        exercicios: [
                            {
                                nome: "Supino Reto",
                                series: 4,
                                repeticoes: "8-10",
                                carga: "60kg",
                                descanso: "120 segundos",
                                descricao: "Exercício fundamental para o peitoral"
                            },
                            {
                                nome: "Supino Inclinado",
                                series: 3,
                                repeticoes: "10-12",
                                carga: "45kg",
                                descanso: "90 segundos",
                                descricao: "Trabalha a parte superior do peitoral"
                            }
                        ]
                    }
                ]
            }
        ];

        for (const plan of examplePlans) {
            try {
                await this.migratePlan(plan);
            } catch (error) {
                console.error('❌ Erro ao criar dados de exemplo:', error.message);
            }
        }
    }

    async getStats() {
        const stats = await this.pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM personal_trainers) as trainers,
                (SELECT COUNT(*) FROM students) as students,
                (SELECT COUNT(*) FROM workout_plans) as plans,
                (SELECT COUNT(*) FROM workouts) as workouts,
                (SELECT COUNT(*) FROM exercises) as exercises,
                (SELECT COUNT(*) FROM shared_plans) as shared_plans
        `);

        return stats.rows[0];
    }
}

async function main() {
    console.log('🚀 Iniciando migração de dados JS Fit App\n');

    const migrator = new DataMigrator();
    
    try {
        await migrator.migrate();
        
        const stats = await migrator.getStats();
        console.log('\n📊 Estatísticas pós-migração:');
        console.log(`  👨‍🏫 Personal Trainers: ${stats.trainers}`);
        console.log(`  👥 Alunos: ${stats.students}`);
        console.log(`  📋 Planos: ${stats.plans}`);
        console.log(`  🏋️ Treinos: ${stats.workouts}`);
        console.log(`  💪 Exercícios: ${stats.exercises}`);
        console.log(`  🔗 Compartilhamentos: ${stats.shared_plans}`);
        
    } catch (error) {
        console.error('💥 Erro na migração:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { DataMigrator };