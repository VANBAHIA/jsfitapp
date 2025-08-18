/**
 * Classe principal da aplicação JS Fit App Personal
 * @module App
 */

import { APP_CONFIG, UI_CONFIG } from './Config.js';
import { formatDate, debounce } from './Utils.js';
import planManager from '../features/PlanManager.js';
import shareService from '../api/ShareService.js';
import messageManager from '../ui/MessageManager.js';
import modalManager from '../ui/ModalManager.js';
import formManager from '../ui/FormManager.js';
import uiManager from '../ui/UIManager.js';
import aiPlanGenerator from '../features/AIPlanGenerator.js';
import exerciseManager from '../features/ExerciseManager.js';

/**
 * Classe principal da aplicação
 */
export class App {
    constructor() {
        this.currentView = 'planList';
        this.initialized = false;
        this.unsavedChanges = false;
        
        // Bind methods
        this.handleSave = this.handleSave.bind(this);
        this.showPlanCreator = this.showPlanCreator.bind(this);
        this.showAIPlanCreator = this.showAIPlanCreator.bind(this);
        this.showPlanList = this.showPlanList.bind(this);
        this.closeAllModals = this.closeAllModals.bind(this);
    }

    /**
     * Inicializa a aplicação
     */
    async init() {
        try {
            console.log(`Inicializando ${APP_CONFIG.name} v${APP_CONFIG.version}`);
            
            // Inicializar managers
            await this.initializeManagers();
            
            // Configurar UI inicial
            this.setupInitialUI();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Mostrar view inicial
            this.showPlanList();
            
            // Marcar como inicializado
            this.initialized = true;
            document.body.classList.add('app-initialized');
            
            console.log('✅ Aplicação inicializada com sucesso');
            
        } catch (error) {
            console.error('Erro na inicialização da aplicação:', error);
            throw error;
        }
    }

    /**
     * Inicializa todos os managers
     */
    async initializeManagers() {
        await planManager.init();
        await shareService.checkStatus();
        
        // Configurar comunicação entre managers
        this.setupManagerCommunication();
    }

    /**
     * Configura comunicação entre managers
     */
    setupManagerCommunication() {
        // Exemplo: quando um plano é salvo, atualizar UI
        planManager.onPlanSaved = () => {
            this.refreshPlanList();
            this.unsavedChanges = false;
        };

        // Quando compartilhamento é concluído
        shareService.onShareComplete = (shareId) => {
            this.showShareSuccessModal(shareId);
        };
    }

    /**
     * Configura UI inicial
     */
    setupInitialUI() {
        // Configurar datas padrão
        this.setDefaultDates();
        
        // Configurar tabs e navegação
        uiManager.setupNavigation();
        
        // Configurar formulários
        formManager.setupValidation();
        
        // Aplicar tema se salvo
        this.applyStoredTheme();
    }

    /**
     * Configura event listeners principais
     */
    setupEventListeners() {
        // Formulário de criação manual
        const manualForm = document.getElementById('planCreatorForm');
        if (manualForm) {
            manualForm.addEventListener('submit', this.handleManualPlanSubmit.bind(this));
        }

        // Formulário de IA
        const aiForm = document.getElementById('aiPlanForm');
        if (aiForm) {
            aiForm.addEventListener('submit', this.handleAIPlanSubmit.bind(this));
        }

        // Upload de arquivo
        const fileInput = document.getElementById('importFile');
        if (fileInput) {
            fileInput.addEventListener('change', this.handleFileImport.bind(this));
        }

        // Detectar mudanças para salvar automaticamente
        this.setupAutoSave();
        
        // Configurar drag & drop para import
        this.setupDragAndDrop();
    }

