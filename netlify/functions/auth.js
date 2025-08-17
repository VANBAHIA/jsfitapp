// netlify/functions/auth.js
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Pool de conexões reutilizável
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

// Middleware para autenticação JWT
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

// Validação de email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
        const path = event.path.replace('/api/auth/', '');
        const method = event.httpMethod;

        console.log(`[AUTH] ${method} ${path}`);

        switch (path) {
            case 'register':
                if (method === 'POST') return await register(event);
                break;
            
            case 'login':
                if (method === 'POST') return await login(event);
                break;
            
            case 'profile':
                if (method === 'GET') return await getProfile(event);
                if (method === 'PUT') return await updateProfile(event);
                break;
            
            case 'refresh':
                if (method === 'POST') return await refreshToken(event);
                break;
            
            case 'logout':
                if (method === 'POST') return await logout(event);
                break;
            
            default:
                return {
                    statusCode: 404,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Endpoint não encontrado' })
                };
        }

        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Método não permitido' })
        };

    } catch (error) {
        console.error('[AUTH] Erro:', error);
        
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

// Registrar novo personal trainer
async function register(event) {
    const { name, email, password, phone, cref, specialty } = JSON.parse(event.body);

    // Validações
    if (!name || !email || !password) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Nome, email e senha são obrigatórios' })
        };
    }

    if (!isValidEmail(email)) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Email inválido' })
        };
    }

    if (password.length < 6) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Senha deve ter pelo menos 6 caracteres' })
        };
    }

    const client = await pool.connect();
    
    try {
        // Verificar se email já existe
        const existingUser = await client.query(
            'SELECT id FROM personal_trainers WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            return {
                statusCode: 409,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Email já cadastrado' })
            };
        }

        // Hash da senha
        const passwordHash = await bcrypt.hash(password, 12);

        // Inserir novo personal trainer
        const result = await client.query(`
            INSERT INTO personal_trainers (name, email, password_hash, phone, cref, specialty)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, email, phone, cref, specialty, created_at
        `, [name, email.toLowerCase(), passwordHash, phone, cref, specialty]);

        const user = result.rows[0];

        // Gerar JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                type: 'personal_trainer'
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        return {
            statusCode: 201,
            headers: corsHeaders,
            body: JSON.stringify({
                message: 'Personal trainer registrado com sucesso',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    cref: user.cref,
                    specialty: user.specialty,
                    createdAt: user.created_at
                },
                token
            })
        };

    } finally {
        client.release();
    }
}

// Login
async function login(event) {
    const { email, password } = JSON.parse(event.body);

    // Validações
    if (!email || !password) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Email e senha são obrigatórios' })
        };
    }

    const client = await pool.connect();
    
    try {
        // Buscar usuário
        const result = await client.query(`
            SELECT id, name, email, password_hash, phone, cref, specialty, is_active
            FROM personal_trainers 
            WHERE email = $1
        `, [email.toLowerCase()]);

        if (result.rows.length === 0) {
            return {
                statusCode: 401,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Email ou senha incorretos' })
            };
        }

        const user = result.rows[0];

        // Verificar se usuário está ativo
        if (!user.is_active) {
            return {
                statusCode: 401,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Conta desativada' })
            };
        }

        // Verificar senha
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!isValidPassword) {
            return {
                statusCode: 401,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Email ou senha incorretos' })
            };
        }

        // Atualizar último login
        await client.query(
            'UPDATE personal_trainers SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        // Gerar JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                type: 'personal_trainer'
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                message: 'Login realizado com sucesso',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    cref: user.cref,
                    specialty: user.specialty
                },
                token
            })
        };

    } finally {
        client.release();
    }
}

// Obter perfil do usuário
async function getProfile(event) {
    try {
        const decoded = verifyToken(event.headers.authorization);
        
        const client = await pool.connect();
        
        try {
            const result = await client.query(`
                SELECT 
                    id, name, email, phone, cref, specialty, bio, 
                    profile_image_url, created_at, last_login_at,
                    (SELECT COUNT(*) FROM workout_plans WHERE personal_trainer_id = pt.id) as total_plans,
                    (SELECT COUNT(*) FROM shared_plans sp 
                     JOIN workout_plans wp ON sp.workout_plan_id = wp.id 
                     WHERE wp.personal_trainer_id = pt.id AND sp.is_active = true) as active_shares
                FROM personal_trainers pt
                WHERE id = $1 AND is_active = true
            `, [decoded.userId]);

            if (result.rows.length === 0) {
                return {
                    statusCode: 404,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Usuário não encontrado' })
                };
            }

            const user = result.rows[0];

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        cref: user.cref,
                        specialty: user.specialty,
                        bio: user.bio,
                        profileImageUrl: user.profile_image_url,
                        createdAt: user.created_at,
                        lastLoginAt: user.last_login_at,
                        stats: {
                            totalPlans: parseInt(user.total_plans),
                            activeShares: parseInt(user.active_shares)
                        }
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

// Atualizar perfil
async function updateProfile(event) {
    try {
        const decoded = verifyToken(event.headers.authorization);
        const { name, phone, cref, specialty, bio } = JSON.parse(event.body);

        const client = await pool.connect();
        
        try {
            const result = await client.query(`
                UPDATE personal_trainers 
                SET name = $1, phone = $2, cref = $3, specialty = $4, bio = $5, updated_at = CURRENT_TIMESTAMP
                WHERE id = $6 AND is_active = true
                RETURNING id, name, email, phone, cref, specialty, bio
            `, [name, phone, cref, specialty, bio, decoded.userId]);

            if (result.rows.length === 0) {
                return {
                    statusCode: 404,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Usuário não encontrado' })
                };
            }

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    message: 'Perfil atualizado com sucesso',
                    user: result.rows[0]
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

// Refresh token
async function refreshToken(event) {
    try {
        const decoded = verifyToken(event.headers.authorization);

        // Gerar novo token
        const newToken = jwt.sign(
            { 
                userId: decoded.userId, 
                email: decoded.email,
                type: decoded.type
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                message: 'Token renovado com sucesso',
                token: newToken
            })
        };

    } catch (error) {
        return {
            statusCode: 401,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message })
        };
    }
}

// Logout (blacklist token - implementação simples)
async function logout(event) {
    return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
            message: 'Logout realizado com sucesso'
        })
    };
}