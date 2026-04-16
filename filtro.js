const tasks = [
  { title: "Atualizar documentação", user: "Maria Silva", status: "In Progress" },
  { title: "Configurar ambiente", user: "Usuário Padrão", status: "Completed" },
  { title: "Revisar relatório", user: "Usuário Padrão", status: "Pending" }
];

function renderTasks(filtered) {
  const container = document.getElementById("taskList");
  container.innerHTML = "";

  if (filtered.length === 0) {
    container.innerHTML = "<p>Nenhuma tarefa encontrada</p>";
    return;
  }

  filtered.forEach(task => {
    const div = document.createElement("div");
    div.className = "card task";
    div.innerHTML = `
      <div>
        <strong>${task.title}</strong><br>
        <small>${task.user}</small>
      </div>
      <div class="status">${task.status}</div>
    `;
    container.appendChild(div);
  });
}

function applyFilters() {
  const search = document.getElementById("search").value.toLowerCase();
  const status = document.getElementById("status").value;
  const user = document.getElementById("user").value;

  const filtered = tasks.filter(task => {
    return (
      (status === "All" || task.status === status) &&
      (user === "All" || task.user === user) &&
      task.title.toLowerCase().includes(search)
    );
  });

  renderTasks(filtered);
}

function resetFilters() {
  document.getElementById("search").value = "";
  document.getElementById("status").value = "All";
  document.getElementById("user").value = "All";
  renderTasks(tasks);
}

// Eventos
document.getElementById("search").addEventListener("input", applyFilters);
document.getElementById("status").addEventListener("change", applyFilters);
document.getElementById("user").addEventListener("change", applyFilters);
document.getElementById("resetBtn").addEventListener("click", resetFilters);

// Inicial
renderTasks(tasks);