/**
 * Utilitários gerais da aplicação
 * @module Utils
 */

/**
 * Gera um ID único
 * @param {number} length - Comprimento do ID
 * @returns {string} ID único
 */
export const generateId = (length = 6) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Calcula idade baseada na data de nascimento
 * @param {string} birthDate - Data de nascimento (YYYY-MM-DD)
 * @returns {number} Idade em anos
 */
export const calculateAge = (birthDate) => {
    if (!birthDate) return 25;
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return Math.max(age, 0);
};

/**
 * Formata data para exibição
 * @param {string} dateString - String de data
 * @returns {string} Data formatada
 */
export const formatDate = (dateString) => {
    if (!dateString) return 'Não definido';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
};

/**
 * Calcula tipo corporal baseado em altura e peso
 * @param {string} altura - Altura (ex: "1,75m")
 * @param {string} peso - Peso (ex: "75kg")
 * @returns {string} Tipo corporal
 */
export const calculateBodyType = (altura, peso) => {
    const height = parseFloat(altura.replace('m', '').replace(',', '.'));
    const weight = parseFloat(peso.replace('kg', ''));
    
    if (!height || !weight) return 'médio';
    
    const imc = weight / (height * height);
    
    if (imc < 18.5) return 'pequeno';
    if (imc < 25) return 'médio';
    return 'grande';
};

/**
 * Debounce para limitar frequência de execução
 * @param {Function} func - Função a ser executada
 * @param {number} delay - Delay em millisegundos
 * @returns {Function} Função com debounce
 */
export const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

/**
 * Sanitiza string para uso seguro
 * @param {string} str - String a ser sanitizada
 * @returns {string} String sanitizada
 */
export const sanitizeString = (str) => {
    if (!str) return '';
    return str.trim().replace(/[<>]/g, '');
};

/**
 * Valida email
 * @param {string} email - Email a ser validado
 * @returns {boolean} True se válido
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Copia texto para clipboard
 * @param {string} text - Texto a ser copiado
 * @returns {Promise<boolean>} Sucesso da operação
 */
export const copyToClipboard = async (text) => {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback para browsers antigos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        }
    } catch (error) {
        console.error('Erro ao copiar para clipboard:', error);
        return false;
    }
};

/**
 * Cria delay assíncrono
 * @param {number} ms - Millisegundos de delay
 * @returns {Promise} Promise que resolve após o delay
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Validações de formulário
 */
export const validators = {
    required: (value, fieldName) => {
        if (!value || value.trim() === '') {
            return `${fieldName} é obrigatório`;
        }
        return null;
    },
    
    minLength: (value, min, fieldName) => {
        if (value && value.length < min) {
            return `${fieldName} deve ter pelo menos ${min} caracteres`;
        }
        return null;
    },
    
    number: (value, fieldName) => {
        if (value && isNaN(Number(value))) {
            return `${fieldName} deve ser um número válido`;
        }
        return null;
    },
    
    range: (value, min, max, fieldName) => {
        const num = Number(value);
        if (value && (num < min || num > max)) {
            return `${fieldName} deve estar entre ${min} e ${max}`;
        }
        return null;
    }
};

/**
 * Executa validações em um objeto
 * @param {Object} data - Dados a serem validados
 * @param {Object} rules - Regras de validação
 * @returns {Array} Array de erros (vazio se válido)
 */
export const validateForm = (data, rules) => {
    const errors = [];
    
    Object.entries(rules).forEach(([field, fieldRules]) => {
        fieldRules.forEach(rule => {
            const error = rule(data[field], field);
            if (error) errors.push(error);
        });
    });
    
    return errors;
};