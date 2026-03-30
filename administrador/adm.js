
const user = JSON.parse(localStorage.getItem('user'));
const LINK_JSON = "http://localhost:3000";

if (!user) {
    window.location.href = 'login.html';
}

const tasksByUserPromise = (userId) =>
    fetch(`${LINK_JSON}/tasks?userId=${userId}`)
.then(res => res.json());

const UserLogPromise = (userId) =>
    fetch(`${LINK_JSON}/users/${userId}`)
.then(res => res.json());

const tasksPromise = fetch(`${LINK_JSON}/tasks`)
.then(res => res.json())
.catch(error => {
        console.log("error", error);
        return [];
})

const usersPromise = fetch(`${LINK_JSON}/users`)
    .then(res => res.json())
    .catch(error => {
        console.log("error", error);
        return [];
})
    
getUser();
renderDashboard();

function navigate(page, button) {
    const buttons = document.querySelectorAll(".button-menu");
    buttons.forEach(b => b.classList.remove("marcado"));

    if (page === 'dashboard') {
        renderDashboard()
        button.classList.add("marcado");
        lucide.createIcons();
    }
    if (page === 'users') {
        renderListUsers();
        button.classList.add("marcado");
    }
    
    if(page === 'myTasks'){
        renderListTasks();
        button.classList.add("marcado");
    }
}

function renderDashboard() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="top-admin">
            <div class="top">
                <h1>Admin Dashboard</h1>
                <p>Gerencie e atribua tarefas aos usuários.</p>
            </div>
            <button><span>+ Atribuir Nova Tarefa</span></button>
        </div>
        <div id="cards"></div>
        <div id="tasks"></div>
    `;

    renderCards('admin');
    renderTasks();
}

function renderListUsers() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="top-admin">
            <div class="top">
                <h1>Gerenciamento de Usuários</h1>
                <p>Adicionar, Remover e Gerenciar Usuários</p>
            </div>
            <button><span>+ Adicionar Usuários</span></button>
        </div>
        <div id="tabelaUsuarios"></div>
    `;

    renderUsers();
}

function renderListTasks() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <section class="secao-inicial">
        <div class="texto">
            <h1>Olá, Usuário!</h1>
            <h3>Aqui está um resumo das suas tarefas de hoje!</h3>
        </div>

        <div>
            <button class="btn-add"><span>+ Adicionar Tarefas</span></button>
        </div>
        </section>
        <div id="cards"></div>
        <div id="cardTarefa"></div>
    `;
    renderCards('user');
    renderTarefa();
}

async function renderCards(tipo) {
    let tasks;
    if(tipo === 'user'){
        tasks = await tasksByUserPromise(user.id);
        console.log(tipo, tasks)
    }
    
    if(tipo === 'admin'){
        console.log(tipo, tasks)
        tasks = await tasksPromise;
    }

    console.log(tasks)

    const total = tasks.filter(tasks => tasks).length;
    const pending = tasks.filter(tasks => tasks.status === "Pendentes").length;
    const progress = tasks.filter(tasks => tasks.status === "Em Andamento").length;
    const complet = tasks.filter(tasks => tasks.status === "Completa").length;

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
    `
    lucide.createIcons();
}

async function renderTasks() {
    const container = document.getElementById("tasks");

    let tasksHTML = "";

    const tasks = await tasksPromise;
    const users = await usersPromise;

    tasks.forEach(task => {
        const usuario = users.find(u => u.id == task.userId);
        tasksHTML += `
                <div class="list-tasks">
                    <div class="details">
                        <h1>${task.title}</h1>
                        <p>${task.description}</p>
                        <span>Criado em ${task.date}</span>
                    </div>
                    <div class="info-final">
                        <div class="assigned">
                            <span class="avatar">${usuario.nome.charAt(0)}</span>
                            <div class="assigned-content">
                                <span class="assigned-name">${usuario.nome}</span>
                                <span class="assigned-email">${usuario.email}</span>
                            </div>
                        </div>
                        <div class="status">
                            <span class="status-color ${task.status.toLowerCase().replace(" ", "-")}">${task.status}</span>
                        </div>
                        <div class="actions">
                            <span data-lucide="trash-2" id="excluir" class="icon-act"></span>
                            <span data-lucide="pencil-line" id="editar" class="icon-act"></span>
                        </div>
                    </div>
                </div>
         `
    })

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
    `
    lucide.createIcons();
}

async function renderTarefa() {
    const container = document.getElementById("cardTarefa");
    let tafHTML = "";
    const task = await tasksByUserPromise(user.id);

    console.log(task)

    task.forEach(user => {
        const config = statusConfig[user.status];

        console.log(config)
            tafHTML += `
        <div class="card card-tarefa">
            <div class="icone-status icone-andamento">
                <span class="badge-${config.classe}" data-lucide="${config.icone}"></span>
            </div>

            <div class="tarefa">
                <div class="nome-status">
                    <h2 class="nome-tarefa">${user.title}</h2>
                    <h4 class="badge-status badge-${config.classe}">${user.status}</h4>
                </div>

                <p class="descricao">${user.description}</p>
                <h6 class="data-tarefa">Criado em ${user.date}</h6>
            </div>

            <button class="botao-tarefa btn-add">${config.botao}</button>

        </div>
         `
    })

    container.innerHTML = `
        <h1 class="titulo-lista">Sua lista de tarefas</h1>

                ${tafHTML}
    `
    lucide.createIcons();
}

async function renderUsers() {
    const containerUsers = document.getElementById("tabelaUsuarios");

    console.log(containerUsers)

    let usersHTML = "";

    const users = await usersPromise;

    users.forEach(user => {
        nivel = "usuario";

        if(user.nivel === "Administrador"){
            nivel = "adm"
        }

        usersHTML += `
            <div class="list-users">
                <div class="assigned item-celula">
                    <span class="avatar">${user.nome.charAt(0)}</span>
                    <div class="assigned-content">
                        <span class="assigned-name">${user.nome}</span>
                        <span class="assigned-email">${user.email}</span>
                    </div>
                </div>
                <h1 class="item-celula nivel nivel-${nivel}">${user.nivel}</h1>
                <p class="item-celula senha">${user.senha}</p>
                <span class="item-celula">${user.ingresso}</span>
                <div class="actions item-celula">
                    <span data-lucide="trash-2" id="excluir" class="icon-act"></span>
                    <span data-lucide="pencil-line" id="editar" class="icon-act"></span>
                </div>
            </div>
         `
    })

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
    `
    lucide.createIcons();
}

async function getUser() {
    const usuario = document.getElementById('usuarioLogado');
    const userLog = await UserLogPromise(user.id);

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