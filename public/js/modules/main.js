/**
 * Arquivo principal de inicialização da aplicação JS Fit App Personal
 * @module Main
 */

import { App } from './modules/core/App.js';
import messageManager from './modules/ui/MessageManager.js';

/**
 * Inicialização da aplicação
 */
async function initializeApp() {
    try {
        // Mostrar loading inicial
        const loadingIndicator = messageManager.showLoading('Inicializando aplicação...');
        
        // Verificar compatibilidade do browser
        if (!checkBrowserCompatibility()) {
            throw new Error('Browser não suportado');
        }

        // Inicializar aplicação principal
        const app = new App();
        await app.init();

        // Configurar handlers globais
        setupGlobalErrorHandlers();
        setupKeyboardShortcuts(app);
        
        // Fechar loading
        loadingIndicator.close();
        
        // Expor app globalmente para debug (apenas em desenvolvimento)
        if (process.env.NODE_ENV === 'development') {
            window.jsfit = app;
        }
        
        console.log('✅ JS Fit App Personal inicializado com sucesso');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        messageManager.error(`Erro ao inicializar aplicação: ${error.message}`);
    }
}

/**
 * Verifica compatibilidade do browser
 * @returns {boolean} Browser é compatível
 */
function checkBrowserCompatibility() {
    const requirements = [
        'localStorage' in window,
        'fetch' in window,
        'Promise' in window,
        'JSON' in window
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
        messageManager.error('Erro inesperado na aplicação');
    });

    // Promises rejeitadas não capturadas
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Promise rejeitada:', event.reason);
        messageManager.error('Erro de conexão ou processamento');
        event.preventDefault(); // Previne log no console
    });

    // Erro de recursos não carregados
    window.addEventListener('error', (event) => {
        if (event.target !== window) {
            console.error('Erro ao carregar recurso:', event.target);
        }
    }, true);
}

/**
 * Configura atalhos de teclado globais
 * @param {App} app - Instância da aplicação
 */
function setupKeyboardShortcuts(app) {
    document.addEventListener('keydown', (event) => {
        // Não processar se estiver digitando em input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        const { ctrlKey, altKey, shiftKey, key } = event;

        // Ctrl + S - Salvar
        if (ctrlKey && key === 's') {
            event.preventDefault();
            app.handleSave();
        }

        // Ctrl + N - Novo plano
        if (ctrlKey && key === 'n') {
            event.preventDefault();
            app.showPlanCreator();
        }

        // Ctrl + I - Criar com IA
        if (ctrlKey && key === 'i') {
            event.preventDefault();
            app.showAIPlanCreator();
        }

        // Ctrl + L - Lista de planos
        if (ctrlKey && key === 'l') {
            event.preventDefault();
            app.showPlanList();
        }

        // Escape - Fechar modais
        if (key === 'Escape') {
            app.closeAllModals();
        }

        // Ctrl + Shift + D - Debug info (apenas desenvolvimento)
        if (ctrlKey && shiftKey && key === 'D' && process.env.NODE_ENV === 'development') {
            event.preventDefault();
            console.log('Debug Info:', app.getDebugInfo());
        }
    });
}

/**
 * Configurações específicas para diferentes ambientes
 */
function setupEnvironmentConfig() {
    if (process.env.NODE_ENV === 'development') {
        // Configurações de desenvolvimento
        console.log('🔧 Modo desenvolvimento ativo');
        
        // Log de performance
        performance.mark('app-start');
        
        window.addEventListener('load', () => {
            performance.mark('app-loaded');
            performance.measure('app-load-time', 'app-start', 'app-loaded');
            
            const measure = performance.getEntriesByName('app-load-time')[0];
            console.log(`⏱️ Tempo de carregamento: ${Math.round(measure.duration)}ms`);
        });
        
    } else if (process.env.NODE_ENV === 'production') {
        // Configurações de produção
        console.log('🚀 Modo produção ativo');
        
        // Remover logs de debug
        console.debug = () => {};
        
        // Service Worker para PWA (se disponível)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(() => console.log('Service Worker registrado'))
                .catch(() => console.log('Service Worker não disponível'));
        }
    }
}

/**
 * Inicialização baseada no estado do DOM
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupEnvironmentConfig();
        initializeApp();
    });
} else {
    setupEnvironmentConfig();
    initializeApp();
}

// Fallback para garantir inicialização
window.addEventListener('load', () => {
    // Verificar se app foi inicializado
    if (!window.jsfit && !document.querySelector('.app-initialized')) {
        console.warn('⚠️ Inicialização de fallback executada');
        initializeApp();
    }
});

/**
 * Cleanup na saída da página
 */
window.addEventListener('beforeunload', (event) => {
    // Salvar dados temporários se necessário
    if (window.jsfit && window.jsfit.hasUnsavedChanges()) {
        event.preventDefault();
        event.returnValue = 'Você tem alterações não salvas. Deseja sair mesmo assim?';
        return event.returnValue;
    }
});

// Exportar função de inicialização para uso manual se necessário
export { initializeApp };