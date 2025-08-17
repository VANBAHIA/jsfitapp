// netlify/functions/share.js
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

// Pool de conexões
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Headers CORS
const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
};

// Função para gerar share ID único
function generateShareId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Middleware para autenticação (opcional para algumas rotas)
function verifyToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Token de autorização requerido');
    }

    const token = authHeader.substring(7);
    
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Token inválido');
    }
}

// Handler principal
exports.handler = async (event, context) => {
    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    try {
        const path = event.path.replace('/api/share', '');
        const method = event.httpMethod;
        const pathParts = path.split('/').filter(p => p.length > 0);

        console.log(`[SHARE] ${method} ${path}`);

        // Rotas
        if (method === 'POST' && pathParts.length === 0) {
            return await createShare(event);
        }
        
        if (method === 'GET' && pathParts.length === 1) {
            return await getSharedPlan(event, pathParts[0]);
        }
        
        if (method === 'PUT' && pathParts.length === 1) {
            return await updateShare(event, pathParts[0]);
        }
        
        if (method === 'DELETE' && pathParts.length === 1) {
            return await deactivateShare(event, pathParts[0]);
        }
        
        if (method === 'GET' && pathParts.length === 0) {
            return await getMyShares(event);
        }

        return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Endpoint não encontrado' })
        };

    } catch (error) {
        console.error('[SHARE] Erro:', error);
        
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
                error: 'Erro interno do servidor',
                message: error.message 
            })
        };
    }
};

// Criar compartilhamento
async function createShare(event) {
    try {
        const decoded = verifyToken(event.headers.authorization);
        const { planId, expiresInDays } = JSON.parse(event.body);

        if (!planId) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'ID do plano é obrigatório' })
            };
        }

        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            // Verificar se o plano pertence ao personal trainer
            const planCheck = await client.query(
                'SELECT id, name FROM workout_plans WHERE id = $1 AND personal_trainer_id = $2',
                [planId, decoded.userId]
            );

            if (planCheck.rows.length === 0) {
                return {
                    statusCode: 404,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Plano não encontrado' })
                };
            }

            // Gerar share ID único
            let shareId;
            let attempts = 0;
            const maxAttempts = 10;

            do {
                shareId = generateShareId();
                const existingShare = await client.query(
                    'SELECT id FROM shared_plans WHERE share_id = $1',
                    [shareId]
                );
                
                if (existingShare.rows.length === 0) break;
                
                attempts++;
            } while (attempts < maxAttempts);

            if (attempts >= maxAttempts) {
                throw new Error('Não foi possível gerar ID único');
            }

            // Calcular data de expiração
            let expiresAt = null;
            if (expiresInDays && expiresInDays > 0) {
                expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + expiresInDays);
            }

            // Desativar compartilhamentos anteriores do mesmo plano
            await client.query(
                'UPDATE shared_plans SET is_active = false WHERE workout_plan_id = $1',
                [planId]
            );

            // Criar novo compartilhamento
            const shareResult = await client.query(`
                INSERT INTO shared_plans (share_id, workout_plan_id, personal_trainer_id, expires_at)
                VALUES ($1, $2, $3, $4)
                RETURNING id, share_id, created_at
            `, [shareId, planId, decoded.userId, expiresAt]);

            await client.query('COMMIT');

            return {
                statusCode: 201,
                headers: corsHeaders,
                body: JSON.stringify({
                    message: 'Plano compartilhado com sucesso',
                    shareId: shareResult.rows[0].share_id,
                    planName: planCheck.rows[0].name,
                    createdAt: shareResult.rows[0].created_at,
                    expiresAt
                })
            };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        return {
            statusCode: error.message.includes('Token') ? 401 : 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message })
        };
    }
}

