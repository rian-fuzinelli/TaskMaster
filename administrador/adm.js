
const user = JSON.parse(localStorage.getItem('user'));
const LINK_JSON = "http://localhost:3000";

if (!user) {
    window.location.href = '/index.html';
}

const statusConfig = {
    "Completa": {
        classe: "completa",
        icone: "check-circle",
        icoClass: "card-check",
        botao: "Reiniciar Tarefa",
        proximo: "Pendente"
    },
    "Em Andamento": {
        classe: "andamento",
        icone: "clock-4",
        icoClass: "card-clock",
        botao: "Concluir",
        proximo: "Completa"
    },
    "Pendente": {
        classe: "pendente",
        icone: "alert-circle",
        icoClass: "card-info",
        botao: "Iniciar",
        proximo: "Em Andamento"
    }
};

async function fetchAllTasks() {
    const res = await fetch(`${LINK_JSON}/tasks`);
    return res.json();
}

async function fetchTasksByUser(userId) {
    const res = await fetch(`${LINK_JSON}/tasks?userId=${userId}`);
    return res.json();
}

async function fetchAllUsers() {
    const res = await fetch(`${LINK_JSON}/users`);
    return res.json();
}

async function fetchUser(userId) {
    const res = await fetch(`${LINK_JSON}/users/${userId}`);
    return res.json();
}

getUser();
renderDashboard();

function navigate(page, button) {
    const buttons = document.querySelectorAll(".button-menu");
    buttons.forEach(b => b.classList.remove("marcado"));

    if (page === 'dashboard') {
        renderDashboard();
        button.classList.add("marcado");
    }
    if (page === 'users') {
        renderListUsers();
        button.classList.add("marcado");
    }
    if (page === 'myTasks') {
        renderListTasks();
        button.classList.add("marcado");
    }
}

// ========================
// MODAL HELPERS
// ========================
function fecharModal(modalId) {
    document.getElementById(modalId).classList.remove('ativo');
}

