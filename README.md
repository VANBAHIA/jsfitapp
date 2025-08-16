# 🏋️ JS Fit App - Sistema de Treinos

**Versão 2.1.0** - Sistema completo de compartilhamento de treinos entre personal trainers e alunos

[![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)](https://web.dev/progressive-web-apps/)
[![Mobile First](https://img.shields.io/badge/Mobile-First-blue.svg)](https://developers.google.com/web/fundamentals/design-and-ux/responsive/)
[![Offline Ready](https://img.shields.io/badge/Offline-Ready-orange.svg)](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/)

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Características](#características)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação](#instalação)
- [Funcionalidades](#funcionalidades)
- [API](#api)
- [PWA Features](#pwa-features)
- [Performance](#performance)
- [Compatibilidade](#compatibilidade)
- [Contribuição](#contribuição)
- [Licença](#licença)

## 🎯 Visão Geral

O **JS Fit App** é uma Progressive Web Application (PWA) que revoluciona a comunicação entre personal trainers e alunos. O sistema permite que personal trainers criem planos de treino detalhados e os compartilhem facilmente com seus alunos através de IDs únicos.

### 🚀 Principais Benefícios

- **Simplicidade**: Interface intuitiva e fácil de usar
- **Mobilidade**: Funciona perfeitamente em smartphones e tablets
- **Offline**: Continua funcionando mesmo sem internet
- **Compartilhamento**: Sistema de IDs únicos para compartilhamento seguro
- **Sincronização**: Dados sincronizados automaticamente quando online

## ✨ Características

### Para Personal Trainers
- 🤖 **Criação com IA**: Gere planos automaticamente baseados no perfil do aluno
- 📝 **Editor Manual**: Controle total sobre cada exercício e parâmetro
- 🔗 **Compartilhamento**: Gere IDs únicos para seus alunos
- 📊 **Banco de Exercícios**: Mais de 100 exercícios pré-cadastrados
- 💾 **Exportar/Importar**: Backup e migração de dados

### Para Alunos
- 📱 **Interface Mobile**: Otimizada para uso durante o treino
- 🔍 **Importação Fácil**: Digite apenas o ID do seu personal
- ✅ **Acompanhamento**: Marque exercícios como concluídos
- ⚖️ **Edição de Carga**: Ajuste pesos conforme sua evolução
- 📈 **Progresso**: Visualize seus ciclos e execuções completas

## 🛠️ Tecnologias

### Frontend
- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Design responsivo com CSS Grid e Flexbox
- **JavaScript ES6+**: Código moderno e funcional
- **Service Worker**: Cache inteligente e funcionalidade offline

### PWA Features
- **Manifest.json**: Instalação nativa em dispositivos
- **Service Worker**: Cache estratégico e sincronização
- **Responsive Design**: Adaptação perfeita a qualquer tela
- **Touch Optimized**: Gestos e interações touch-friendly

### Backend (Opcional)
- **Netlify Functions**: API serverless para sincronização
- **Local Storage**: Armazenamento local robusto
- **Cache API**: Sistema de cache avançado

## 📁 Estrutura do Projeto

```
js-fit-app/
├── 📄 index.html              # Página inicial
├── 📄 aluno.html             # Interface do aluno
├── 📄 personal.html          # Interface do personal trainer
├── 📱 manifest.json          # Manifest PWA
├── ⚙️ sw.js                  # Service Worker
├── 🎨 css/
│   └── style.css             # Estilos do aluno
├── 🎨 styles.css             # Estilos do personal
├── 📜 aluno.js              # Lógica do aluno
├── 📜 script.js             # Lógica do personal
├── 🌐 api/                  # Funções serverless (opcional)
│   ├── health.js            # Health check
│   └── workouts.js          # CRUD de treinos
└── 📚 docs/                 # Documentação adicional
```

## 🚀 Instalação

### Método 1: Deploy Direto
1. Faça upload dos arquivos para qualquer servidor web
2. Acesse pelo navegador
3. O app estará pronto para uso!

### Método 2: Desenvolvimento Local
```bash
# Clone o repositório
git clone https://github.com/your-username/js-fit-app.git

# Entre no diretório
cd js-fit-app

# Sirva localmente (Python 3)
python -m http.server 8000

# Ou use Node.js
npx serve .

# Acesse http://localhost:8000
```

### Método 3: Netlify (Recomendado)
```bash
# Instale a CLI do Netlify
npm install -g netlify-cli

# Faça login
netlify login

# Deploy
netlify deploy --prod --dir .
```

## 📱 Funcionalidades

### Interface do Personal Trainer

#### 🤖 Criação com IA
```javascript
// Exemplo de dados para criação com IA
const studentData = {
    nome: "João Silva",
    idade: 28,
    peso: "75kg",
    altura: "1.75m",
    objetivo: "Hipertrofia",
    nivel: "intermediario",
    dias: 4
};
```

#### 📝 Editor Manual
- **Tipos de Plano**: A, AB, ABC, ABCD, ABCDE, ABCDEF
- **Exercícios**: Biblioteca com 100+ exercícios categorizados
- **Parâmetros**: Séries, repetições, carga, descanso, observações
- **Técnicas**: Drop-set, bi-set, rest-pause, etc.

#### 🔗 Sistema de Compartilhamento
```javascript
// Geração de ID único
const shareId = generateShareId(); // Ex: "A7B9C2"

// Compartilhamento
await sharePlan(planId);
// Retorna: { id: "A7B9C2", url: "https://app.com/import?id=A7B9C2" }
```

### Interface do Aluno

#### 📥 Importação de Planos
```javascript
// Importar por ID
await importPlanById("A7B9C2");

// Busca automática: Servidor → Cache Local → Erro
```

#### ✅ Execução de Treinos
- **Início de Sessão**: Marca início do treino
- **Controle de Exercícios**: Marcar como concluído
- **Edição de Carga**: Ajustar peso em tempo real
- **Finalização**: Conclusão automática do ciclo

#### 📊 Acompanhamento
- **Ciclos Completos**: Quantos ciclos foram finalizados
- **Progresso Atual**: Exercícios/treinos concluídos no ciclo
- **Histórico**: Total de execuções por treino

## 🔌 API

### Endpoints Disponíveis

#### Health Check
```http
GET /api/health
```
```json
{
    "status": "online",
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "2.1.0",
    "storage": {
        "totalWorkouts": 150,
        "activeShares": 25
    }
}
```

#### Compartilhar Treino
```http
POST /api/share-workout
Content-Type: application/json

{
    "shareId": "A7B9C2",
    "plan": { /* dados do plano */ }
}
```

#### Buscar Treino
```http
GET /api/workouts/{shareId}
```
```json
{
    "plan": {
        "id": 12345,
        "nome": "Plano Hipertrofia",
        "aluno": { /* dados do aluno */ },
        "treinos": [ /* array de treinos */ ]
    },
    "sharedAt": "2024-01-01T00:00:00Z"
}
```

### Tratamento de Erros
```json
{
    "error": "Plan not found",
    "code": 404,
    "message": "The requested workout plan does not exist",
    "timestamp": "2024-01-01T00:00:00Z"
}
```

## 📱 PWA Features

### Service Worker
- **Cache First**: Arquivos estáticos (HTML, CSS, JS)
- **Network First**: APIs e dados dinâmicos
- **Stale While Revalidate**: Recursos secundários
- **Offline Fallback**: Páginas de erro elegantes

### Instalação
```javascript
// Prompt de instalação personalizado
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    deferredPrompt = e;
    showInstallButton();
});

// Instalar app
async function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        deferredPrompt = null;
    }
}
```

### Notificações Push
```javascript
// Registrar para notificações
async function enableNotifications() {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });
    }
}
```

## ⚡ Performance

### Métricas de Performance
- **First Contentful Paint**: < 1.2s
- **Largest Contentful Paint**: < 2.0s
- **Time to Interactive**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

### Otimizações Implementadas
- ✅ Compressão de imagens (SVG inline)
- ✅ Minificação de CSS/JS
- ✅ Cache agressivo de recursos estáticos
- ✅ Lazy loading de componentes
- ✅ Debounce em inputs de busca
- ✅ Virtual scrolling para listas grandes

### Bundle Analysis
```bash
# Tamanhos dos arquivos principais
index.html:     ~8KB (gzipped: ~3KB)
aluno.html:     ~12KB (gzipped: ~4KB)
personal.html:  ~15KB (gzipped: ~5KB)
aluno.js:       ~45KB (gzipped: ~12KB)
script.js:      ~55KB (gzipped: ~15KB)
style.css:      ~35KB (gzipped: ~8KB)
styles.css:     ~40KB (gzipped: ~9KB)
sw.js:          ~25KB (gzipped: ~7KB)

Total Bundle:   ~235KB (gzipped: ~63KB)
```

## 📱 Compatibilidade

### Navegadores Suportados
| Navegador | Versão Mínima | PWA Support | Service Worker |
|-----------|---------------|-------------|----------------|
| Chrome    | 67+           | ✅          | ✅             |
| Firefox   | 67+           | ✅          | ✅             |
| Safari    | 11.1+         | ⚠️          | ✅             |
| Edge      | 79+           | ✅          | ✅             |

### Dispositivos Testados
- 📱 **iOS**: iPhone SE, 12, 13, 14 Pro
- 🤖 **Android**: Samsung Galaxy, Google Pixel, OnePlus
- 💻 **Desktop**: Windows, macOS, Linux
- 🖥️ **Tablets**: iPad, Android tablets

### Features por Plataforma
| Feature | iOS | Android | Desktop |
|---------|-----|---------|---------|
| Instalação PWA | ✅ | ✅ | ✅ |
| Notificações | ⚠️ | ✅ | ✅ |
| Background Sync | ❌ | ✅ | ✅ |
| Share API | ✅ | ✅ | ⚠️ |

## 🔧 Configuração Avançada

### Variáveis de Ambiente
```javascript
// config.js
const CONFIG = {
    API_BASE_URL: process.env.NODE_ENV === 'production' 
        ? 'https://jsfitapp.netlify.app/api'
        : 'http://localhost:8888/api',
    
    CACHE_VERSION: '2.1.0',
    MAX_CACHE_AGE: 7 * 24 * 60 * 60 * 1000, // 7 dias
    SYNC_INTERVAL: 30 * 1000, // 30 segundos
    
    FEATURES: {
        AI_GENERATION: true,
        PUSH_NOTIFICATIONS: true,
        BACKGROUND_SYNC: true,
        SHARE_TARGET: true
    }
};
```

### Customização de Tema
```css
:root {
    /* Cores principais */
    --primary-color: #7945ff;
    --secondary-color: #48bb78;
    --success-color: #30d158;
    --warning-color: #ff9f0a;
    --danger-color: #ff3b30;
    
    /* Personalização por marca */
    --brand-primary: var(--primary-color);
    --brand-logo: url('logo-custom.svg');
    --brand-name: 'Sua Academia';
}
```

## 📊 Analytics e Monitoramento

### Google Analytics 4
```javascript
// Configuração GA4
gtag('config', 'GA_MEASUREMENT_ID', {
    page_title: 'JS Fit App',
    page_location: window.location.href,
    custom_map: {
        'user_type': 'personal_or_student',
        'plan_count': 'total_plans_created'
    }
});

// Eventos customizados
gtag('event', 'plan_created', {
    event_category: 'engagement',
    event_label: 'ai_generated',
    value: 1
});
```

### Sentry Error Tracking
```javascript
import * as Sentry from "@sentry/browser";

Sentry.init({
    dsn: "YOUR_SENTRY_DSN",
    environment: process.env.NODE_ENV,
    beforeSend(event) {
        // Filtrar erros sensíveis
        if (event.exception) {
            const error = event.exception.values[0];
            if (error.value && error.value.includes('localStorage')) {
                return null; // Não enviar erros de localStorage
            }
        }
        return event;
    }
});
```

## 🧪 Testes

### Testes Unitários
```javascript
// test/aluno.test.js
describe('Aluno App', () => {
    test('should import plan by ID', async () => {
        const mockPlan = { id: 'TEST123', nome: 'Test Plan' };
        const result = await importPlanById('TEST123');
        expect(result.plan.nome).toBe('Test Plan');
    });
    
    test('should handle offline gracefully', async () => {
        // Simular offline
        navigator.onLine = false;
        const result = await importPlanById('OFFLINE');
        expect(result.source).toBe('local');
    });
});
```

### Testes E2E com Playwright
```javascript
// e2e/workflow.spec.js
test('complete workout flow', async ({ page }) => {
    await page.goto('/personal.html');
    
    // Criar plano
    await page.click('[data-testid="create-plan"]');
    await page.fill('[data-testid="plan-name"]', 'Test Plan');
    await page.click('[data-testid="save-plan"]');
    
    // Compartilhar
    await page.click('[data-testid="share-plan"]');
    const shareId = await page.textContent('[data-testid="share-id"]');
    
    // Importar como aluno
    await page.goto('/aluno.html');
    await page.fill('[data-testid="import-id"]', shareId);
    await page.click('[data-testid="import-btn"]');
    
    // Verificar importação
    await expect(page.locator('[data-testid="plan-name"]')).toContainText('Test Plan');
});
```

## 🚀 Deploy

### Netlify (Recomendado)
```yaml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### Docker
```dockerfile
# Dockerfile
FROM nginx:alpine

COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Vercel
```json
{
  "version": 2,
  "builds": [
    {
      "src": "**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

## 🤝 Contribuição

### Como Contribuir
1. 🍴 Fork o projeto
2. 🌟 Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. 💻 Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push para a branch (`git push origin feature/AmazingFeature`)
5. 🔄 Abra um Pull Request

### Diretrizes de Código
```javascript
// ✅ Bom
const importPlanById = async (shareId) => {
    try {
        // Validação
        if (!shareId || shareId.length !== 6) {
            throw new Error('Invalid share ID format');
        }
        
        // Lógica principal
        const result = await fetchPlanFromServer(shareId);
        return result;
    } catch (error) {
        console.error('Error importing plan:', error);
        throw error;
    }
};

// ❌ Evitar
function importPlan(id) {
    fetch('/api/plans/' + id).then(res => {
        if (res.ok) {
            return res.json();
        }
    }).then(data => {
        // sem tratamento de erro adequado
        localStorage.setItem('plan', JSON.stringify(data));
    });
}
```

### Padrões de Commit
```bash
# Types: feat, fix, docs, style, refactor, test, chore
feat(aluno): add exercise weight editing feature
fix(personal): resolve plan sharing modal issue
docs(readme): update installation instructions
style(css): improve responsive design for tablets
refactor(api): optimize plan caching strategy
test(e2e): add complete workout flow test
chore(deps): update service worker cache version
```

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

```
MIT License

Copyright (c) 2024 JS Fit App

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Agradecimentos

- **Comunidade Fitness**: Por inspirar a criação desta ferramenta
- **Desenvolvedores PWA**: Pela tecnologia que torna isso possível
- **Personal Trainers**: Pelo feedback valioso durante o desenvolvimento
- **Beta Testers**: Por testarem e reportarem bugs

---

<div align="center">

**[🌐 Demo Live](https://jsfitapp.netlify.app)** | 
**[📱 Instalar PWA](https://jsfitapp.netlify.app)** | 
**[🐛 Reportar Bug](https://github.com/your-repo/issues)** | 
**[💡 Sugerir Feature](https://github.com/your-repo/issues)**

Feito com ❤️ para a comunidade fitness

</div>

---

## 📈 Roadmap

### v2.2.0 - Q2 2024
- [ ] 🔐 Sistema de autenticação opcional
- [ ] 📊 Dashboard de analytics para personal trainers
- [ ] 🎯 Sistema de metas e objetivos
- [ ] 📷 Upload de fotos de progresso
- [ ] 🔔 Notificações push inteligentes

### v2.3.0 - Q3 2024
- [ ] 💬 Chat entre personal e aluno
- [ ] 📹 Vídeos demonstrativos de exercícios
- [ ] 🏆 Sistema de gamificação
- [ ] 📅 Agendamento de treinos
- [ ] 🌐 Suporte a múltiplos idiomas

### v3.0.0 - Q4 2024
- [ ] 🤖 IA avançada para ajustes automáticos
- [ ] ⌚ Integração com wearables
- [ ] 🏋️ Reconhecimento de exercícios por câmera
- [ ] 📈 Análise biomecânica básica
- [ ] 🌟 Marketplace de planos

---

> "A tecnologia é mais bem-sucedida quando está invisível" - Norman, Don

*JS Fit App - Transformando a forma como personal trainers e alunos interagem através da tecnologia.*