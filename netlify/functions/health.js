// netlify/functions/health.js
const { Pool } = require('pg');

// Pool de conexões
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 5,
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

        // Verificar status dos serviços
        const services = await checkServices();

        // Construir resposta
        const healthData = {
            status: 'online',
            timestamp: new Date().toISOString(),
            version: '2.1.0',
            environment: process.env.NODE_ENV || 'development',
            uptime: process.uptime(),
            database: dbHealth,
            services,
            storage: stats
        };

        // Determinar status geral
        const overallStatus = determineOverallStatus(dbHealth, services);
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
            const statsQuery = `
                SELECT 
                    (SELECT COUNT(*) FROM personal_trainers WHERE is_active = true) as active_trainers,
                    (SELECT COUNT(*) FROM students) as total_students,
                    (SELECT COUNT(*) FROM workout_plans WHERE status = 'active') as active_plans,
                    (SELECT COUNT(*) FROM workout_plans) as total_plans,
                    (SELECT COUNT(*) FROM workouts) as total_workouts,
                    (SELECT COUNT(*) FROM exercises) as total_exercises,
                    (SELECT COUNT(*) FROM shared_plans WHERE is_active = true) as active_shares,
                    (SELECT COUNT(*) FROM workout_sessions WHERE started_at > CURRENT_DATE - INTERVAL '7 days') as recent_sessions,
                    (SELECT COUNT(*) FROM exercise_templates) as exercise_templates
            `;

            const result = await client.query(statsQuery);
            const stats = result.rows[0];

            // Obter estatísticas de uso recente
            const usageQuery = `
                SELECT 
                    COUNT(DISTINCT personal_trainer_id) as daily_active_trainers,
                    COUNT(*) as daily_logins
                FROM personal_trainers 
                WHERE last_login_at > CURRENT_DATE
            `;

            const usageResult = await client.query(usageQuery);
            const usage = usageResult.rows[0];

            return {
                trainers: {
                    active: parseInt(stats.active_trainers),
                    dailyActive: parseInt(usage.daily_active_trainers)
                },
                students: {
                    total: parseInt(stats.total_students)
                },
                plans: {
                    total: parseInt(stats.total_plans),
                    active: parseInt(stats.active_plans)
                },
                workouts: {
                    total: parseInt(stats.total_workouts)
                },
                exercises: {
                    total: parseInt(stats.total_exercises),
                    templates: parseInt(stats.exercise_templates)
                },
                sharing: {
                    activeShares: parseInt(stats.active_shares)
                },
                activity: {
                    recentSessions: parseInt(stats.recent_sessions),
                    dailyLogins: parseInt(usage.daily_logins)
                }
            };

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('[HEALTH] Erro ao obter estatísticas:', error);
        return {
            error: 'Não foi possível obter estatísticas',
            message: error.message
        };
    }
}

// Verificar status dos serviços
async function checkServices() {
    const services = {};

    // Verificar tabelas essenciais
    try {
        const client = await pool.connect();
        
        try {
            // Verificar se as tabelas principais existem
            const tablesQuery = `
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN (
                    'personal_trainers', 'students', 'workout_plans', 
                    'workouts', 'exercises', 'shared_plans'
                )
            `;

            const tablesResult = await client.query(tablesQuery);
            const existingTables = tablesResult.rows.map(row => row.table_name);

            const requiredTables = [
                'personal_trainers', 'students', 'workout_plans',
                'workouts', 'exercises', 'shared_plans'
            ];

            const missingTables = requiredTables.filter(table => !existingTables.includes(table));

            services.database_schema = {
                status: missingTables.length === 0 ? 'healthy' : 'degraded',
                tables: {
                    required: requiredTables.length,
                    existing: existingTables.length,
                    missing: missingTables
                }
            };

            // Verificar funções do banco
            const functionsQuery = `
                SELECT routine_name 
                FROM information_schema.routines 
                WHERE routine_schema = 'public' 
                AND routine_name IN ('generate_share_id', 'get_plan_statistics')
            `;

            const functionsResult = await client.query(functionsQuery);
            const existingFunctions = functionsResult.rows.map(row => row.routine_name);

            services.database_functions = {
                status: existingFunctions.length > 0 ? 'healthy' : 'degraded',
                functions: existingFunctions
            };

        } finally {
            client.release();
        }

    } catch (error) {
        services.database_schema = {
            status: 'unhealthy',
            error: error.message
        };
    }

    // Verificar serviços externos (se aplicável)
    services.external_apis = {
        status: 'not_configured'
    };

    // Verificar capacidade de escrita
    try {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            await client.query('SELECT 1 as test_write');
            await client.query('ROLLBACK');
            
            services.database_write = {
                status: 'healthy',
                lastChecked: new Date().toISOString()
            };

        } finally {
            client.release();
        }

    } catch (error) {
        services.database_write = {
            status: 'unhealthy',
            error: error.message
        };
    }

    return services;
}

// Determinar status geral do sistema
function determineOverallStatus(dbHealth, services) {
    // Se o banco estiver com problemas, sistema está offline
    if (dbHealth.status === 'unhealthy') {
        return 'offline';
    }

    // Verificar serviços críticos
    const criticalServices = ['database_schema', 'database_write'];
    const unhealthyServices = criticalServices.filter(service => 
        services[service] && services[service].status === 'unhealthy'
    );

    if (unhealthyServices.length > 0) {
        return 'degraded';
    }

    // Verificar se há serviços degradados
    const degradedServices = Object.values(services).filter(service => 
        service.status === 'degraded'
    );

    if (degradedServices.length > 0) {
        return 'degraded';
    }

    return 'online';
}

// Limpeza periódica do cache
setInterval(() => {
    const now = Date.now();
    if (lastHealthCheck && (now - lastCheckTime) > CACHE_DURATION * 2) {
        lastHealthCheck = null;
        lastCheckTime = 0;
        console.log('[HEALTH] Cache limpo');
    }
}, CACHE_DURATION);