// ========================
// DASHBOARD (Admin)
// ========================
function renderDashboard() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="top-admin">
            <div class="top">
                <h1>Admin Dashboard</h1>
                <p>Gerencie e atribua tarefas aos usuários.</p>
            </div>
            <button onclick="abrirModalAtribuirTarefa()"><span>+ Atribuir Nova Tarefa</span></button>
        </div>
        <div id="cards"></div>
        <div id="tasks"></div>

        <!-- Modal Atribuir Tarefa -->
        <div class="modal-overlay" id="modalAtribuirTarefa">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Atribuir Nova Tarefa</h2>
                    <span class="modal-close" onclick="fecharModal('modalAtribuirTarefa')">&times;</span>
                </div>
                <form id="formAtribuirTarefa">
                    <div class="modal-field">
                        <label>Título</label>
                        <input type="text" id="atribuirTitulo" required placeholder="Nome da tarefa">
                    </div>
                    <div class="modal-field">
                        <label>Descrição</label>
                        <textarea id="atribuirDescricao" placeholder="Descrição" rows="3"></textarea>
                    </div>
                    <div class="modal-field">
                        <label>Atribuir a</label>
                        <select id="atribuirUsuario" required></select>
                    </div>
                    <button type="submit" class="btn-modal-salvar">Atribuir</button>
                </form>
            </div>
        </div>

        <!-- Modal Editar Tarefa (Admin) -->
        <div class="modal-overlay" id="modalEditarTarefaAdmin">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Editar Tarefa</h2>
                    <span class="modal-close" onclick="fecharModal('modalEditarTarefaAdmin')">&times;</span>
                </div>
                <form id="formEditarTarefaAdmin">
                    <input type="hidden" id="editarTarefaAdminId">
                    <div class="modal-field">
                        <label>Título</label>
                        <input type="text" id="editarTarefaAdminTitulo" required placeholder="Nome da tarefa">
                    </div>
                    <button type="submit" class="btn-modal-salvar">Salvar</button>
                </form>
            </div>
        </div>

        <!-- Modal Confirmar Exclusão -->
        <div class="modal-overlay" id="modalConfirmarExclusao">
            <div class="modal-content modal-confirmar">
                <div class="modal-confirmar-icone">
                    <i class="bi bi-exclamation-triangle"></i>
                </div>
                <h2>Excluir Tarefa</h2>
                <p>Tem certeza que deseja excluir esta tarefa? Esta ação não poderá ser desfeita.</p>
                <div class="modal-confirmar-btns">
                    <button class="btn-cancelar" onclick="fecharModal('modalConfirmarExclusao')">Cancelar</button>
                    <button class="btn-confirmar-excluir" id="btnConfirmarExclusao">Excluir</button>
                </div>
            </div>
        </div>
    `;

    renderCards('admin');
    renderTasks();
    setupDashboardForms();
}

function setupDashboardForms() {
    document.getElementById('formAtribuirTarefa').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('atribuirTitulo').value.trim();
        const description = document.getElementById('atribuirDescricao').value.trim();
        const userId = Number(document.getElementById('atribuirUsuario').value);

        if (!title) return;

        await fetch(`${LINK_JSON}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, status: 'Pendente', userId })
        });

        fecharModal('modalAtribuirTarefa');
        renderCards('admin');
        renderTasks();
    });

    document.getElementById('formEditarTarefaAdmin').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editarTarefaAdminId').value;
        const title = document.getElementById('editarTarefaAdminTitulo').value.trim();

        if (!title) return;

        await fetch(`${LINK_JSON}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });

        fecharModal('modalEditarTarefaAdmin');
        renderCards('admin');
        renderTasks();
    });
}

async function abrirModalAtribuirTarefa() {
    document.getElementById('modalAtribuirTarefa').classList.add('ativo');
    const users = await fetchAllUsers();
    const select = document.getElementById('atribuirUsuario');
    select.innerHTML = users.map(u => `<option value="${u.id}">${u.nome}</option>`).join('');
}

function abrirEditarTarefaAdmin(id, tituloAtual) {
    document.getElementById('editarTarefaAdminId').value = id;
    document.getElementById('editarTarefaAdminTitulo').value = tituloAtual;
    document.getElementById('modalEditarTarefaAdmin').classList.add('ativo');
}

async function deletarTarefaAdmin(id) {
    document.getElementById('modalConfirmarExclusao').classList.add('ativo');
    const btnConfirmar = document.getElementById('btnConfirmarExclusao');
    const novoBotao = btnConfirmar.cloneNode(true);
    btnConfirmar.parentNode.replaceChild(novoBotao, btnConfirmar);
    novoBotao.addEventListener('click', async () => {
        await fetch(`${LINK_JSON}/tasks/${id}`, { method: 'DELETE' });
        fecharModal('modalConfirmarExclusao');
        renderCards('admin');
        renderTasks();
    });
}

// ========================
// USERS PAGE
// ========================
function renderListUsers() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="top-admin">
            <div class="top">
                <h1>Gerenciamento de Usuários</h1>
                <p>Adicionar, Remover e Gerenciar Usuários</p>
            </div>
            <button onclick="abrirModalAddUsuario()"><span>+ Adicionar Usuários</span></button>
        </div>
        <div id="tabelaUsuarios"></div>

        <!-- Modal Adicionar Usuário -->
        <div class="modal-overlay" id="modalAddUsuario">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Novo Usuário</h2>
                    <span class="modal-close" onclick="fecharModal('modalAddUsuario')">&times;</span>
                </div>
                <form id="formAddUsuario">
                    <div class="modal-field">
                        <label>Nome</label>
                        <input type="text" id="novoUsuarioNome" required placeholder="Nome completo">
                    </div>
                    <div class="modal-field">
                        <label>Email</label>
                        <input type="email" id="novoUsuarioEmail" required placeholder="email@exemplo.com">
                    </div>
                    <div class="modal-field">
                        <label>Senha</label>
                        <input type="password" id="novoUsuarioSenha" required placeholder="Senha">
                    </div>
                    <div class="modal-field">
                        <label>Nível</label>
                        <select id="novoUsuarioNivel">
                            <option value="Usuário">Usuário</option>
                            <option value="Administrador">Administrador</option>
                        </select>
                    </div>
                    <button type="submit" class="btn-modal-salvar">Adicionar</button>
                </form>
            </div>
        </div>
    `;

    renderUsers();
    setupUserForms();
}

