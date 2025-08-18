/**
 * Arquivo principal de inicialização da aplicação JS Fit App Personal
 * @module Main
 */

// Importações corrigidas - caminhos relativos corretos
import { App } from './core/App.js';
import messageManager from './ui/MessageManager.js';

/**
 * Variável global para a aplicação
 */
let app = null;

/**
 * Inicialização da aplicação
 */
async function initializeApp() {
    try {
        // Mostrar loading inicial
        showLoadingMessage('Inicializando aplicação...');
        
        // Verificar compatibilidade do browser
        if (!checkBrowserCompatibility()) {
            throw new Error('Browser não suportado. Use Chrome, Firefox ou Safari atualizado.');
        }

        // Inicializar aplicação principal
        app = new App();
        await app.init();

        // Expor app globalmente para acesso via HTML
        window.app = app;
        window.jsfit = app; // Para debug

        // Configurar handlers globais
        setupGlobalErrorHandlers();
        setupKeyboardShortcuts(app);
        
        // Remover loading
        hideLoadingMessage();
        
        console.log('✅ JS Fit App Personal inicializado com sucesso');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        showErrorMessage(`Erro ao inicializar aplicação: ${error.message}`);
    }
}

/**
 * Verifica compatibilidade do browser
 */
function checkBrowserCompatibility() {
    const requirements = [
        'localStorage' in window,
        'fetch' in window,
        'Promise' in window,
        'JSON' in window,
        'querySelector' in document
    ];
    
    return requirements.every(req => req);
}

/**
 * Configura handlers globais de erro
 */
function setupGlobalErrorHandlers() {
    // Erros JavaScript não capturados
    window.addEventListener('error', (event) => {
        console.error('Erro global:', event.error);
        showErrorMessage('Erro inesperado na aplicação');
    });

    // Promises rejeitadas não capturadas
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Promise rejeitada:', event.reason);
        showErrorMessage('Erro de conexão ou processamento');
        event.preventDefault();
    });
}

/**
 * Configura atalhos de teclado globais
 */
function setupKeyboardShortcuts(app) {
    document.addEventListener('keydown', (event) => {
        // Não processar se estiver digitando em input
        if (event.target.matches('input, textarea, select')) {
            return;
        }

        const { ctrlKey, key } = event;

        // Atalhos principais
        if (ctrlKey) {
            switch (key.toLowerCase()) {
                case 's':
                    event.preventDefault();
                    app.handleSave?.();
                    break;
                case 'n':
                    event.preventDefault();
                    app.showPlanCreator?.();
                    break;
                case 'i':
                    event.preventDefault();
                    app.showAIPlanCreator?.();
                    break;
                case 'l':
                    event.preventDefault();
                    app.showPlanList?.();
                    break;
            }
        }

        // Escape - Fechar modais
        if (key === 'Escape') {
            app.closeAllModals?.();
        }
    });
}

/**
 * Mostra mensagem de loading simples
 */
function showLoadingMessage(message) {
    const loading = document.createElement('div');
    loading.id = 'loading-overlay';
    loading.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            color: white;
            font-family: Arial, sans-serif;
        ">
            <div style="text-align: center;">
                <div style="font-size: 20px; margin-bottom: 20px;">🏋️ JS Fit App</div>
                <div style="animation: spin 1s linear infinite; font-size: 30px; margin-bottom: 20px;">⭯</div>
                <div>${message}</div>
            </div>
        </div>
        <style>
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.appendChild(loading);
}

/**
 * Remove mensagem de loading
 */
function hideLoadingMessage() {
    const loading = document.getElementById('loading-overlay');
    if (loading) {
        loading.remove();
    }
}

/**
 * Mostra mensagem de erro simples
 */
function showErrorMessage(message) {
    hideLoadingMessage();
    
    const error = document.createElement('div');
    error.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4757;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10001;
            font-family: Arial, sans-serif;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        ">
            <div style="font-weight: bold; margin-bottom: 5px;">❌ Erro</div>
            <div>${message}</div>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                margin-top: 10px;
                cursor: pointer;
            ">Fechar</button>
        </div>
    `;
    document.body.appendChild(error);
    
    // Auto remove após 10 segundos
    setTimeout(() => {
        if (error.parentElement) {
            error.remove();
        }
    }, 10000);
}

/**
 * Fallback functions para quando a aplicação não carrega
 */
function createFallbackApp() {
    return {
        showPlanCreator: () => showErrorMessage('Aplicação ainda não foi carregada completamente'),
        showPlanList: () => showErrorMessage('Aplicação ainda não foi carregada completamente'),
        showAIPlanCreator: () => showErrorMessage('Aplicação ainda não foi carregada completamente'),
        importPlan: () => showErrorMessage('Aplicação ainda não foi carregada completamente'),
        savePlan: () => showErrorMessage('Aplicação ainda não foi carregada completamente'),
        generateAIPlan: () => showErrorMessage('Aplicação ainda não foi carregada completamente')
    };
}

/**
 * Expor app temporário para evitar erros no HTML
 */
window.app = createFallbackApp();

/**
 * Inicialização baseada no estado do DOM
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Fallback para garantir inicialização
window.addEventListener('load', () => {
    if (!window.jsfit) {
        console.warn('⚠️ Executando inicialização de fallback');
        initializeApp();
    }
});

/**
 * Cleanup na saída da página
 */
window.addEventListener('beforeunload', (event) => {
    if (window.jsfit?.hasUnsavedChanges?.()) {
        event.preventDefault();
        event.returnValue = 'Você tem alterações não salvas. Deseja sair mesmo assim?';
        return event.returnValue;
    }
});

// Exportar função de inicialização
export { initializeApp };