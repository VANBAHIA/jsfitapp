// netlify/functions/plans.js
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

// Middleware para autenticação
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
        const path = event.path.replace('/api/plans', '');
        const method = event.httpMethod;
        const pathParts = path.split('/').filter(p => p.length > 0);

        console.log(`[PLANS] ${method} ${path}`);

        // Rotas
        if (method === 'GET' && pathParts.length === 0) {
            return await getPlans(event);
        }
        
        if (method === 'POST' && pathParts.length === 0) {
            return await createPlan(event);
        }
        
        if (method === 'GET' && pathParts.length === 1) {
            return await getPlan(event, pathParts[0]);
        }
        
        if (method === 'PUT' && pathParts.length === 1) {
            return await updatePlan(event, pathParts[0]);
        }
        
        if (method === 'DELETE' && pathParts.length === 1) {
            return await deletePlan(event, pathParts[0]);
        }
        
        if (method === 'POST' && pathParts.length === 2 && pathParts[1] === 'duplicate') {
            return await duplicatePlan(event, pathParts[0]);
        }

        return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Endpoint não encontrado' })
        };

    } catch (error) {
        console.error('[PLANS] Erro:', error);
        
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

// Listar planos do personal trainer
async function getPlans(event) {
    try {
        const decoded = verifyToken(event.headers.authorization);
        const queryParams = event.queryStringParameters || {};
        
        const page = parseInt(queryParams.page) || 1;
        const limit = parseInt(queryParams.limit) || 20;
        const status = queryParams.status;
        const search = queryParams.search;
        const offset = (page - 1) * limit;

        const client = await pool.connect();
        
        try {
            let whereClause = 'WHERE wp.personal_trainer_id = $1';
            let params = [decoded.userId];
            let paramCount = 1;

            // Filtros adicionais
            if (status) {
                paramCount++;
                whereClause += ` AND wp.status = $${paramCount}`;
                params.push(status);
            }

            if (search) {
                paramCount++;
                whereClause += ` AND (wp.name ILIKE $${paramCount} OR s.name ILIKE $${paramCount})`;
                params.push(`%${search}%`);
            }

            // Query principal
            const query = `
                SELECT 
                    wp.id, wp.name, wp.description, wp.objective, wp.frequency_per_week,
                    wp.start_date, wp.end_date, wp.status, wp.difficulty_level,
                    wp.equipment_type, wp.estimated_duration_minutes, wp.ai_generated,
                    wp.completed_cycles, wp.created_at, wp.updated_at,
                    s.id as student_id, s.name as student_name, s.email as student_email,
                    COUNT(w.id) as total_workouts,
                    COUNT(w.id) FILTER (WHERE w.is_completed = true) as completed_workouts,
                    SUM(w.execution_count) as total_executions,
                    (SELECT COUNT(*) FROM shared_plans sp WHERE sp.workout_plan_id = wp.id AND sp.is_active = true) as active_shares
                FROM workout_plans wp
                LEFT JOIN students s ON wp.student_id = s.id
                LEFT JOIN workouts w ON wp.id = w.workout_plan_id
                ${whereClause}
                GROUP BY wp.id, s.id
                ORDER BY wp.updated_at DESC
                LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
            `;

            params.push(limit, offset);

            const result = await client.query(query, params);

            // Contar total para paginação
            const countQuery = `
                SELECT COUNT(DISTINCT wp.id) as total
                FROM workout_plans wp
                LEFT JOIN students s ON wp.student_id = s.id
                ${whereClause}
            `;

            const countResult = await client.query(countQuery, params.slice(0, -2));
            const total = parseInt(countResult.rows[0].total);

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    plans: result.rows.map(row => ({
                        id: row.id,
                        name: row.name,
                        description: row.description,
                        objective: row.objective,
                        frequencyPerWeek: row.frequency_per_week,
                        startDate: row.start_date,
                        endDate: row.end_date,
                        status: row.status,
                        difficultyLevel: row.difficulty_level,
                        equipmentType: row.equipment_type,
                        estimatedDuration: row.estimated_duration_minutes,
                        aiGenerated: row.ai_generated,
                        completedCycles: row.completed_cycles,
                        createdAt: row.created_at,
                        updatedAt: row.updated_at,
                        student: row.student_id ? {
                            id: row.student_id,
                            name: row.student_name,
                            email: row.student_email
                        } : null,
                        stats: {
                            totalWorkouts: parseInt(row.total_workouts) || 0,
                            completedWorkouts: parseInt(row.completed_workouts) || 0,
                            totalExecutions: parseInt(row.total_executions) || 0,
                            activeShares: parseInt(row.active_shares) || 0
                        }
                    })),
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
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

// Obter plano específico com todos os detalhes
async function getPlan(event, planId) {
    try {
        const decoded = verifyToken(event.headers.authorization);

        const client = await pool.connect();
        
        try {
            // Buscar plano
            const planResult = await client.query(`
                SELECT 
                    wp.*, s.name as student_name, s.email as student_email,
                    s.birth_date, s.age, s.height, s.weight, s.cpf
                FROM workout_plans wp
                LEFT JOIN students s ON wp.student_id = s.id
                WHERE wp.id = $1 AND wp.personal_trainer_id = $2
            `, [planId, decoded.userId]);

            if (planResult.rows.length === 0) {
                return {
                    statusCode: 404,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Plano não encontrado' })
                };
            }

            const plan = planResult.rows[0];

            // Buscar treinos
            const workoutsResult = await client.query(`
                SELECT * FROM workouts 
                WHERE workout_plan_id = $1 
                ORDER BY order_index
            `, [planId]);

            // Buscar exercícios para cada treino
            const workouts = [];
            for (const workout of workoutsResult.rows) {
                const exercisesResult = await client.query(`
                    SELECT * FROM exercises 
                    WHERE workout_id = $1 
                    ORDER BY order_index
                `, [workout.id]);

                workouts.push({
                    id: workout.id,
                    name: workout.name,
                    workoutLetter: workout.workout_letter,
                    focusArea: workout.focus_area,
                    description: workout.description,
                    estimatedDuration: workout.estimated_duration_minutes,
                    difficultyLevel: workout.difficulty_level,
                    orderIndex: workout.order_index,
                    isCompleted: workout.is_completed,
                    executionCount: workout.execution_count,
                    notes: workout.notes,
                    exercises: exercisesResult.rows.map(ex => ({
                        id: ex.id,
                        name: ex.name,
                        description: ex.description,
                        muscleGroups: ex.muscle_groups,
                        equipment: ex.equipment,
                        sets: ex.sets,
                        reps: ex.reps,
                        weight: ex.weight,
                        restTime: ex.rest_time,
                        orderIndex: ex.order_index,
                        specialInstructions: ex.special_instructions,
                        videoUrl: ex.video_url,
                        imageUrl: ex.image_url,
                        isCompleted: ex.is_completed,
                        currentWeight: ex.current_weight,
                        rpeScale: ex.rpe_scale
                    }))
                });
            }

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    id: plan.id,
                    name: plan.name,
                    description: plan.description,
                    objective: plan.objective,
                    frequencyPerWeek: plan.frequency_per_week,
                    startDate: plan.start_date,
                    endDate: plan.end_date,
                    status: plan.status,
                    difficultyLevel: plan.difficulty_level,
                    equipmentType: plan.equipment_type,
                    estimatedDuration: plan.estimated_duration_minutes,
                    observations: plan.observations,
                    aiGenerated: plan.ai_generated,
                    completedCycles: plan.completed_cycles,
                    createdAt: plan.created_at,
                    updatedAt: plan.updated_at,
                    student: plan.student_name ? {
                        name: plan.student_name,
                        email: plan.student_email,
                        birthDate: plan.birth_date,
                        age: plan.age,
                        height: plan.height,
                        weight: plan.weight,
                        cpf: plan.cpf
                    } : null,
                    workouts
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

// Criar novo plano
async function createPlan(event) {
    try {
        const decoded = verifyToken(event.headers.authorization);
        const data = JSON.parse(event.body);

        const {
            name, description, objective, frequencyPerWeek, startDate, endDate,
            difficultyLevel, equipmentType, estimatedDuration, observations,
            aiGenerated, student, workouts
        } = data;

        // Validações
        if (!name || !objective || !frequencyPerWeek) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Nome, objetivo e frequência são obrigatórios' })
            };
        }

        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            let studentId = null;

            // Criar ou buscar aluno se fornecido
            if (student && student.name) {
                const studentResult = await client.query(`
                    INSERT INTO students (name, email, birth_date, age, height, weight, cpf)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (cpf) DO UPDATE SET
                        name = EXCLUDED.name,
                        email = EXCLUDED.email,
                        birth_date = EXCLUDED.birth_date,
                        age = EXCLUDED.age,
                        height = EXCLUDED.height,
                        weight = EXCLUDED.weight
                    RETURNING id
                `, [
                    student.name,
                    student.email || null,
                    student.birthDate || null,
                    student.age || null,
                    student.height || null,
                    student.weight || null,
                    student.cpf || null
                ]);

                studentId = studentResult.rows[0].id;
            }

            // Criar plano
            const planResult = await client.query(`
                INSERT INTO workout_plans (
                    personal_trainer_id, student_id, name, description, objective,
                    frequency_per_week, start_date, end_date, difficulty_level,
                    equipment_type, estimated_duration_minutes, observations, ai_generated
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING id
            `, [
                decoded.userId, studentId, name, description, objective,
                frequencyPerWeek, startDate, endDate, difficultyLevel || 'intermediate',
                equipmentType || 'gym', estimatedDuration || 60,
                JSON.stringify(observations || {}), aiGenerated || false
            ]);

            const planId = planResult.rows[0].id;

            // Criar treinos se fornecidos
            if (workouts && Array.isArray(workouts)) {
                for (let i = 0; i < workouts.length; i++) {
                    const workout = workouts[i];
                    
                    const workoutResult = await client.query(`
                        INSERT INTO workouts (
                            workout_plan_id, name, workout_letter, focus_area,
                            description, estimated_duration_minutes, difficulty_level, order_index
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        RETURNING id
                    `, [
                        planId, workout.name, workout.workoutLetter || String.fromCharCode(65 + i),
                        workout.focusArea, workout.description, workout.estimatedDuration || 60,
                        workout.difficultyLevel || 'intermediate', i
                    ]);

                    const workoutId = workoutResult.rows[0].id;

                    // Criar exercícios se fornecidos
                    if (workout.exercises && Array.isArray(workout.exercises)) {
                        for (let j = 0; j < workout.exercises.length; j++) {
                            const exercise = workout.exercises[j];
                            
                            await client.query(`
                                INSERT INTO exercises (
                                    workout_id, name, description, muscle_groups, equipment,
                                    sets, reps, weight, rest_time, order_index, special_instructions
                                )
                                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                            `, [
                                workoutId, exercise.name, exercise.description,
                                exercise.muscleGroups || ['geral'], exercise.equipment,
                                exercise.sets || 3, exercise.reps || '10-12',
                                exercise.weight || 'A definir', exercise.restTime || '90 segundos',
                                j, exercise.specialInstructions
                            ]);
                        }
                    }
                }
            }

            await client.query('COMMIT');

            return {
                statusCode: 201,
                headers: corsHeaders,
                body: JSON.stringify({
                    message: 'Plano criado com sucesso',
                    planId
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

// Atualizar plano
async function updatePlan(event, planId) {
    try {
        const decoded = verifyToken(event.headers.authorization);
        const data = JSON.parse(event.body);

        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            // Verificar se o plano pertence ao personal trainer
            const planCheck = await client.query(
                'SELECT id FROM workout_plans WHERE id = $1 AND personal_trainer_id = $2',
                [planId, decoded.userId]
            );

            if (planCheck.rows.length === 0) {
                return {
                    statusCode: 404,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Plano não encontrado' })
                };
            }

            // Atualizar plano
            const updateFields = [];
            const updateValues = [];
            let paramCount = 0;

            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && key !== 'workouts' && key !== 'student') {
                    paramCount++;
                    updateFields.push(`${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${paramCount}`);
                    updateValues.push(key === 'observations' ? JSON.stringify(value) : value);
                }
            });

            if (updateFields.length > 0) {
                updateValues.push(planId);
                await client.query(`
                    UPDATE workout_plans 
                    SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                    WHERE id = $${paramCount + 1}
                `, updateValues);
            }

            await client.query('COMMIT');

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    message: 'Plano atualizado com sucesso'
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

// Excluir plano
async function deletePlan(event, planId) {
    try {
        const decoded = verifyToken(event.headers.authorization);

        const client = await pool.connect();
        
        try {
            const result = await client.query(
                'DELETE FROM workout_plans WHERE id = $1 AND personal_trainer_id = $2 RETURNING id',
                [planId, decoded.userId]
            );

            if (result.rows.length === 0) {
                return {
                    statusCode: 404,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Plano não encontrado' })
                };
            }

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    message: 'Plano excluído com sucesso'
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

// Duplicar plano
async function duplicatePlan(event, planId) {
    try {
        const decoded = verifyToken(event.headers.authorization);

        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            // Buscar plano original
            const originalPlan = await client.query(
                'SELECT * FROM workout_plans WHERE id = $1 AND personal_trainer_id = $2',
                [planId, decoded.userId]
            );

            if (originalPlan.rows.length === 0) {
                return {
                    statusCode: 404,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Plano não encontrado' })
                };
            }

            const plan = originalPlan.rows[0];

            // Criar cópia do plano
            const newPlanResult = await client.query(`
                INSERT INTO workout_plans (
                    personal_trainer_id, name, description, objective, frequency_per_week,
                    start_date, end_date, difficulty_level, equipment_type,
                    estimated_duration_minutes, observations
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING id
            `, [
                decoded.userId,
                plan.name + ' (Cópia)',
                plan.description,
                plan.objective,
                plan.frequency_per_week,
                null, // Limpar datas
                null,
                plan.difficulty_level,
                plan.equipment_type,
                plan.estimated_duration_minutes,
                plan.observations
            ]);

            const newPlanId = newPlanResult.rows[0].id;

            // Duplicar treinos e exercícios
            const workouts = await client.query(
                'SELECT * FROM workouts WHERE workout_plan_id = $1 ORDER BY order_index',
                [planId]
            );

            for (const workout of workouts.rows) {
                const newWorkoutResult = await client.query(`
                    INSERT INTO workouts (
                        workout_plan_id, name, workout_letter, focus_area, description,
                        estimated_duration_minutes, difficulty_level, order_index
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING id
                `, [
                    newPlanId, workout.name, workout.workout_letter, workout.focus_area,
                    workout.description, workout.estimated_duration_minutes,
                    workout.difficulty_level, workout.order_index
                ]);

                const newWorkoutId = newWorkoutResult.rows[0].id;

                // Duplicar exercícios
                const exercises = await client.query(
                    'SELECT * FROM exercises WHERE workout_id = $1 ORDER BY order_index',
                    [workout.id]
                );

                for (const exercise of exercises.rows) {
                    await client.query(`
                        INSERT INTO exercises (
                            workout_id, name, description, muscle_groups, equipment,
                            sets, reps, weight, rest_time, order_index, special_instructions
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    `, [
                        newWorkoutId, exercise.name, exercise.description,
                        exercise.muscle_groups, exercise.equipment, exercise.sets,
                        exercise.reps, exercise.weight, exercise.rest_time,
                        exercise.order_index, exercise.special_instructions
                    ]);
                }
            }

            await client.query('COMMIT');

            return {
                statusCode: 201,
                headers: corsHeaders,
                body: JSON.stringify({
                    message: 'Plano duplicado com sucesso',
                    planId: newPlanId
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
            statusCode: 401,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message })
        };
    }
}