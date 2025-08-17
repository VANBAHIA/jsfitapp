// scripts/setup-database.js
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
require('dotenv').config();

async function setupDatabase() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('🔗 Conectando ao banco de dados...');
        
        // Testar conexão
        const client = await pool.connect();
        console.log('✅ Conexão estabelecida com sucesso!');
        
        // Ler o arquivo SQL do schema
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('📊 Criando schema do banco de dados...');
        
        // Executar o schema em transação
        await client.query('BEGIN');
        
        try {
            // Dividir o SQL em comandos individuais
            const commands = schemaSql
                .split('-- ===')
                .map(cmd => cmd.trim())
                .filter(cmd => cmd.length > 0);
            
            for (let i = 0; i < commands.length; i++) {
                const command = commands[i];
                if (command && !command.startsWith('--')) {
                    console.log(`Executando comando ${i + 1}/${commands.length}...`);
                    await client.query(command);
                }
            }
            
            await client.query('COMMIT');
            console.log('✅ Schema criado com sucesso!');
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
        
        // Verificar se as tabelas foram criadas
        console.log('🔍 Verificando tabelas criadas...');
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        
        console.log('\n📋 Tabelas criadas:');
        tablesResult.rows.forEach(row => {
            console.log(`  ✓ ${row.table_name}`);
        });
        
        // Verificar se as funções foram criadas
        const functionsResult = await pool.query(`
            SELECT routine_name 
            FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_type = 'FUNCTION'
            ORDER BY routine_name
        `);
        
        console.log('\n🔧 Funções criadas:');
        functionsResult.rows.forEach(row => {
            console.log(`  ✓ ${row.routine_name}`);
        });
        
        // Verificar se as views foram criadas
        const viewsResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.views 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        console.log('\n👁️ Views criadas:');
        viewsResult.rows.forEach(row => {
            console.log(`  ✓ ${row.table_name}`);
        });
        
        console.log('\n🎉 Setup do banco de dados concluído com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao configurar banco de dados:', error);
        console.error('\nDetalhes do erro:');
        console.error(`Mensagem: ${error.message}`);
        console.error(`Código: ${error.code}`);
        console.error(`Posição: ${error.position}`);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Função para verificar e criar arquivo de schema se não existir
function ensureSchemaFile() {
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const databaseDir = path.dirname(schemaPath);
    
    // Criar diretório database se não existir
    if (!fs.existsSync(databaseDir)) {
        fs.mkdirSync(databaseDir, { recursive: true });
        console.log('📁 Diretório database criado');
    }
    
    // Verificar se o arquivo de schema existe
    if (!fs.existsSync(schemaPath)) {
        console.error('❌ Arquivo schema.sql não encontrado!');
        console.error(`Esperado em: ${schemaPath}`);
        console.error('Crie o arquivo com o schema SQL primeiro.');
        process.exit(1);
    }
    
    return schemaPath;
}

// Função para verificar variáveis de ambiente
function checkEnvironment() {
    const requiredVars = ['DATABASE_URL'];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
        console.error('❌ Variáveis de ambiente obrigatórias não encontradas:');
        missing.forEach(varName => {
            console.error(`  - ${varName}`);
        });
        console.error('\nCrie um arquivo .env com as variáveis necessárias.');
        process.exit(1);
    }
    
    console.log('✅ Variáveis de ambiente verificadas');
}

// Função principal
async function main() {
    console.log('🚀 Iniciando setup do banco de dados JS Fit App\n');
    
    checkEnvironment();
    ensureSchemaFile();
    
    await setupDatabase();
}

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(error => {
        console.error('💥 Erro fatal:', error);
        process.exit(1);
    });
}

module.exports = { setupDatabase };