// netlify/functions/share.js - Sistema de Compartilhamento Corrigido
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

// Pool de conexões CORRIGIDO
const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_rsCkP3jbcal7@ep-red-cloud-acw2aqx0-pooler.sa-east-1.aws.neon.tech/academiajsfit?sslmode=require&channel_binding=require',
    ssl: {
        rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// Headers CORS
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
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

// Função para verificar JWT (opcional para algumas operações)
function verifyToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
}

// Resposta de erro padronizada
function errorResponse(statusCode, message, details = null) {
    const response = {
        success: false,
        error: message,
        timestamp: new Date().toISOString()
    };
    
    if (details && process.env.NODE_ENV === 'development') {
        response.details = details;
    }
    
    return {
        statusCode,
        headers: corsHeaders,
        body: JSON.stringify(response)
    };
}

// Resposta de sucesso padronizada
function successResponse(statusCode, message, data = null) {
    const response = {
        success: true,
        message,
        timestamp: new Date().toISOString()
    };
    
    if (data) {
        response.data = data;
    }
    
    return {
        statusCode,
        headers: corsHeaders,
        body: JSON.stringify(response)
    };
}

// Handler principal
exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    try {
        const path = event.path.replace('/.netlify/functions/share', '').replace('/api/share', '');
        const method = event.httpMethod;
        const pathParts = path.split('/').filter(p => p.length > 0);

        console.log(`[SHARE] ${method} ${path}`);

        // Roteamento
        if (method === 'POST' && pathParts.length === 0) {
            return await createShare(event);
        }
        
        if (method === 'GET' && pathParts.length === 1) {
            return await getSharedPlan(pathParts[0]);
        }

        if (method === 'PUT' && pathParts.length === 1) {
            return await updateShare(event, pathParts[0]);
        }

        if (method === 'DELETE' && pathParts.length === 1) {
            return await deleteShare(event, pathParts[0]);
        }

        return errorResponse(404, 'Endpoint não encontrado');

    } catch (error) {
        console.error('[SHARE] Erro:', error);
        
        return errorResponse(500, 'Erro interno do servidor', error.message);
    }
};

// Criar compartilhamento (recebe plano completo)
async function createShare(event) {
    try {
        const requestData = JSON.parse(event.body);
        const { shareId, plan, workoutPlanId } = requestData;

        if (!plan) {
            return errorResponse(400, 'Dados do plano são obrigatórios');
        }

        // Gerar shareId se não fornecido
        const finalShareId = shareId || generateShareId();

        // Verificar se o share_id já existe
        const client = await pool.connect();
        
        try {
            // Verificar duplicatas
            let attempts = 0;
            let currentShareId = finalShareId;
            
            while (attempts < 10) {
                const existingShare = await client.query(
                    'SELECT id FROM shared_plans WHERE share_id = $1',
                    [currentShareId]
                );

                if (existingShare.rows.length === 0) {
                    break; // ID disponível
                }

                // Gerar novo ID se já existe
                currentShareId = generateShareId();
                attempts++;
            }

            if (attempts === 10) {
                return errorResponse(500, 'Não foi possível gerar ID único');
            }

            // Definir data de expiração (90 dias)
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 90);

            // Criar novo compartilhamento
            const result = await client.query(`
                INSERT INTO shared_plans (
                    share_id, 
                    workout_plan_id, 
                    plan_data, 
                    is_active, 
                    expires_at,
                    created_at, 
                    updated_at
                )
                VALUES ($1, $2, $3, true, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id, share_id, created_at
            `, [
                currentShareId, 
                workoutPlanId || null, 
                JSON.stringify(plan), 
                expiresAt
            ]);

            const sharedPlan = result.rows[0];

            return successResponse(201, 'Plano compartilhado com sucesso', {
                shareId: sharedPlan.share_id,
                id: sharedPlan.id,
                expiresAt: expiresAt,
                createdAt: sharedPlan.created_at
            });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('[CREATE_SHARE] Erro:', error);
        return errorResponse(500, 'Erro ao compartilhar plano: ' + error.message);
    }
}

// Obter plano compartilhado (usado pelo aluno)
async function getSharedPlan(shareId) {
    if (!shareId || shareId.length !== 6) {
        return errorResponse(400, 'Share ID deve ter 6 caracteres');
    }

    const client = await pool.connect();
    
    try {
        // Buscar plano compartilhado
        const shareResult = await client.query(`
            SELECT 
                plan_data, 
                created_at, 
                access_count,
                expires_at,
                is_active
            FROM shared_plans 
            WHERE share_id = $1
        `, [shareId.toUpperCase()]);

        if (shareResult.rows.length === 0) {
            return errorResponse(404, 'Plano compartilhado não encontrado');
        }

        const share = shareResult.rows[0];

        // Verificar se está ativo
        if (!share.is_active) {
            return errorResponse(410, 'Este plano compartilhado foi desativado');
        }

        // Verificar se expirou
        if (share.expires_at && new Date() > new Date(share.expires_at)) {
            return errorResponse(410, 'Este plano compartilhado expirou');
        }

        // Atualizar contador de acesso
        await client.query(`
            UPDATE shared_plans 
            SET access_count = access_count + 1, 
                last_accessed_at = CURRENT_TIMESTAMP
            WHERE share_id = $1
        `, [shareId.toUpperCase()]);

        const planData = JSON.parse(share.plan_data);

        return successResponse(200, 'Plano encontrado', {
            plan: planData,
            sharedAt: share.created_at,
            accessCount: share.access_count + 1,
            expiresAt: share.expires_at
        });

    } catch (error) {
        console.error('[GET_SHARED_PLAN] Erro:', error);
        return errorResponse(500, 'Erro ao buscar plano compartilhado');
    } finally {
        client.release();
    }
}

