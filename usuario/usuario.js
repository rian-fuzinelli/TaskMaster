const userData = JSON.parse(localStorage.getItem('user'));
const user = new Usuario(userData);
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

async function fetchTasks(userId) {
    const res = await fetch(`${LINK_JSON}/tasks?userId=${userId}`);
    return res.json();
}

async function fetchUser(userId) {
    const res = await fetch(`${LINK_JSON}/users/${userId}`);
    return res.json();
}

renderListTasks();
getUser();
renderSidebarTasks();

function renderListTasks() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <section class="secao-inicial">
        <div class="texto">
            <h1>Olá, ${user.nome.split(' ')[0]}!</h1>
            <h3>Aqui está um resumo das suas tarefas de hoje!</h3>
        </div>

        <div>
            <button class="btn-add" onclick="abrirModalAdicionarTarefa()"><i class="bi bi-plus-circle"> </i> <span>Adicionar Tarefa</span></button>
        </div>
        </section>
        <div id="cards"></div>
        <div id="cardTarefa"></div>

        <!-- Modal Adicionar Tarefa -->
        <div class="modal-overlay" id="modalAdicionarTarefa">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Nova Tarefa</h2>
                    <span class="modal-close" onclick="fecharModal('modalAdicionarTarefa')">&times;</span>
                </div>
                <form id="formAdicionarTarefa">
                    <div class="modal-field">
                        <label>Título</label>
                        <input type="text" id="tituloNovaTarefa" required placeholder="Nome da tarefa">
                    </div>
                    <div class="modal-field">
                        <label>Descrição</label>
                        <textarea id="descricaoNovaTarefa" placeholder="Descrição da tarefa" rows="3"></textarea>
                    </div>
                    <button type="submit" class="btn-modal-salvar">Adicionar</button>
                </form>
            </div>
        </div>

        <!-- Modal Editar Tarefa -->
        <div class="modal-overlay" id="modalEditarTarefa">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Editar Tarefa</h2>
                    <span class="modal-close" onclick="fecharModal('modalEditarTarefa')">&times;</span>
                </div>
                <form id="formEditarTarefa">
                    <input type="hidden" id="editarTarefaId">
                    <div class="modal-field">
                        <label>Título</label>
                        <input type="text" id="editarTarefaTitulo" required placeholder="Nome da tarefa">
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
    renderCards();
    renderTarefa();
    renderSidebarTasks();
    setupFormHandlers();
}

function setupFormHandlers() {
    document.getElementById('formAdicionarTarefa').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('tituloNovaTarefa').value.trim();
        const description = document.getElementById('descricaoNovaTarefa').value.trim();

        if (!title) return;

        await fetch(`${LINK_JSON}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                description,
                status: 'Pendente',
                userId: user.id
            })
        });

        fecharModal('modalAdicionarTarefa');
        renderCards();
        renderTarefa();
        renderSidebarTasks();
    });

    document.getElementById('formEditarTarefa').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editarTarefaId').value;
        const title = document.getElementById('editarTarefaTitulo').value.trim();

        if (!title) return;

        await fetch(`${LINK_JSON}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });

        fecharModal('modalEditarTarefa');
        renderCards();
        renderTarefa();
        renderSidebarTasks();
    });
}

function abrirModalAdicionarTarefa() {
    document.getElementById('modalAdicionarTarefa').classList.add('ativo');
}

function abrirModalEditarTarefa(id, tituloAtual) {
    document.getElementById('editarTarefaId').value = id;
    document.getElementById('editarTarefaTitulo').value = tituloAtual;
    document.getElementById('modalEditarTarefa').classList.add('ativo');
}

function fecharModal(modalId) {
    document.getElementById(modalId).classList.remove('ativo');
}

async function deletarTarefa(id) {
    document.getElementById('modalConfirmarExclusao').classList.add('ativo');
    const btnConfirmar = document.getElementById('btnConfirmarExclusao');
    const novoBotao = btnConfirmar.cloneNode(true);
    btnConfirmar.parentNode.replaceChild(novoBotao, btnConfirmar);
    novoBotao.addEventListener('click', async () => {
        await fetch(`${LINK_JSON}/tasks/${id}`, { method: 'DELETE' });
        fecharModal('modalConfirmarExclusao');
        renderCards();
        renderTarefa();
        renderSidebarTasks();
    });
}

async function alterarStatus(id, novoStatus) {
    await fetch(`${LINK_JSON}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
    });
    renderCards();
    renderTarefa();
    renderSidebarTasks();
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
    const tasks = await fetchTasks(user.id);

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

async function renderTarefa() {
    const container = document.getElementById("cardTarefa");
    const tasks = await fetchTasks(user.id);

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
                <button class="btn-acao btn-editar" onclick="abrirModalEditarTarefa(${task.id}, '${task.title.replace(/'/g, "\\'")}')"><i class="bi bi-pencil-square"></i></button>
                <button class="btn-acao btn-remover" onclick="deletarTarefa(${task.id})"><i class="bi bi-trash3"></i></button>
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

async function renderSidebarTasks() {
    const container = document.getElementById('sidebarTasks');
    if (!container) return;
    const tasks = await fetchTasks(user.id);

    const statusIcons = {
        'Pendente': 'bi-circle',
        'Em Andamento': 'bi-arrow-repeat',
        'Completa': 'bi-check-circle-fill'
    };

    const statusColors = {
        'Pendente': '#fba029',
        'Em Andamento': '#5172e1',
        'Completa': '#367D5E'
    };

    let html = '';
    tasks.forEach(task => {
        const icon = statusIcons[task.status] || 'bi-circle';
        const color = statusColors[task.status] || '#73777D';
        html += `
            <div class="sidebar-task-item">
                <i class="bi ${icon}" style="color: ${color}; font-size: 0.9rem;"></i>
                <span class="sidebar-task-title">${task.title}</span>
            </div>
        `;
    });

    if (tasks.length === 0) {
        html = '<p class="sidebar-task-empty">Nenhuma tarefa</p>';
    }

    container.innerHTML = html;
}

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