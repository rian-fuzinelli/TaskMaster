const user = JSON.parse(localStorage.getItem('user'));
const LINK_JSON = "http://localhost:3000";

if (!user) {
    window.location.href = 'login.html';
}

console.log(user)

const tasksByUserPromise = (userId) =>
    fetch(`${LINK_JSON}/tasks?userId=${userId}`)
        .then(res => res.json());

const UserLogPromise = (userId) =>
    fetch(`${LINK_JSON}/users/${userId}`)
        .then(res => res.json());

const statusConfig = {
    "Completa": {
        classe: "completa",
        icone: "check-circle",
        icoClass: "card-check",
        botao: "Reiniciar Tarefa"
    },
    "Em Andamento": {
        classe: "andamento",
        icone: "clock-4",
        icoClass: "card-clock",
        botao: "Concluir"
    },
    "Pendente": {
        classe: "pendente",
        icone: "alert-circle",
        icoClass: "card-info",
        botao: "Iniciar"
    }
};

renderListTasks();
getUser();

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
    renderCards();
    renderTarefa();
}

function navigate(page, button) {
    const buttons = document.querySelectorAll(".button-menu");
    buttons.forEach(b => b.classList.remove("marcado"));

    if (page === 'myTasks') {
        button.classList.add("marcado");
        renderListTasks();
    }
}

async function renderCards() {
    const tasks = await tasksByUserPromise(user.id);
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

async function getUser() {
    const usuario = document.getElementById('usuarioLogado');
    const userLog = await UserLogPromise(user.id);

    console.log(userLog)

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