// Atualizar compartilhamento
async function updateShare(event, shareId) {
    try {
        const decoded = verifyToken(event.headers.authorization);
        if (!decoded) {
            return errorResponse(401, 'Token de autorização requerido');
        }

        const requestData = JSON.parse(event.body);
        const { plan, isActive } = requestData;

        if (!shareId || shareId.length !== 6) {
            return errorResponse(400, 'Share ID inválido');
        }

        const client = await pool.connect();
        
        try {
            // Verificar se o plano pertence ao usuário autenticado
            const checkResult = await client.query(`
                SELECT sp.id, wp.personal_trainer_id 
                FROM shared_plans sp
                LEFT JOIN workout_plans wp ON sp.workout_plan_id = wp.id
                WHERE sp.share_id = $1
            `, [shareId.toUpperCase()]);

            if (checkResult.rows.length === 0) {
                return errorResponse(404, 'Plano compartilhado não encontrado');
            }

            const shareData = checkResult.rows[0];
            
            // Se há workout_plan_id, verificar se pertence ao usuário
            if (shareData.personal_trainer_id && shareData.personal_trainer_id !== decoded.userId) {
                return errorResponse(403, 'Acesso negado a este plano');
            }

            // Atualizar plano
            const updateFields = [];
            const updateValues = [];
            let paramCount = 0;

            if (plan) {
                paramCount++;
                updateFields.push(`plan_data = $${paramCount}`);
                updateValues.push(JSON.stringify(plan));
            }

            if (typeof isActive === 'boolean') {
                paramCount++;
                updateFields.push(`is_active = $${paramCount}`);
                updateValues.push(isActive);
            }

            if (updateFields.length === 0) {
                return errorResponse(400, 'Nenhum dado para atualizar');
            }

            paramCount++;
            updateValues.push(shareId.toUpperCase());

            await client.query(`
                UPDATE shared_plans 
                SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE share_id = $${paramCount}
            `, updateValues);

            return successResponse(200, 'Plano compartilhado atualizado com sucesso');

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('[UPDATE_SHARE] Erro:', error);
        return errorResponse(500, 'Erro ao atualizar plano compartilhado');
    }
}

// Deletar compartilhamento
async function deleteShare(event, shareId) {
    try {
        const decoded = verifyToken(event.headers.authorization);
        if (!decoded) {
            return errorResponse(401, 'Token de autorização requerido');
        }

        if (!shareId || shareId.length !== 6) {
            return errorResponse(400, 'Share ID inválido');
        }

        const client = await pool.connect();
        
        try {
            // Verificar se o plano pertence ao usuário autenticado
            const checkResult = await client.query(`
                SELECT sp.id, wp.personal_trainer_id 
                FROM shared_plans sp
                LEFT JOIN workout_plans wp ON sp.workout_plan_id = wp.id
                WHERE sp.share_id = $1
            `, [shareId.toUpperCase()]);

            if (checkResult.rows.length === 0) {
                return errorResponse(404, 'Plano compartilhado não encontrado');
            }

            const shareData = checkResult.rows[0];
            
            // Se há workout_plan_id, verificar se pertence ao usuário
            if (shareData.personal_trainer_id && shareData.personal_trainer_id !== decoded.userId) {
                return errorResponse(403, 'Acesso negado a este plano');
            }

            // Deletar compartilhamento
            await client.query('DELETE FROM shared_plans WHERE share_id = $1', [shareId.toUpperCase()]);

            return successResponse(200, 'Plano compartilhado removido com sucesso');

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('[DELETE_SHARE] Erro:', error);
        return errorResponse(500, 'Erro ao remover plano compartilhado');
    }
}

// Inicializar banco de dados (executado automaticamente)
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
            console.log('[SHARE] Criando tabela shared_plans...');
            
            // Criar tabela shared_plans
            await client.query(`
                CREATE TABLE shared_plans (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    share_id VARCHAR(10) UNIQUE NOT NULL,
                    workout_plan_id UUID REFERENCES workout_plans(id) ON DELETE CASCADE,
                    plan_data JSONB NOT NULL,
                    is_active BOOLEAN DEFAULT true,
                    access_count INTEGER DEFAULT 0,
                    last_accessed_at TIMESTAMP WITH TIME ZONE,
                    expires_at TIMESTAMP WITH TIME ZONE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    
                    CONSTRAINT share_id_format CHECK (share_id ~ '^[A-Z0-9]{6}$')
                );
            `);

            // Criar índices
            await client.query(`
                CREATE INDEX idx_shared_plans_share_id ON shared_plans(share_id);
                CREATE INDEX idx_shared_plans_active ON shared_plans(is_active);
                CREATE INDEX idx_shared_plans_expires ON shared_plans(expires_at);
            `);

            // Criar trigger para updated_at
            await client.query(`
                CREATE TRIGGER update_shared_plans_updated_at 
                BEFORE UPDATE ON shared_plans 
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            `);

            console.log('[SHARE] Tabela shared_plans criada com sucesso');
        }

    } catch (error) {
        console.error('[SHARE] Erro ao inicializar banco:', error);
    } finally {
        client.release();
    }
}

// Executar inicialização
initializeDatabase().catch(console.error);