function setupUserForms() {
    document.getElementById('formAddUsuario').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('novoUsuarioNome').value.trim();
        const email = document.getElementById('novoUsuarioEmail').value.trim();
        const senha = document.getElementById('novoUsuarioSenha').value;
        const nivel = document.getElementById('novoUsuarioNivel').value;

        await fetch(`${LINK_JSON}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha, nivel })
        });

        fecharModal('modalAddUsuario');
        renderUsers();
    });
}

function abrirModalAddUsuario() {
    document.getElementById('modalAddUsuario').classList.add('ativo');
}

async function deletarUsuario(id) {
    if (!confirm('Deseja realmente excluir este usuário?')) return;
    await fetch(`${LINK_JSON}/users/${id}`, { method: 'DELETE' });
    renderUsers();
}

// ========================
// MY TASKS (Admin's own tasks)
// ========================
function renderListTasks() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <section class="secao-inicial">
        <div class="texto">
            <h1>Olá, ${user.nome.split(' ')[0]}!</h1>
            <h3>Aqui está um resumo das suas tarefas de hoje!</h3>
        </div>

        <div>
            <button class="btn-add" onclick="abrirModalAdicionarTarefaAdmin()"><i class="bi bi-plus-circle"></i> <span>Adicionar Tarefa</span></button>
        </div>
        </section>
        <div id="cards"></div>
        <div id="cardTarefa"></div>

        <!-- Modal Adicionar Tarefa Pessoal -->
        <div class="modal-overlay" id="modalAddTarefaPessoal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Nova Tarefa</h2>
                    <span class="modal-close" onclick="fecharModal('modalAddTarefaPessoal')">&times;</span>
                </div>
                <form id="formAddTarefaPessoal">
                    <div class="modal-field">
                        <label>Título</label>
                        <input type="text" id="novaTarefaPessoalTitulo" required placeholder="Nome da tarefa">
                    </div>
                    <div class="modal-field">
                        <label>Descrição</label>
                        <textarea id="novaTarefaPessoalDescricao" placeholder="Descrição" rows="3"></textarea>
                    </div>
                    <button type="submit" class="btn-modal-salvar">Adicionar</button>
                </form>
            </div>
        </div>

        <!-- Modal Editar Tarefa Pessoal -->
        <div class="modal-overlay" id="modalEditarTarefaPessoal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Editar Tarefa</h2>
                    <span class="modal-close" onclick="fecharModal('modalEditarTarefaPessoal')">&times;</span>
                </div>
                <form id="formEditarTarefaPessoal">
                    <input type="hidden" id="editarPessoalId">
                    <div class="modal-field">
                        <label>Título</label>
                        <input type="text" id="editarPessoalTitulo" required placeholder="Nome da tarefa">
                    </div>
                    <button type="submit" class="btn-modal-salvar">Salvar</button>
                </form>
            </div>
        </div>

        <!-- Modal Confirmar Exclusão -->
        <div class="modal-overlay" id="modalConfirmarExclusao">
            <div class="modal-content modal-confirmar">
                <div class="modal-confirmar-icone">
                    <i class="bi bi-exclamation-triangle"></i>
                </div>
                <h2>Excluir Tarefa</h2>
                <p>Tem certeza que deseja excluir esta tarefa? Esta ação não poderá ser desfeita.</p>
                <div class="modal-confirmar-btns">
                    <button class="btn-cancelar" onclick="fecharModal('modalConfirmarExclusao')">Cancelar</button>
                    <button class="btn-confirmar-excluir" id="btnConfirmarExclusao">Excluir</button>
                </div>
            </div>
        </div>
    `;
    renderCards('user');
    renderTarefa();
    setupMyTasksForms();
}

function setupMyTasksForms() {
    document.getElementById('formAddTarefaPessoal').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('novaTarefaPessoalTitulo').value.trim();
        const description = document.getElementById('novaTarefaPessoalDescricao').value.trim();

        if (!title) return;

        await fetch(`${LINK_JSON}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, status: 'Pendente', userId: user.id })
        });

        fecharModal('modalAddTarefaPessoal');
        renderCards('user');
        renderTarefa();
    });

    document.getElementById('formEditarTarefaPessoal').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editarPessoalId').value;
        const title = document.getElementById('editarPessoalTitulo').value.trim();

        if (!title) return;

        await fetch(`${LINK_JSON}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });

        fecharModal('modalEditarTarefaPessoal');
        renderCards('user');
        renderTarefa();
    });
}