// Obter plano compartilhado (usado pelo aluno)
async function getSharedPlan(event, shareId) {
    const client = await pool.connect();
    
    try {
        // Buscar compartilhamento
        const shareResult = await client.query(`
            SELECT sp.*, wp.*, pt.name as trainer_name, pt.email as trainer_email
            FROM shared_plans sp
            JOIN workout_plans wp ON sp.workout_plan_id = wp.id
            JOIN personal_trainers pt ON sp.personal_trainer_id = pt.id
            WHERE sp.share_id = $1 AND sp.is_active = true
        `, [shareId.toUpperCase()]);

        if (shareResult.rows.length === 0) {
            return {
                statusCode: 404,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Plano compartilhado não encontrado ou expirado' })
            };
        }

        const share = shareResult.rows[0];

        // Verificar expiração
        if (share.expires_at && new Date() > new Date(share.expires_at)) {
            // Desativar compartilhamento expirado
            await client.query(
                'UPDATE shared_plans SET is_active = false WHERE id = $1',
                [share.id]
            );

            return {
                statusCode: 410,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Compartilhamento expirado' })
            };
        }

        // Atualizar contador de acesso
        await client.query(`
            UPDATE shared_plans 
            SET access_count = access_count + 1, last_accessed_at = CURRENT_TIMESTAMP
            WHERE id = $1
        `, [share.id]);

        // Buscar treinos
        const workoutsResult = await client.query(`
            SELECT * FROM workouts 
            WHERE workout_plan_id = $1 
            ORDER BY order_index
        `, [share.workout_plan_id]);

        // Buscar exercícios para cada treino
        const workouts = [];
        for (const workout of workoutsResult.rows) {
            const exercisesResult = await client.query(`
                SELECT 
                    id, name, description, muscle_groups, equipment, sets, reps,
                    weight, rest_time, order_index, special_instructions
                FROM exercises 
                WHERE workout_id = $1 
                ORDER BY order_index
            `, [workout.id]);

            workouts.push({
                id: workout.workout_letter,
                nome: workout.name,
                foco: workout.focus_area,
                descricao: workout.description,
                exercicios: exercisesResult.rows.map(ex => ({
                    id: ex.id,
                    nome: ex.name,
                    descricao: ex.description,
                    series: ex.sets,
                    repeticoes: ex.reps,
                    carga: ex.weight,
                    descanso: ex.rest_time,
                    observacoesEspeciais: ex.special_instructions || '',
                    concluido: false,
                    currentCarga: ex.weight
                })),
                concluido: false,
                execucoes: 0
            });
        }

        // Buscar dados do aluno se existir
        let alunoData = null;
        if (share.student_id) {
            const studentResult = await client.query(
                'SELECT * FROM students WHERE id = $1',
                [share.student_id]
            );
            
            if (studentResult.rows.length > 0) {
                const student = studentResult.rows[0];
                alunoData = {
                    nome: student.name,
                    dataNascimento: student.birth_date,
                    idade: student.age,
                    altura: student.height,
                    peso: student.weight,
                    cpf: student.cpf
                };
            }
        }

        // Formato compatível com o frontend atual
        const planData = {
            plan: {
                id: share.workout_plan_id,
                nome: share.name,
                aluno: alunoData || {
                    nome: '',
                    dataNascimento: '',
                    idade: null,
                    altura: '',
                    peso: '',
                    cpf: ''
                },
                dias: share.frequency_per_week,
                dataInicio: share.start_date,
                dataFim: share.end_date,
                perfil: {
                    idade: alunoData?.idade,
                    altura: alunoData?.altura,
                    peso: alunoData?.peso,
                    porte: 'médio',
                    objetivo: share.objective
                },
                treinos: workouts,
                observacoes: share.observations || {},
                execucoesPlanCompleto: 0
            },
            sharedAt: share.created_at,
            sharedBy: share.trainer_name,
            accessCount: share.access_count
        };

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(planData)
        };

    } finally {
        client.release();
    }
}

