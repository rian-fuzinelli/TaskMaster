const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ========================
// BANCO DE DADOS COM PERSISTÊNCIA EM db.json
// ========================
const DB_PATH = path.join(__dirname, 'db.json');

function loadDb() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return { tasks: [], users: [] };
    }
}

function saveDb() {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 4), 'utf-8');
}

const db = loadDb();

// Helper para gerar próximo ID
function nextId(collection) {
    if (collection.length === 0) return 1;
    return Math.max(...collection.map(item => item.id)) + 1;
}

// ========================
// ROTAS DE AUTENTICAÇÃO
// ========================

// POST /api/login
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    const user = db.users.find(u => u.email === email && u.senha === senha);
    if (!user) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
    }
    const { senha: _, ...userSemSenha } = user;
    res.json(userSemSenha);
});

// POST /api/forgot-password
app.post('/api/forgot-password', (req, res) => {
    const { email, novaSenha } = req.body;
    if (!email || !novaSenha) {
        return res.status(400).json({ error: 'Email e nova senha são obrigatórios' });
    }
    const user = db.users.find(u => u.email === email);
    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    user.senha = novaSenha;
    saveDb();
    res.json({ message: 'Senha alterada com sucesso' });
});

// ========================
// ROTAS DE USUÁRIOS
// ========================

// GET /users (compatível com json-server: ?email=xxx)
app.get('/users', (req, res) => {
    const { email } = req.query;
    if (email) {
        const filtered = db.users.filter(u => u.email === email);
        return res.json(filtered);
    }
    res.json(db.users);
});

// GET /users/:id
app.get('/users/:id', (req, res) => {
    const user = db.users.find(u => u.id === Number(req.params.id));
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
});

// POST /users
app.post('/users', (req, res) => {
    const { nome, nivel, senha, email } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }
    const newUser = {
        id: nextId(db.users),
        nome,
        nivel: nivel || 'Usuário',
        senha,
        ingresso: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        email
    };
    db.users.push(newUser);
    saveDb();
    res.status(201).json(newUser);
});

// PUT /users/:id
app.put('/users/:id', (req, res) => {
    const idx = db.users.findIndex(u => u.id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Usuário não encontrado' });
    db.users[idx] = { ...db.users[idx], ...req.body, id: db.users[idx].id };
    saveDb();
    res.json(db.users[idx]);
});

// DELETE /users/:id
app.delete('/users/:id', (req, res) => {
    const idx = db.users.findIndex(u => u.id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Usuário não encontrado' });
    const deleted = db.users.splice(idx, 1);
    saveDb();
    res.json(deleted[0]);
});

// ========================
// ROTAS DE TAREFAS
// ========================

// GET /tasks (compatível com json-server: ?userId=xxx)
app.get('/tasks', (req, res) => {
    const { userId } = req.query;
    if (userId) {
        const filtered = db.tasks.filter(t => t.userId === Number(userId));
        return res.json(filtered);
    }
    res.json(db.tasks);
});

// GET /tasks/:id
const Task = require('./tarefa/Task');
    app.get('/tasks/:id', (req, res) => {
        const task = db.tasks.find(t => t.id === Number(req.params.id));
        
        if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' });
        res.json(task);
    });

    // POST /tasks
    app.post('/tasks', (req, res) => {
        const { title, description, status, userId } = req.body;
        
        if (!title) {
            return res.status(400).json({ error: 'Título é obrigatório' });
        }

        const newTask = new Task({ title, description, status, userId});

        newTask.id = nextId(db.tasks);

        db.tasks.push(newTask);
        saveDb();

        res.status(201).json(newTask);
    });

    // PUT /tasks/:id
    app.put('/tasks/:id', (req, res) => {
        const idx = db.tasks.findIndex(t => t.id === Number(req.params.id));
        if (idx === -1) return res.status(404).json({ error: 'Tarefa não encontrada' });
        db.tasks[idx] = { ...db.tasks[idx], ...req.body, id: db.tasks[idx].id };
        saveDb();
        res.json(db.tasks[idx]);
    });

    // DELETE /tasks/:id
    app.delete('/tasks/:id', (req, res) => {
        const idx = db.tasks.findIndex(t => t.id === Number(req.params.id));
        if (idx === -1) return res.status(404).json({ error: 'Tarefa não encontrada' });
        const deleted = db.tasks.splice(idx, 1);
        saveDb();
        res.json(deleted[0]);
    });

// ========================
// INICIAR SERVIDOR
// ========================
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
