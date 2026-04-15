class Task{
    constructor({title, description, status, userId}){
        this.id = null;
        this.title = title;
        this.description = description || '';
        this.status = status || 'Pendente';
        this.date = new Date().toLocaleDateString('pt-BR');
        this.userId = userId || null;
    }
}

//permite exportar /tornar disponivel para outra classe
module.exports = Task;
