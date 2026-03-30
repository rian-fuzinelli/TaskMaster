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
  console.log(dados);

  try {
    const response = await fetch(
      `http://localhost:3000/users?email=${dados.email}`
    );

    const users = await response.json();

    if (users.length > 0 && users[0].senha === dados.senha) {
      const user = users[0];

      localStorage.setItem('user', JSON.stringify(user));
      console.log(user.nivel)
      
      if (user.nivel === "Usuário") {
        window.location.href = '/usuario/usuario.html';
      }
      
      if (user.nivel === "Administrador") {
        window.location.href = '/administrador/adm.html';
      }

      console.log("Logada!")
    } else {
      erro.style.display = 'block';
      erro.textContent = 'Email ou senha inválidos';
    }

  } catch (error) {
    console.error(error);
    erro.textContent = 'Erro ao conectar com o servidor';
  }
})