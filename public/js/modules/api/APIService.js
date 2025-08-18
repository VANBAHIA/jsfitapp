/**
 * Serviços de API para comunicação com servidor
 * @module APIService
 */

import { API_CONFIG } from '../core/Config.js';

class APIService {
    constructor() {
        this.config = API_CONFIG;
    }

    /**
     * Faz requisição HTTP para API
     * @param {string} endpoint - Endpoint da API
     * @param {Object} options - Opções da requisição
     * @returns {Promise<Response>} Response da requisição
     */
    async makeRequest(endpoint, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const url = `${this.config.baseUrl}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            clearTimeout(timeoutId);
            return response;
            
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Timeout na conexão com servidor');
            }
            throw error;
        }
    }

    /**
     * Verifica se API está online
     * @returns {Promise<boolean>} Status da API
     */
    async checkStatus() {
        try {
            const response = await this.makeRequest(this.config.endpoints.health, {
                method: 'GET'
            });
            return response.ok;
        } catch (error) {
            console.warn('API offline:', error.message);
            return false;
        }
    }

    /**
     * Envia dados para API
     * @param {string} endpoint - Endpoint da API
     * @param {Object} data - Dados a serem enviados
     * @returns {Promise<Object>} Resposta da API
     */
    async post(endpoint, data) {
        const response = await this.makeRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Erro da API: ${response.status} - ${response.statusText}`);
        }

        try {
            return await response.json();
        } catch (error) {
            return { success: true };
        }
    }

    /**
     * Obtém dados da API
     * @param {string} endpoint - Endpoint da API
     * @returns {Promise<Object>} Dados da API
     */
    async get(endpoint) {
        const response = await this.makeRequest(endpoint, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`Erro da API: ${response.status} - ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Implementa retry automático
     * @param {Function} operation - Operação a ser executada
     * @param {number} retries - Número de tentativas
     * @returns {Promise} Resultado da operação
     */
    async withRetry(operation, retries = this.config.retries) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                if (attempt === retries) {
                    throw error;
                }
                
                console.warn(`Tentativa ${attempt} falhou, tentando novamente...`, error.message);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }
}

// Singleton instance
const apiService = new APIService();
export default apiService;