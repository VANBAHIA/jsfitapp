/**
 * Serviço de compartilhamento de planos
 * @module ShareService
 */

import { API_CONFIG } from '../core/Config.js';
import { generateId } from '../core/Utils.js';
import apiService from './APIService.js';
import storageService from '../data/StorageService.js';
import messageManager from '../ui/MessageManager.js';

class ShareService {
    constructor() {
        this.sharingState = {
            isSharing: false,
            currentShareId: null,
            lastSharedPlan: null
        };
    }

    /**
     * Compartilha um plano
     * @param {Object} plan - Plano a ser compartilhado
     * @returns {Promise<string>} ID de compartilhamento
     */
    async sharePlan(plan) {
        if (!plan) {
            throw new Error('Plano não fornecido');
        }

        this.sharingState.isSharing = true;
        
        try {
            const shareId = generateId(6);
            const shareData = this.prepareShareData(plan, shareId);
            
            // Verificar se API está disponível
            const apiAvailable = await apiService.checkStatus();
            
            if (apiAvailable) {
                await this.shareToServer(shareData);
                messageManager.success('✅ Plano compartilhado no servidor!');
            } else {
                console.warn('API indisponível, usando apenas armazenamento local');
                messageManager.warning('⚠️ Servidor offline, salvando localmente');
            }

            // Sempre salvar localmente como backup
            this.saveSharedPlanLocally(shareId, shareData.plan);
            
            this.sharingState.currentShareId = shareId;
            this.sharingState.lastSharedPlan = plan;
            
            return shareId;

        } catch (error) {
            console.error('Erro ao compartilhar plano:', error);
            throw new Error(`Falha no compartilhamento: ${error.message}`);
        } finally {
            this.sharingState.isSharing = false;
        }
    }

    /**
     * Prepara dados para compartilhamento
     * @param {Object} plan - Plano original
     * @param {string} shareId - ID de compartilhamento
     * @returns {Object} Dados preparados
     */
    prepareShareData(plan, shareId) {
        return {
            shareId,
            plan: {
                ...plan,
                sharedAt: new Date().toISOString(),
                sharedBy: 'personal_trainer',
                originalId: plan.id
            }
        };
    }

    /**
     * Envia plano para o servidor
     * @param {Object} shareData - Dados de compartilhamento
     */
    async shareToServer(shareData) {
        try {
            await apiService.post(API_CONFIG.endpoints.shareWorkout, shareData);
        } catch (error) {
            console.warn('Falha no servidor:', error);
            throw error;
        }
    }

    /**
     * Salva plano compartilhado localmente
     * @param {string} shareId - ID de compartilhamento
     * @param {Object} planData - Dados do plano
     */
    saveSharedPlanLocally(shareId, planData) {
        try {
            const sharedPlans = this.getSharedPlansFromStorage();
            sharedPlans[shareId] = planData;
            
            storageService.save(storageService.keys.sharedPlans, sharedPlans);
            console.log(`Plano ${shareId} salvo localmente`);
            
        } catch (error) {
            console.error('Erro ao salvar plano localmente:', error);
            throw new Error('Falha ao salvar plano localmente');
        }
    }

    /**
     * Obtém planos compartilhados do storage local
     * @returns {Object} Planos compartilhados
     */
    getSharedPlansFromStorage() {
        return storageService.load(storageService.keys.sharedPlans, {});
    }

    /**
     * Busca plano compartilhado por ID
     * @param {string} shareId - ID de compartilhamento
     * @returns {Promise<Object|null>} Plano encontrado
     */
    async getSharedPlan(shareId) {
        if (!shareId || shareId.length !== 6) {
            throw new Error('ID de compartilhamento inválido');
        }

        try {
            // Tentar buscar no servidor primeiro
            const apiAvailable = await apiService.checkStatus();
            
            if (apiAvailable) {
                try {
                    const serverPlan = await apiService.get(`${API_CONFIG.endpoints.shareWorkout}/${shareId}`);
                    if (serverPlan) {
                        return serverPlan.plan;
                    }
                } catch (error) {
                    console.warn('Plano não encontrado no servidor, tentando local:', error);
                }
            }

            // Buscar localmente
            const localPlans = this.getSharedPlansFromStorage();
            return localPlans[shareId] || null;

        } catch (error) {
            console.error('Erro ao buscar plano compartilhado:', error);
            throw error;
        }
    }

    /**
     * Lista planos compartilhados
     * @returns {Array} Lista de planos compartilhados
     */
    getSharedPlansList() {
        const sharedPlans = this.getSharedPlansFromStorage();
        
        return Object.entries(sharedPlans).map(([shareId, planData]) => ({
            shareId,
            planName: planData.nome || 'Plano sem nome',
            studentName: planData.aluno?.nome || 'Não informado',
            sharedAt: planData.sharedAt || 'Data não disponível',
            originalId: planData.originalId
        }));
    }

