// netlify/functions/share.js
const { Pool } = require('pg');

// Pool de conexões
const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_rsCkP3jbcal7@ep-red-cloud-acw2aqx0-pooler.sa-east-1.aws.neon.tech/academiajsfit?sslmode=require&channel_binding=require',
    max: 10,
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

// Função para gerar share ID único
function generateShareId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
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
        const path = event.path.replace('/.netlify/functions/share', '');
        const method = event.httpMethod;
        const pathParts = path.split('/').filter(p => p.length > 0);

        console.log(`[SHARE] ${method} ${path}`);

        // Rotas
        if (method === 'POST' && pathParts.length === 0) {
            return await createShare(event);
        }
        
        if (method === 'GET' && pathParts.length === 1) {
            return await getSharedPlan(pathParts[0]);
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

// Criar compartilhamento (recebe plano completo)
async function createShare(event) {
    try {
        const { shareId, plan } = JSON.parse(event.body);

        if (!shareId || !plan) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'shareId e plan são obrigatórios' })
            };
        }

        const client = await pool.connect();
        
        try {
            // Verificar se o share_id já existe
            const existingShare = await client.query(
                'SELECT id FROM shared_plans WHERE share_id = $1',
                [shareId]
            );

            if (existingShare.rows.length > 0) {
                // Atualizar o plano existente
                await client.query(
                    'UPDATE shared_plans SET plan_data = $1, updated_at = CURRENT_TIMESTAMP WHERE share_id = $2',
                    [JSON.stringify(plan), shareId]
                );
            } else {
                // Criar novo compartilhamento
                await client.query(`
                    INSERT INTO shared_plans (share_id, plan_data, is_active, created_at, updated_at)
                    VALUES ($1, $2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                `, [shareId, JSON.stringify(plan)]);
            }

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: true,
                    message: 'Plano compartilhado com sucesso',
                    shareId
                })
            };

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('[CREATE_SHARE] Erro:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message })
        };
    }
}

// Obter plano compartilhado (usado pelo aluno)
async function getSharedPlan(shareId) {
    if (!shareId || shareId.length !== 6) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Share ID deve ter 6 caracteres' })
        };
    }

    const client = await pool.connect();
    
    try {
        // Primeiro tentar buscar da tabela shared_plans
        const shareResult = await client.query(`
            SELECT plan_data, created_at, access_count
            FROM shared_plans 
            WHERE share_id = $1 AND is_active = true
        `, [shareId.toUpperCase()]);

        if (shareResult.rows.length > 0) {
            const share = shareResult.rows[0];
            
            // Atualizar contador de acesso
            await client.query(`
                UPDATE shared_plans 
                SET access_count = access_count + 1, last_accessed_at = CURRENT_TIMESTAMP
                WHERE share_id = $1
            `, [shareId.toUpperCase()]);

            const planData = JSON.parse(share.plan_data);

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    plan: planData,
                    sharedAt: share.created_at,
                    accessCount: share.access_count + 1
                })
            };
        }

        // Se não encontrou na tabela, retornar erro
        return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ 
                error: 'Plano compartilhado não encontrado',
                shareId: shareId.toUpperCase()
            })
        };

    } finally {
        client.release();
    }
}

// Inicializar tabela se não existir
async function initializeDatabase() {
    const client = await pool.connect();
    
    try {
        // Verificar se a tabela shared_plans existe
        const tableExists = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'shared_plans'
            );
        `);

        if (!tableExists.rows[0].exists) {
            // Criar tabela shared_plans
            await client.query(`
                CREATE TABLE shared_plans (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    share_id VARCHAR(10) UNIQUE NOT NULL,
                    plan_data JSONB NOT NULL,
                    is_active BOOLEAN DEFAULT true,
                    access_count INTEGER DEFAULT 0,
                    last_accessed_at TIMESTAMP WITH TIME ZONE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    
                    CONSTRAINT share_id_format CHECK (share_id ~ '^[A-Z0-9]{6}$')
                );
            `);

            // Criar índice para busca rápida
            await client.query(`
                CREATE INDEX idx_shared_plans_share_id ON shared_plans(share_id);
                CREATE INDEX idx_shared_plans_active ON shared_plans(is_active);
            `);

            console.log('[SHARE] Tabela shared_plans criada');
        }

    } finally {
        client.release();
    }
}

// Executar inicialização na primeira chamada
initializeDatabase().catch(console.error);