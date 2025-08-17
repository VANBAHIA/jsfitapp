// Gerenciador de autenticação centralizado
class AuthManager {
    constructor() {
        this.token = null;
        this.userType = null;
        this.refreshInterval = null;
    }
    
    async refreshToken() {
        // Auto-renovar token antes de expirar
    }
    
    interceptRequest(request) {
        // Adicionar headers de auth em todas requisições
    }
}