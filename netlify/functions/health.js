// netlify/functions/health.js
const { Pool } = require('pg');

// Pool de conexões com o novo banco
const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_rsCkP3jbcal7@ep-red-cloud-acw2aqx0-pooler.sa-east-1.aws.neon.tech/academiajsfit?sslmode=require&channel_binding=require',
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// Headers CORS
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
};

// Cache para evitar múltiplas consultas simultâneas
let lastHealthCheck = null;
let lastCheckTime = 0;
const CACHE_DURATION = 30000; // 30 segundos

exports.handler = async (event, context) => {
    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    // Apenas aceitar GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Método não permitido' })
        };
    }

    try {
        const now = Date.now();
        
        // Usar cache se disponível e não expirado
        if (lastHealthCheck && (now - lastCheckTime) < CACHE_DURATION) {
            return {
                statusCode: 200,
                headers: {
                    ...corsHeaders,
                    'Cache-Control': 'public, max-age=30',
                    'X-Cache': 'HIT'
                },
                body: JSON.stringify({
                    ...lastHealthCheck,
                    cached: true,
                    cacheAge: Math.floor((now - lastCheckTime) / 1000)
                })
            };
        }

        console.log('[HEALTH] Executando health check...');

        // Testar conexão com banco de dados
        const dbHealth = await checkDatabase();
        
        // Obter estatísticas do sistema
        const stats = await getSystemStats();

        // Construir resposta
        const healthData = {
            status: 'online',
            timestamp: new Date().toISOString(),
            version: '2.1.0',
            environment: 'production',
            uptime: process.uptime(),
            database: dbHealth,
            storage: stats
        };

        // Determinar status geral
        const overallStatus = dbHealth.status === 'healthy' ? 'online' : 'degraded';
        healthData.status = overallStatus;

        // Atualizar cache
        lastHealthCheck = healthData;
        lastCheckTime = now;

        return {
            statusCode: overallStatus === 'online' ? 200 : 503,
            headers: {
                ...corsHeaders,
                'Cache-Control': 'public, max-age=30',
                'X-Cache': 'MISS'
            },
            body: JSON.stringify(healthData)
        };

    } catch (error) {
        console.error('[HEALTH] Erro no health check:', error);

        return {
            statusCode: 503,
            headers: corsHeaders,
            body: JSON.stringify({
                status: 'error',
                timestamp: new Date().toISOString(),
                version: '2.1.0',
                error: error.message,
                uptime: process.uptime()
            })
        };
    }
};

// Verificar saúde do banco de dados
async function checkDatabase() {
    const startTime = Date.now();
    
    try {
        const client = await pool.connect();
        
        try {
            // Teste básico de conectividade
            const result = await client.query('SELECT NOW() as current_time, version() as version');
            const responseTime = Date.now() - startTime;

            // Teste de transação
            await client.query('BEGIN');
            await client.query('SELECT 1');
            await client.query('ROLLBACK');

            return {
                status: 'healthy',
                responseTime: `${responseTime}ms`,
                timestamp: result.rows[0].current_time,
                version: result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1],
                connection: 'active',
                pool: {
                    total: pool.totalCount,
                    idle: pool.idleCount,
                    waiting: pool.waitingCount
                }
            };

        } finally {
            client.release();
        }

    } catch (error) {
        const responseTime = Date.now() - startTime;
        
        return {
            status: 'unhealthy',
            responseTime: `${responseTime}ms`,
            error: error.message,
            connection: 'failed'
        };
    }
}

// Obter estatísticas do sistema
async function getSystemStats() {
    try {
        const client = await pool.connect();
        
        try {
            // Primeiro verificar se as tabelas existem
            const tablesExist = await client.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('workout_plans', 'workouts', 'exercises', 'shared_plans')
            `);

            if (tablesExist.rows.length === 0) {
                return {
                    totalWorkouts: 0,
                    activeShares: 0,
                    totalPlans: 0,
                    note: 'Database tables not yet created'
                };
            }

            // Se as tabelas existem, obter estatísticas
            const statsQuery = `
                SELECT 
                    (SELECT COUNT(*) FROM workout_plans WHERE status = 'active') as active_plans,
                    (SELECT COUNT(*) FROM workout_plans) as total_plans,
                    (SELECT COUNT(*) FROM workouts) as total_workouts,
                    (SELECT COUNT(*) FROM exercises) as total_exercises,
                    (SELECT COUNT(*) FROM shared_plans WHERE is_active = true) as active_shares
            `;

            const result = await client.query(statsQuery);
            const stats = result.rows[0];

            return {
                plans: {
                    total: parseInt(stats.total_plans) || 0,
                    active: parseInt(stats.active_plans) || 0
                },
                workouts: {
                    total: parseInt(stats.total_workouts) || 0
                },
                exercises: {
                    total: parseInt(stats.total_exercises) || 0
                },
                sharing: {
                    activeShares: parseInt(stats.active_shares) || 0
                }
            };

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('[HEALTH] Erro ao obter estatísticas:', error);
        return {
            totalWorkouts: 0,
            activeShares: 0,
            error: 'Could not fetch statistics',
            message: error.message
        };
    }
}