    /**
     * Configura salvamento automático
     */
    setupAutoSave() {
        const debouncedSave = debounce(() => {
            if (this.unsavedChanges && planManager.getCurrentPlan()) {
                this.handleSave();
            }
        }, 5000); // 5 segundos

        // Monitor mudanças nos formulários
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.unsavedChanges = true;
                debouncedSave();
            }
        });
    }

    /**
     * Configura drag & drop para importação
     */
    setupDragAndDrop() {
        const dropZone = document.body;

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', (e) => {
            if (!dropZone.contains(e.relatedTarget)) {
                dropZone.classList.remove('drag-over');
            }
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            
            const files = Array.from(e.dataTransfer.files);
            const jsonFiles = files.filter(f => f.type === 'application/json' || f.name.endsWith('.json'));
            
            if (jsonFiles.length > 0) {
                this.handleFileImport({ target: { files: jsonFiles } });
            } else {
                messageManager.warning('Apenas arquivos JSON são suportados');
            }
        });
    }

    /**
     * Define datas padrão nos formulários
     */
    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        const sixMonthsLater = new Date();
        sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
        const endDate = sixMonthsLater.toISOString().split('T')[0];
        
        const startInput = document.getElementById('planStartDate');
        const endInput = document.getElementById('planEndDate');
        
        if (startInput && !startInput.value) startInput.value = today;
        if (endInput && !endInput.value) endInput.value = endDate;
    }

    /**
     * Aplica tema armazenado
     */
    applyStoredTheme() {
        const savedTheme = localStorage.getItem('app-theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
        }
    }

    /**
     * Mostra criador de planos manual
     */
    showPlanCreator(planId = null) {
        this.currentView = 'planCreator';
        
        // Esconder outras views
        uiManager.hideAllViews();
        uiManager.showView('planCreator');
        
        if (planId) {
            // Modo edição
            planManager.setCurrentPlan(planId);
            formManager.loadPlanToForm(planManager.getCurrentPlan());
            messageManager.info('Modo de edição ativado');
        } else {
            // Modo criação
            planManager.clearCurrentPlan();
            formManager.clearForm();
            formManager.setupDefaultWorkouts(1); // 1 dia por padrão
        }
    }

    /**
     * Mostra criador de planos com IA
     */
    showAIPlanCreator() {
        this.currentView = 'aiPlanCreator';
        
        uiManager.hideAllViews();
        uiManager.showView('aiPlanCreator');
        
        // Limpar formulário de IA
        formManager.clearAIForm();
    }

    /**
     * Mostra lista de planos
     */
    showPlanList() {
        this.currentView = 'planList';
        
        uiManager.hideAllViews();
        uiManager.showView('planList');
        
        // Atualizar lista
        this.refreshPlanList();
    }

    /**
     * Atualiza lista de planos
     */
    refreshPlanList() {
        const plans = planManager.getAllPlans();
        const sharedPlans = shareService.getSharedPlansList();
        
        uiManager.renderPlanList(plans, sharedPlans);
    }

    /**
     * Manipula submissão de plano manual
     */
    async handleManualPlanSubmit(event) {
        event.preventDefault();
        
        try {
            const formData = formManager.getFormData();
            const validation = planManager.validatePlanForm(formData);
            
            if (!validation.isValid) {
                messageManager.error(validation.errors.join('<br>'));
                return;
            }

            if (planManager.isEditMode()) {
                // Atualizar plano existente
                planManager.updatePlan(planManager.getCurrentPlan().id, formData);
            } else {
                // Criar novo plano
                planManager.createPlan(formData);
            }

            // Voltar para lista
            setTimeout(() => this.showPlanList(), 1000);
            
        } catch (error) {
            console.error('Erro ao salvar plano:', error);
            messageManager.error(`Erro ao salvar plano: ${error.message}`);
        }
    }

    /**
     * Manipula submissão de plano com IA
     */
    async handleAIPlanSubmit(event) {
        event.preventDefault();
        
        try {
            const aiData = formManager.getAIFormData();
            const plan = await aiPlanGenerator.generatePlan(aiData);
            
            planManager.createPlan(plan);
            
            setTimeout(() => this.showPlanList(), 1500);
            
        } catch (error) {
            console.error('Erro ao gerar plano com IA:', error);
            messageManager.error(`Erro ao gerar plano: ${error.message}`);
        }
    }

    /**
     * Manipula importação de arquivo
     */
    async handleFileImport(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        try {
            for (const file of files) {
                const text = await file.text();
                const data = JSON.parse(text);
                
                const result = planManager.importPlans(data);
                
                if (result.success.length > 0) {
                    this.refreshPlanList();
                }
            }
        } catch (error) {
            console.error('Erro na importação:', error);
            messageManager.error(`Erro ao importar arquivo: ${error.message}`);
        }
        
        // Limpar input
        event.target.value = '';
    }

    /**
     * Manipula salvamento (Ctrl+S)
     */
    handleSave() {
        if (this.currentView === 'planCreator' && planManager.getCurrentPlan()) {
            const form = document.getElementById('planCreatorForm');
            if (form) {
                form.requestSubmit();
            }
        } else if (this.currentView === 'aiPlanCreator') {
            const form = document.getElementById('aiPlanForm');
            if (form) {
                form.requestSubmit();
            }
        }
    }

    /**
     * Fecha todos os modais
     */
    closeAllModals() {
        modalManager.closeAll();
    }

    /**
     * Verifica se há mudanças não salvas
     * @returns {boolean} Há mudanças não salvas
     */
    hasUnsavedChanges() {
        return this.unsavedChanges;
    }

    /**
     * Obtém informações de debug
     * @returns {Object} Informações de debug
     */
    getDebugInfo() {
        return {
            version: APP_CONFIG.version,
            currentView: this.currentView,
            initialized: this.initialized,
            unsavedChanges: this.unsavedChanges,
            totalPlans: planManager.getAllPlans().length,
            currentPlan: planManager.getCurrentPlan()?.id || null,
            sharedPlans: shareService.getSharedPlansList().length,
            storage: JSON.stringify(localStorage).length + ' bytes'
        };
    }

    /**
     * Mostra modal de sucesso de compartilhamento
     */
    showShareSuccessModal(shareId) {
        modalManager.showShareSuccess(shareId, shareService.getSharedPlansFromStorage()[shareId]);
    }

    /**
     * Manipula ações de plano (editar, excluir, compartilhar, etc.)
     */
    async handlePlanAction(action, planId) {
        try {
            switch (action) {
                case 'edit':
                    this.showPlanCreator(planId);
                    break;
                    
                case 'delete':
                    if (confirm('Tem certeza que deseja excluir este plano?')) {
                        planManager.deletePlan(planId);
                        this.refreshPlanList();
                    }
                    break;
                    
                case 'share':
                    const plan = planManager.getPlanById(planId);
                    const shareId = await shareService.sharePlan(plan);
                    this.showShareSuccessModal(shareId);
                    break;
                    
                case 'duplicate':
                    planManager.duplicatePlan(planId);
                    this.refreshPlanList();
                    break;
                    
                case 'export':
                    const exportData = planManager.exportPlan(planId);
                    this.downloadJSON(exportData, `plano_${planId}.json`);
                    break;
                    
                case 'view':
                    modalManager.showPlanDetails(planManager.getPlanById(planId));
                    break;
                    
                default:
                    console.warn('Ação não reconhecida:', action);
            }
        } catch (error) {
            console.error(`Erro na ação ${action}:`, error);
            messageManager.error(`Erro ao executar ação: ${error.message}`);
        }
    }

    /**
     * Download de arquivo JSON
     */
    downloadJSON(data, filename) {
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', filename);
        linkElement.click();
        
        messageManager.success('Arquivo baixado com sucesso! 📥');
    }

    /**
     * Manipula ações de exercício
     */
    handleExerciseAction(action, workoutIndex, exerciseIndex) {
        try {
            const currentPlan = planManager.getCurrentPlan();
            if (!currentPlan) return;

            switch (action) {
                case 'add':
                    exerciseManager.addExercise(currentPlan, workoutIndex);
                    break;
                    
                case 'edit':
                    exerciseManager.editExercise(currentPlan, workoutIndex, exerciseIndex);
                    break;
                    
                case 'delete':
                    if (confirm('Remover este exercício?')) {
                        exerciseManager.removeExercise(currentPlan, workoutIndex, exerciseIndex);
                        this.unsavedChanges = true;
                    }
                    break;
                    
                case 'moveUp':
                    exerciseManager.moveExercise(currentPlan, workoutIndex, exerciseIndex, -1);
                    this.unsavedChanges = true;
                    break;
                    
                case 'moveDown':
                    exerciseManager.moveExercise(currentPlan, workoutIndex, exerciseIndex, 1);
                    this.unsavedChanges = true;
                    break;
            }
        } catch (error) {
            console.error(`Erro na ação de exercício ${action}:`, error);
            messageManager.error(`Erro: ${error.message}`);
        }
    }

    /**
     * Manipula mudança no tipo de plano (número de dias)
     */
    handlePlanTypeChange(days) {
        try {
            formManager.setupDefaultWorkouts(days);
            this.unsavedChanges = true;
            messageManager.info(`Plano configurado para ${days} dias por semana`);
        } catch (error) {
            console.error('Erro ao alterar tipo de plano:', error);
            messageManager.error('Erro ao configurar treinos');
        }
    }

    /**
     * Pesquisa planos
     */
    handleSearch(searchTerm) {
        const criteria = {
            studentName: searchTerm,
            planName: searchTerm
        };
        
        const results = planManager.searchPlans(criteria);
        uiManager.renderSearchResults(results);
    }

    /**
     * Filtra planos por critério
     */
    handleFilter(filterType, filterValue) {
        const criteria = {};
        criteria[filterType] = filterValue;
        
        const results = planManager.searchPlans(criteria);
        uiManager.renderPlanList(results);
    }

    /**
     * Obtém estatísticas da aplicação
     */
    getStatistics() {
        return {
            plans: planManager.getStatistics(),
            shares: shareService.getShareStatistics(),
            storage: {
                used: JSON.stringify(localStorage).length,
                available: 5 * 1024 * 1024 - JSON.stringify(localStorage).length // ~5MB limite
            }
        };
    }

    /**
     * Realiza limpeza de dados antigos
     */
    async performCleanup() {
        const loadingIndicator = messageManager.showLoading('Limpando dados antigos...');
        
        try {
            const plansRemoved = planManager.cleanupPlans({ olderThanDays: 365 });
            const sharesRemoved = shareService.cleanOldShares(90);
            
            loadingIndicator.close();
            
            if (plansRemoved > 0 || sharesRemoved > 0) {
                messageManager.success(`Limpeza concluída: ${plansRemoved + sharesRemoved} itens removidos`);
                this.refreshPlanList();
            } else {
                messageManager.info('Nenhum item antigo encontrado para remoção');
            }
            
        } catch (error) {
            loadingIndicator.close();
            console.error('Erro na limpeza:', error);
            messageManager.error('Erro durante limpeza de dados');
        }
    }

    /**
     * Cria backup completo
     */
    async createBackup() {
        try {
            const backup = planManager.createBackup();
            this.downloadJSON(backup, `backup_jsfit_${new Date().toISOString().split('T')[0]}.json`);
            messageManager.success('Backup criado com sucesso!');
        } catch (error) {
            console.error('Erro ao criar backup:', error);
            messageManager.error('Erro ao criar backup');
        }
    }

    /**
     * Restaura backup
     */
    async restoreBackup(backupFile) {
        try {
            const text = await backupFile.text();
            const backupData = JSON.parse(text);
            
            const success = planManager.restoreFromBackup(backupData);
            
            if (success) {
                this.refreshPlanList();
            }
            
        } catch (error) {
            console.error('Erro ao restaurar backup:', error);
            messageManager.error('Erro ao restaurar backup');
        }
    }

    /**
     * Alterna tema da aplicação
     */
    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('app-theme', newTheme);
        
        messageManager.info(`Tema alterado para ${newTheme === 'dark' ? 'escuro' : 'claro'}`);
    }

    /**
     * Obtém configurações da aplicação
     */
    getSettings() {
        return {
            theme: localStorage.getItem('app-theme') || 'light',
            autoSave: localStorage.getItem('auto-save') !== 'false',
            notifications: localStorage.getItem('notifications') !== 'false'
        };
    }

    /**
     * Atualiza configurações
     */
    updateSettings(settings) {
        Object.entries(settings).forEach(([key, value]) => {
            localStorage.setItem(key, value.toString());
        });
        
        // Aplicar mudanças imediatamente
        if (settings.theme) {
            document.body.setAttribute('data-theme', settings.theme);
        }
        
        messageManager.success('Configurações atualizadas');
    }

    /**
     * Força atualização da aplicação
     */
    forceRefresh() {
        if (this.hasUnsavedChanges()) {
            if (!confirm('Você tem alterações não salvas. Continuar mesmo assim?')) {
                return;
            }
        }
        
        location.reload();
    }

    /**
     * Obtém informações da aplicação
     */
    getAppInfo() {
        return {
            name: APP_CONFIG.name,
            version: APP_CONFIG.version,
            initialized: this.initialized,
            currentView: this.currentView,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Destrutor da aplicação
     */
    destroy() {
        // Remover event listeners
        document.removeEventListener('keydown', this.handleKeydown);
        
        // Limpar referências
        this.currentView = null;
        this.initialized = false;
        
        console.log('Aplicação finalizada');
    }
}