// Listar compartilhamentos do personal trainer
async function getMyShares(event) {
    try {
        const decoded = verifyToken(event.headers.authorization);

        const client = await pool.connect();
        
        try {
            const result = await client.query(`
                SELECT 
                    sp.id, sp.share_id, sp.is_active, sp.access_count, sp.last_accessed_at,
                    sp.expires_at, sp.created_at,
                    wp.name as plan_name, wp.objective,
                    s.name as student_name
                FROM shared_plans sp
                JOIN workout_plans wp ON sp.workout_plan_id = wp.id
                LEFT JOIN students s ON wp.student_id = s.id
                WHERE sp.personal_trainer_id = $1
                ORDER BY sp.created_at DESC
            `, [decoded.userId]);

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    shares: result.rows.map(row => ({
                        id: row.id,
                        shareId: row.share_id,
                        planName: row.plan_name,
                        objective: row.objective,
                        studentName: row.student_name,
                        isActive: row.is_active,
                        accessCount: row.access_count,
                        lastAccessedAt: row.last_accessed_at,
                        expiresAt: row.expires_at,
                        createdAt: row.created_at,
                        isExpired: row.expires_at ? new Date() > new Date(row.expires_at) : false
                    }))
                })
            };

        } finally {
            client.release();
        }

    } catch (error) {
        return {
            statusCode: 401,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message })
        };
    }
}

// Atualizar compartilhamento (renovar share ID)
async function updateShare(event, shareId) {
    try {
        const decoded = verifyToken(event.headers.authorization);

        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            // Verificar se o compartilhamento pertence ao personal trainer
            const shareCheck = await client.query(`
                SELECT sp.id, sp.workout_plan_id, wp.name as plan_name
                FROM shared_plans sp
                JOIN workout_plans wp ON sp.workout_plan_id = wp.id
                WHERE sp.share_id = $1 AND sp.personal_trainer_id = $2
            `, [shareId, decoded.userId]);

            if (shareCheck.rows.length === 0) {
                return {
                    statusCode: 404,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Compartilhamento não encontrado' })
                };
            }

            // Gerar novo share ID
            let newShareId;
            let attempts = 0;
            const maxAttempts = 10;

            do {
                newShareId = generateShareId();
                const existingShare = await client.query(
                    'SELECT id FROM shared_plans WHERE share_id = $1',
                    [newShareId]
                );
                
                if (existingShare.rows.length === 0) break;
                
                attempts++;
            } while (attempts < maxAttempts);

            if (attempts >= maxAttempts) {
                throw new Error('Não foi possível gerar ID único');
            }

            // Desativar compartilhamento antigo
            await client.query(
                'UPDATE shared_plans SET is_active = false WHERE share_id = $1',
                [shareId]
            );

            // Criar novo compartilhamento
            const newShareResult = await client.query(`
                INSERT INTO shared_plans (share_id, workout_plan_id, personal_trainer_id)
                VALUES ($1, $2, $3)
                RETURNING id, share_id, created_at
            `, [newShareId, shareCheck.rows[0].workout_plan_id, decoded.userId]);

            await client.query('COMMIT');

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    message: 'Compartilhamento renovado com sucesso',
                    oldShareId: shareId,
                    newShareId: newShareResult.rows[0].share_id,
                    planName: shareCheck.rows[0].plan_name,
                    createdAt: newShareResult.rows[0].created_at
                })
            };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        return {
            statusCode: error.message.includes('Token') ? 401 : 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message })
        };
    }
}

// Desativar compartilhamento
async function deactivateShare(event, shareId) {
    try {
        const decoded = verifyToken(event.headers.authorization);

        const client = await pool.connect();
        
        try {
            const result = await client.query(`
                UPDATE shared_plans 
                SET is_active = false 
                WHERE share_id = $1 AND personal_trainer_id = $2
                RETURNING id
            `, [shareId, decoded.userId]);

            if (result.rows.length === 0) {
                return {
                    statusCode: 404,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Compartilhamento não encontrado' })
                };
            }

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    message: 'Compartilhamento desativado com sucesso'
                })
            };

        } finally {
            client.release();
        }

    } catch (error) {
        return {
            statusCode: 401,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message })
        };
    }
}