    /**
     * Renova ID de compartilhamento
     * @param {string} oldShareId - ID antigo
     * @returns {Promise<string>} Novo ID
     */
    async renewShareId(oldShareId) {
        const sharedPlans = this.getSharedPlansFromStorage();
        const planData = sharedPlans[oldShareId];
        
        if (!planData) {
            throw new Error('Plano compartilhado não encontrado');
        }

        try {
            const newShareId = generateId(6);
            
            // Verificar se API está disponível
            const apiAvailable = await apiService.checkStatus();
            
            if (apiAvailable) {
                try {
                    await apiService.post(API_CONFIG.endpoints.shareWorkout, {
                        shareId: newShareId,
                        plan: planData
                    });
                } catch (error) {
                    console.warn('Erro no servidor, continuando com local:', error);
                }
            }

            // Salvar localmente com novo ID
            sharedPlans[newShareId] = {
                ...planData,
                sharedAt: new Date().toISOString()
            };
            
            // Remover ID antigo
            delete sharedPlans[oldShareId];
            
            storageService.save(storageService.keys.sharedPlans, sharedPlans);
            
            messageManager.success(`✅ Novo ID gerado: ${newShareId}`);
            
            return newShareId;
            
        } catch (error) {
            console.error('Erro ao renovar compartilhamento:', error);
            throw new Error('Erro ao renovar compartilhamento');
        }
    }

    /**
     * Remove compartilhamento
     * @param {string} shareId - ID de compartilhamento
     */
    removeSharedPlan(shareId) {
        try {
            const sharedPlans = this.getSharedPlansFromStorage();
            
            if (sharedPlans[shareId]) {
                delete sharedPlans[shareId];
                storageService.save(storageService.keys.sharedPlans, sharedPlans);
                messageManager.success('Compartilhamento removido');
            } else {
                messageManager.warning('Compartilhamento não encontrado');
            }
            
        } catch (error) {
            console.error('Erro ao remover compartilhamento:', error);
            messageManager.error('Erro ao remover compartilhamento');
        }
    }

    /**
     * Gera URL para WhatsApp
     * @param {string} shareId - ID de compartilhamento
     * @param {Object} planInfo - Informações do plano
     * @returns {string} URL do WhatsApp
     */
    generateWhatsAppUrl(shareId, planInfo = {}) {
        const planName = planInfo.nome || 'Plano de Treino';
        const studentName = planInfo.aluno?.nome || 'Aluno';
        
        const message = `🏋️ *${planName}*\n\n` +
                       `Olá ${studentName}! Seu plano de treino está pronto!\n\n` +
                       `📱 Para importar:\n` +
                       `1. Abra o JS Fit App (Aluno)\n` +
                       `2. Clique em "Importar por ID"\n` +
                       `3. Digite o código: *${shareId}*\n\n` +
                       `💪 Bons treinos!`;
        
        return `https://wa.me/?text=${encodeURIComponent(message)}`;
    }

    /**
     * Obtém estatísticas de compartilhamento
     * @returns {Object} Estatísticas
     */
    getShareStatistics() {
        const sharedPlans = this.getSharedPlansFromStorage();
        const plansList = Object.values(sharedPlans);
        
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        return {
            total: plansList.length,
            recentShares: plansList.filter(plan => {
                const sharedDate = new Date(plan.sharedAt);
                return sharedDate >= thirtyDaysAgo;
            }).length,
            oldestShare: plansList.length > 0 ? 
                Math.min(...plansList.map(p => new Date(p.sharedAt).getTime())) : null,
            newestShare: plansList.length > 0 ? 
                Math.max(...plansList.map(p => new Date(p.sharedAt).getTime())) : null
        };
    }

    /**
     * Limpa compartilhamentos antigos
     * @param {number} daysOld - Idade em dias para considerar antigo
     * @returns {number} Número de compartilhamentos removidos
     */
    cleanOldShares(daysOld = 90) {
        try {
            const sharedPlans = this.getSharedPlansFromStorage();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            
            let removedCount = 0;
            
            Object.entries(sharedPlans).forEach(([shareId, planData]) => {
                const sharedDate = new Date(planData.sharedAt);
                if (sharedDate < cutoffDate) {
                    delete sharedPlans[shareId];
                    removedCount++;
                }
            });
            
            if (removedCount > 0) {
                storageService.save(storageService.keys.sharedPlans, sharedPlans);
                messageManager.info(`${removedCount} compartilhamentos antigos removidos`);
            }
            
            return removedCount;
            
        } catch (error) {
            console.error('Erro ao limpar compartilhamentos:', error);
            return 0;
        }
    }
}

// Singleton instance
const shareService = new ShareService();
export default shareService;