/**
 * Serviços de armazenamento local
 * @module StorageService
 */

import { STORAGE_KEYS } from '../core/Config.js';

class StorageService {
    constructor() {
        this.keys = STORAGE_KEYS;
    }

    /**
     * Salva dados no localStorage
     * @param {string} key - Chave de armazenamento
     * @param {any} data - Dados a serem salvos
     * @returns {boolean} Sucesso da operação
     */
    save(key, data) {
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(key, serializedData);
            return true;
        } catch (error) {
            console.error(`Erro ao salvar dados (${key}):`, error);
            return false;
        }
    }

    /**
     * Carrega dados do localStorage
     * @param {string} key - Chave de armazenamento
     * @param {any} defaultValue - Valor padrão se não encontrado
     * @returns {any} Dados carregados
     */
    load(key, defaultValue = null) {
        try {
            const stored = localStorage.getItem(key);
            if (stored === null) {
                return defaultValue;
            }
            return JSON.parse(stored);
        } catch (error) {
            console.error(`Erro ao carregar dados (${key}):`, error);
            return defaultValue;
        }
    }

    /**
     * Remove dados do localStorage
     * @param {string} key - Chave de armazenamento
     * @returns {boolean} Sucesso da operação
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Erro ao remover dados (${key}):`, error);
            return false;
        }
    }

    /**
     * Verifica se uma chave existe
     * @param {string} key - Chave a ser verificada
     * @returns {boolean} Existe ou não
     */
    exists(key) {
        return localStorage.getItem(key) !== null;
    }

    /**
     * Limpa todos os dados da aplicação
     * @returns {boolean} Sucesso da operação
     */
    clear() {
        try {
            Object.values(this.keys).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Erro ao limpar dados:', error);
            return false;
        }
    }

    /**
     * Obtém informações de uso do storage
     * @returns {Object} Informações de uso
     */
    getUsageInfo() {
        const usage = {};
        let totalSize = 0;

        Object.entries(this.keys).forEach(([name, key]) => {
            const data = localStorage.getItem(key);
            const size = data ? new Blob([data]).size : 0;
            usage[name] = {
                size,
                sizeFormatted: this.formatBytes(size),
                exists: !!data
            };
            totalSize += size;
        });

        return {
            individual: usage,
            total: {
                size: totalSize,
                sizeFormatted: this.formatBytes(totalSize)
            }
        };
    }

    /**
     * Formata bytes em formato legível
     * @param {number} bytes - Número de bytes
     * @returns {string} Tamanho formatado
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Exporta todos os dados
     * @returns {Object} Dados exportados
     */
    exportAll() {
        const exportData = {};
        
        Object.entries(this.keys).forEach(([name, key]) => {
            const data = this.load(key);
            if (data) {
                exportData[name] = data;
            }
        });

        return {
            exportDate: new Date().toISOString(),
            appVersion: '1.0.0',
            data: exportData
        };
    }

    /**
     * Importa dados exportados
     * @param {Object} importData - Dados a serem importados
     * @returns {Object} Resultado da importação
     */
    importAll(importData) {
        const results = {
            success: [],
            errors: [],
            total: 0
        };

        if (!importData.data) {
            results.errors.push('Formato de dados inválido');
            return results;
        }

        Object.entries(importData.data).forEach(([name, data]) => {
            const key = this.keys[name];
            if (key) {
                const success = this.save(key, data);
                if (success) {
                    results.success.push(name);
                } else {
                    results.errors.push(`Falha ao importar ${name}`);
                }
                results.total++;
            } else {
                results.errors.push(`Chave desconhecida: ${name}`);
            }
        });

        return results;
    }
}

// Singleton instance
const storageService = new StorageService();
export default storageService;