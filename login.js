lucide.createIcons();

function verSenha() {
  const inputSenha = document.getElementById("senha");
  const toggleSenha = document.getElementById("toggleSenha");

  const isPassword = inputSenha.type === "password";
  inputSenha.type = isPassword ? "text" : "password";

  toggleSenha.setAttribute(
    "data-lucide",
    isPassword ? "eye-off" : "eye"
  );

  lucide.createIcons();
}

const form = document.querySelector('#formLogar');
form.addEventListener('submit', async function (event) {
  event.preventDefault();
  const formData = new FormData(form);
  const erro = document.getElementById('erro');

  const dados = Object.fromEntries(formData);

  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: dados.email, senha: dados.senha })
    });

    if (response.ok) {
      const user = await response.json();
      // Buscar dados completos do usuário para o localStorage
      const fullResponse = await fetch(`http://localhost:3000/users/${user.id}`);
      const fullUser = await fullResponse.json();

      localStorage.setItem('user', JSON.stringify(fullUser));

      if (fullUser.nivel === "Usuário") {
        window.location.href = '/usuario/usuario.html';
      }

      if (fullUser.nivel === "Administrador") {
        window.location.href = '/administrador/adm.html';
      }
    } else {
      erro.style.display = 'block';
      erro.textContent = 'Email ou senha inválidos';
    }

  } catch (error) {
    console.error(error);
    erro.style.display = 'block';
    erro.textContent = 'Erro ao conectar com o servidor';
  }
});

// ========================
// ESQUECI MINHA SENHA
// ========================
function abrirModalEsqueciSenha() {
  document.getElementById('modalEsqueciSenha').classList.add('ativo');
  lucide.createIcons();
}

function fecharModalEsqueciSenha() {
  document.getElementById('modalEsqueciSenha').classList.remove('ativo');
  document.getElementById('formEsqueciSenha').reset();
  document.getElementById('erroRecuperar').style.display = 'none';
  document.getElementById('sucessoRecuperar').style.display = 'none';
}

const formEsqueciSenha = document.getElementById('formEsqueciSenha');
formEsqueciSenha.addEventListener('submit', async function (event) {
  event.preventDefault();

  const email = document.getElementById('emailRecuperar').value;
  const novaSenha = document.getElementById('novaSenha').value;
  const confirmarSenha = document.getElementById('confirmarSenha').value;
  const erroEl = document.getElementById('erroRecuperar');
  const sucessoEl = document.getElementById('sucessoRecuperar');

  erroEl.style.display = 'none';
  sucessoEl.style.display = 'none';

  if (novaSenha !== confirmarSenha) {
    erroEl.style.display = 'block';
    erroEl.textContent = 'As senhas não coincidem';
    return;
  }

  if (novaSenha.length < 6) {
    erroEl.style.display = 'block';
    erroEl.textContent = 'A senha deve ter pelo menos 6 caracteres';
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, novaSenha })
    });

    if (response.ok) {
      sucessoEl.style.display = 'block';
      sucessoEl.textContent = 'Senha alterada com sucesso!';
      setTimeout(() => fecharModalEsqueciSenha(), 2000);
    } else {
      const data = await response.json();
      erroEl.style.display = 'block';
      erroEl.textContent = data.error || 'Erro ao alterar senha';
    }
  } catch (error) {
    erroEl.style.display = 'block';
    erroEl.textContent = 'Erro ao conectar com o servidor';
  }
});