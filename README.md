# JS Fit App - Sistema de Compartilhamento de Treinos

Sistema completo para personal trainers criarem e compartilharem planos de treino com seus alunos através de IDs únicos.

## 🎯 Funcionalidades

### Para Personal Trainers (`personal.html`)
- ✅ Criar e editar planos de treino completos
- ✅ Adicionar treinos com exercícios detalhados
- ✅ Gerar ID único de 6 caracteres para compartilhamento
- ✅ Sincronização automática com servidor
- ✅ Backup local dos dados
- ✅ Exportar/importar planos em JSON

### Para Alunos (`aluno.html`)
- ✅ Importar treinos usando ID do personal
- ✅ Acompanhar progresso e execuções
- ✅ Editar cargas dos exercícios
- ✅ Sistema de ciclos e estatísticas
- ✅ Funciona offline após primeira importação
- ✅ PWA instalável no celular

## 🚀 Deployment no Netlify

### 1. Preparar o Projeto

```bash
# Estrutura de arquivos necessária:
projeto/
├── public/
│   ├── index.html
│   ├── aluno.html
│   ├── personal.html
│   ├── manifest.json
│   ├── sw.js
│   └── css/
│       └── stylealuno.css
├── netlify/
│   └── functions/
│       ├── save-workout.js
│       ├── get-workout.js
│       └── health.js
├── netlify.toml
└── package.json
```

### 2. Deploy no Netlify

1. **Via Git (Recomendado)**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/seu-usuario/jsfitapp.git
   git push -u origin main
   ```

2. **Conectar ao Netlify**:
   - Acesse [netlify.com](https://netlify.com)
   - Clique em "New site from Git"
   - Conecte seu repositório GitHub
   - Configure:
     - Build command: `echo "Build completed"`
     - Publish directory: `public`

3. **Configurar Domínio**:
   - Em Site settings > Domain management
   - Alterar para: `jsfitapp.netlify.app`

### 3. Testar o Sistema

1. **Verificar APIs**:
   ```bash
   curl https://jsfitapp.netlify.app/api/health
   ```

2. **Testar Personal**:
   - Acesse `https://jsfitapp.netlify.app/personal.html`
   - Crie um plano de teste
   - Gere ID de compartilhamento

3. **Testar Aluno**:
   - Acesse `https://jsfitapp.netlify.app/aluno.html`
   - Use o ID gerado para importar

## 📱 Como Usar

### Personal Trainer

1. **Criar Plano**:
   - Acesse `/personal.html`
   - Clique em "Criar Novo Plano"
   - Preencha dados do plano e perfil do aluno
   - Salve o plano

2. **Adicionar Treinos**:
   - Entre nos detalhes do plano
   - Clique em "Adicionar Treino"
   - Configure nome, ID e foco do treino
   - Adicione exercícios com séries, reps e cargas

3. **Compartilhar**:
   - Clique em "Gerar ID de Compartilhamento"
   - Copie o ID de 6 caracteres
   - Envie para o aluno via WhatsApp/SMS

### Aluno

1. **Importar Treino**:
   - Acesse `/aluno.html`
   - Digite o ID fornecido pelo personal
   - Clique em "Importar por ID"
   - Treino será baixado e salvo

2. **Executar Treino**:
   - Escolha o treino desejado
   - Clique em "Iniciar"
   - Marque exercícios como concluídos
   - Finalize o treino

3. **Acompanhar Progresso**:
   - Visualize estatísticas de execução
   - Edite cargas conforme evolução
   - Acompanhe ciclos completos

## 🔧 Personalização

### Modificar Cores e Layout

Edite `css/stylealuno.css`:
```css
:root {
    --primary-color: #007aff;
    --success-color: #34c759;
    --warning-color: #ff9500;
    --danger-color: #ff3b30;
}
```

### Adicionar Novos Campos

1. **No Personal** (`personal.html`):
   ```javascript
   const newExerciseTemplate = {
       // ... campos existentes
       novocampo: "valor padrão"
   };
   ```

2. **No Aluno** (`aluno.html`):
   ```javascript
   // Adicionar renderização do novo campo
   html += `<div>Novo Campo: ${exercicio.novocamp}</div>`;
   ```

### Configurar Backup Externo

Para integrar com serviços como Google Drive:
```javascript
// Em personal.html
async function backupToCloud(planData) {
    // Implementar integração com API externa
}
```

## 📊 Monitoramento

### Logs do Netlify

Verificar logs das functions:
1. Acesse Netlify Dashboard
2. Functions > Logs
3. Monitore erros e performance

### Analytics

Adicionar Google Analytics:
```html
<!-- Em index.html, aluno.html, personal.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
```

## 🔒 Segurança

### Rate Limiting

As functions incluem limitação básica:
```javascript
// Implementado automaticamente pelo Netlify
// 1000 requests/minuto por IP
```

### Validação de Dados

IDs são validados:
```javascript
// Apenas 6 caracteres alfanuméricos
if (!/^[A-Z0-9]{6}$/.test(shareId)) {
    throw new Error('ID inválido');
}
```

## 🐛 Solução de Problemas

### Erro "Function not found"
```bash
# Verificar se netlify.toml está configurado
# Verificar se functions estão na pasta correta
```

### ID não encontrado
- Verificar se arquivo foi criado em `/public/data/workouts/`
- Confirmar se servidor está online
- Tentar novamente após alguns minutos

### App não instala no iOS
- Verificar se `manifest.json` está correto
- Confirmar HTTPS
- Testar em Safari primeiro

### Performance lenta
- Implementar cache no Service Worker
- Otimizar tamanho dos arquivos JSON
- Usar CDN para assets estáticos

## 🔄 Atualizações

### Versioning

Atualizar versão em:
1. `package.json`
2. `manifest.json`
3. `sw.js` (CACHE_NAME)

### Deploy de Atualizações

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
# Deploy automático no Netlify
```

## 📞 Suporte

- **Documentação**: Este README
- **Issues**: GitHub Issues
- **Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **PWA**: [web.dev/progressive-web-apps](https://web.dev/progressive-web-apps)

## 📄 Licença

MIT License - Livre para uso comercial e pessoal.

---

**Status**: ✅ Pronto para produção
**Última atualização**: Agosto 2025
**Versão**: 1.0.0