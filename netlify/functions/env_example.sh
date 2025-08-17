# ==============================================
# JS FIT APP - VARIÁVEIS DE AMBIENTE
# ==============================================

# ==============================================
# BANCO DE DADOS POSTGRESQL (NEON)
# ==============================================

# URL completa de conexão com o Neon
DATABASE_URL=postgresql://neondb_owner:npg_rsCkP3jbcal7@ep-red-cloud-acw2aqx0-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Componentes individuais (para debugging se necessário)
DB_HOST=ep-red-cloud-acw2aqx0-pooler.sa-east-1.aws.neon.tech
DB_NAME=neondb
DB_USER=neondb_owner
DB_PASSWORD=npg_rsCkP3jbcal7
DB_PORT=5432

# ==============================================
# AUTENTICAÇÃO JWT
# ==============================================

# Chave secreta para assinar tokens JWT
# IMPORTANTE: Mude esta chave em produção para uma sequência aleatória e segura
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production-min-32-chars

# Tempo de expiração do token
JWT_EXPIRES_IN=7d

# ==============================================
# CONFIGURAÇÕES DA APLICAÇÃO
# ==============================================

# Ambiente de execução
NODE_ENV=production

# URL do frontend para CORS
FRONTEND_URL=https://jsfitapp.netlify.app

# URLs alternativas para desenvolvimento
# NODE_ENV=development
# FRONTEND_URL=http://localhost:3000

# ==============================================
# CONFIGURAÇÕES DE SEGURANÇA
# ==============================================

# Limite de tentativas de login por IP (opcional)
RATE_LIMIT_MAX_ATTEMPTS=10
RATE_LIMIT_WINDOW_MS=900000

# Tamanho máximo de upload em MB
MAX_UPLOAD_SIZE=10

# ==============================================
# CONFIGURAÇÕES DE EMAIL (OPCIONAL)
# ==============================================

# Para notificações por email (implementação futura)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# FROM_EMAIL=noreply@jsfitapp.com

# ==============================================
# CONFIGURAÇÕES DE STORAGE (OPCIONAL)
# ==============================================

# Para upload de imagens (implementação futura)
# AWS_ACCESS_KEY_ID=your-aws-access-key
# AWS_SECRET_ACCESS_KEY=your-aws-secret-key
# AWS_REGION=us-east-1
# AWS_S3_BUCKET=jsfitapp-uploads

# ==============================================
# CONFIGURAÇÕES DE ANALYTICS (OPCIONAL)
# ==============================================

# Google Analytics
# GA_TRACKING_ID=UA-XXXXXXXX-X

# Sentry para monitoramento de erros
# SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# ==============================================
# CONFIGURAÇÕES DE CACHE (OPCIONAL)
# ==============================================

# Redis para cache (implementação futura)
# REDIS_URL=redis://localhost:6379

# ==============================================
# CONFIGURAÇÕES DE DESENVOLVIMENTO
# ==============================================

# Debug para desenvolvimento
# DEBUG=js-fit-app:*

# Log level
LOG_LEVEL=info

# ==============================================
# INSTRUÇÕES DE USO
# ==============================================

# 1. Copie este arquivo para .env na raiz do projeto
# 2. Substitua os valores de exemplo pelos valores reais
# 3. NUNCA commite o arquivo .env no Git
# 4. Para o Netlify, configure essas variáveis no painel de administração

# ==============================================
# CONFIGURAÇÃO NO NETLIFY
# ==============================================

# Para configurar no Netlify:
# 1. Acesse seu site no dashboard do Netlify
# 2. Vá em Site settings > Environment variables
# 3. Adicione cada variável uma por uma
# 4. Para a DATABASE_URL, copie a string completa do Neon
# 5. Para o JWT_SECRET, gere uma string aleatória segura

# Comando para gerar JWT_SECRET seguro:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ==============================================
# CHECKLIST DE SEGURANÇA
# ==============================================

# ✅ JWT_SECRET deve ter pelo menos 32 caracteres
# ✅ DATABASE_URL deve ter SSL habilitado (sslmode=require)
# ✅ NODE_ENV deve ser 'production' em produção
# ✅ FRONTEND_URL deve apontar para o domínio correto
# ✅ Todas as senhas devem ser fortes e únicas
# ✅ Não compartilhar credenciais em código ou logs

# ==============================================
# BACKUP DAS CONFIGURAÇÕES
# ==============================================

# Guarde um backup seguro destas configurações
# Documente onde cada serviço está hospedado
# Mantenha credenciais de acesso de emergência

# Neon Database: https://console.neon.tech/
# Netlify: https://app.netlify.com/
# Domain: (configure conforme seu provedor)

# ==============================================
# TROUBLESHOOTING
# ==============================================

# Se houver erro de conexão com o banco:
# 1. Verifique se a DATABASE_URL está correta
# 2. Teste a conexão diretamente: psql "sua-database-url"
# 3. Verifique se o IP está na whitelist do Neon
# 4. Confirme se SSL está habilitado

# Se houver erro de CORS:
# 1. Verifique se FRONTEND_URL está correto
# 2. Confirme se não há trailing slash extra
# 3. Teste com * temporariamente para debug

# Se houver erro de JWT:
# 1. Verifique se JWT_SECRET está definido
# 2. Confirme se o token não expirou
# 3. Teste com um token novo