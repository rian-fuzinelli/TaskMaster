// Classe responsável por representar um usuário no sistema
class Usuario {
    constructor({ id, nome, nivel }) {
        this.id = id || null;
        this.nome = nome || '';
        this.nivel = nivel || 'Usuário';
    }

    // verifica se é administrador
    isAdmin() {
        return this.nivel === 'Administrador';
    }
}

module.exports = Usuario;