function abrirModalAdicionarTarefaAdmin() {
    document.getElementById('modalAddTarefaPessoal').classList.add('ativo');
}

function abrirEditarPessoal(id, tituloAtual) {
    document.getElementById('editarPessoalId').value = id;
    document.getElementById('editarPessoalTitulo').value = tituloAtual;
    document.getElementById('modalEditarTarefaPessoal').classList.add('ativo');
}

async function deletarTarefaPessoal(id) {
    document.getElementById('modalConfirmarExclusao').classList.add('ativo');
    const btnConfirmar = document.getElementById('btnConfirmarExclusao');
    const novoBotao = btnConfirmar.cloneNode(true);
    btnConfirmar.parentNode.replaceChild(novoBotao, btnConfirmar);
    novoBotao.addEventListener('click', async () => {
        await fetch(`${LINK_JSON}/tasks/${id}`, { method: 'DELETE' });
        fecharModal('modalConfirmarExclusao');
        renderCards('user');
        renderTarefa();
    });
}

async function alterarStatus(id, novoStatus) {
    await fetch(`${LINK_JSON}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
    });
    renderCards('user');
    renderTarefa();
}

// ========================
// RENDER CARDS
// ========================
async function renderCards(tipo) {
    let tasks;
    if (tipo === 'user') {
        tasks = await fetchTasksByUser(user.id);
    }
    if (tipo === 'admin') {
        tasks = await fetchAllTasks();
    }

    const total = tasks.length;
    const pending = tasks.filter(t => t.status === "Pendente").length;
    const progress = tasks.filter(t => t.status === "Em Andamento").length;
    const complet = tasks.filter(t => t.status === "Completa").length;

    document.getElementById("cards").innerHTML = `
        <div class="card">
        <span class="card-check" data-lucide="square-check-big"></span>
            <div class="card-info">
                <span>Total de Tarefas</span>
                <p>${total}</p>
            </div>
        </div>
        <div class="card">
        <span class="card-alert" data-lucide="circle-alert"></span>
            <div class="card-info">
                <span>Pendentes</span>
                <p>${pending}</p>
            </div>
        </div>        
        <div class="card">
        <span class="card-clock" data-lucide="clock-4"></span>
            <div class="card-info">
                <span>Em Andamento</span>
                <p>${progress}</p>
            </div>                
        </div>
        <div class="card">
        <span class="card-circle-check" data-lucide="circle-check"></span>
            <div class="card-info">
                <span>Completas</span>
                <p>${complet}</p>
            </div>                
        </div>
    `;
    lucide.createIcons();
}

// ========================
// RENDER TASKS TABLE (Dashboard)
// ========================
async function renderTasks() {
    const container = document.getElementById("tasks");

    const tasks = await fetchAllTasks();
    const users = await fetchAllUsers();

    let tasksHTML = "";

    tasks.forEach(task => {
        const usuario = users.find(u => u.id == task.userId);
        const nomeUsuario = usuario ? usuario.nome : 'Não atribuído';
        const emailUsuario = usuario ? usuario.email : '';

        tasksHTML += `
                <div class="list-tasks">
                    <div class="details">
                        <h1>${task.title}</h1>
                        <p>${task.description}</p>
                        <span>Criado em ${task.date}</span>
                    </div>
                    <div class="info-final">
                        <div class="assigned">
                            <span class="avatar">${nomeUsuario.charAt(0)}</span>
                            <div class="assigned-content">
                                <span class="assigned-name">${nomeUsuario}</span>
                                <span class="assigned-email">${emailUsuario}</span>
                            </div>
                        </div>
                        <div class="status">
                            <span class="status-color ${task.status.toLowerCase().replace(" ", "-")}">${task.status}</span>
                        </div>
                        <div class="actions">
                            <span class="icon-act" style="color:#f00;cursor:pointer" onclick="deletarTarefaAdmin(${task.id})">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </span>
                            <span class="icon-act" style="color:#2251B0;cursor:pointer" onclick="abrirEditarTarefaAdmin(${task.id}, '${String(task.title).replace(/'/g, "\\'")}')"> 
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>
                            </span>
                        </div>
                    </div>
                </div>
         `;
    });

    container.innerHTML = `
        <div class="tasks">
            <span>Status das Tarefas</span>
            <div class="info-bar">
                <div class="info-bar-details">DETALHES</div>
                <div class="info-bar-final">
                    <div class="">ATRIBUIDO A:</div>
                    <div class="">STATUS</div>
                    <div class="">AÇÕES</div>
                </div>
            </div>
            <div class="tasks-content">
                ${tasksHTML}
            </div>
        </div>
    `;
    lucide.createIcons();
}

// ========================
// RENDER MY TASKS (Card view)
// ========================
async function renderTarefa() {
    const container = document.getElementById("cardTarefa");
    const tasks = await fetchTasksByUser(user.id);

    let tafHTML = "";

    tasks.forEach(task => {
        const config = statusConfig[task.status] || statusConfig["Pendente"];

        tafHTML += `
        <div class="card card-tarefa">
            <div class="icone-status icone-andamento">
                <span class="badge-${config.classe}" data-lucide="${config.icone}"></span>
            </div>

            <div class="tarefa">
                <div class="nome-status">
                    <h2 class="nome-tarefa">${task.title}</h2>
                    <h4 class="badge-status badge-${config.classe}">${task.status}</h4>
                </div>

                <p class="descricao">${task.description}</p>
                <h6 class="data-tarefa">Criado em ${task.date}</h6>
            </div>

            <div class="tarefa-acoes">
                <button class="btn-acao btn-iniciar" onclick="alterarStatus(${task.id}, '${config.proximo}')" title="${config.botao}"><i class="bi bi-play-circle"></i></button>
                <button class="btn-acao btn-editar" onclick="abrirEditarPessoal(${task.id}, '${task.title.replace(/'/g, "\\'")}')"><i class="bi bi-pencil-square"></i></button>
                <button class="btn-acao btn-remover" onclick="deletarTarefaPessoal(${task.id})"><i class="bi bi-trash3"></i></button>
            </div>
        </div>
         `;
    });

    container.innerHTML = `
        <h1 class="titulo-lista">Sua lista de tarefas</h1>
        ${tafHTML}
    `;
    lucide.createIcons();
}

// ========================
// RENDER USERS TABLE
// ========================
async function renderUsers() {
    const containerUsers = document.getElementById("tabelaUsuarios");

    const users = await fetchAllUsers();
    let usersHTML = "";

    users.forEach(u => {
        let nivel = "usuario";
        if (u.nivel === "Administrador") nivel = "adm";

        usersHTML += `
            <div class="list-users">
                <div class="assigned item-celula">
                    <span class="avatar">${u.nome.charAt(0)}</span>
                    <div class="assigned-content">
                        <span class="assigned-name">${u.nome}</span>
                        <span class="assigned-email">${u.email}</span>
                    </div>
                </div>
                <h1 class="item-celula nivel nivel-${nivel}">${u.nivel}</h1>
                <p class="item-celula senha">••••••</p>
                <span class="item-celula">${u.ingresso}</span>
                <div class="actions item-celula">
                    <span data-lucide="trash-2" class="icon-act" style="color:#f00;cursor:pointer" onclick="deletarUsuario(${u.id})"></span>
                </div>
            </div>
         `;
    });

    containerUsers.innerHTML = `
        <div class="usuarios">
            <div class="bar-users">
                <div class="bar-users-details">USUÁRIO</div>
                <div class="bar-users-details">NÍVEL</div>
                <div class="bar-users-details">SENHA</div>
                <div class="bar-users-details">INGRESSO</div>
                <div class="bar-users-details">AÇÕES</div>
            </div>
            <div class="tasks-content">
                ${usersHTML}
            </div>
        </div>
    `;
    lucide.createIcons();
}

// ========================
// USER INFO & LOGOUT
// ========================
async function getUser() {
    const usuario = document.getElementById('usuarioLogado');

    usuario.innerHTML = `
        <span>${user.nome.charAt(0)}</span>
        <div class="admin">
            <span>${user.nome}</span>
            <span>${user.nivel}</span>
        </div>
    `;
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = '/index.html';
}