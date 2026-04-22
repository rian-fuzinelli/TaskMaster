# 📝 Sistema de Gerenciamento de Tarefas

Este projeto é uma aplicação web simples de gerenciamento de tarefas, desenvolvida com **JavaScript puro**, utilizando o **json-server (db.json)** como base de dados fake e hospedada na **Vercel**.
Para a segunda parte do projeto, asseguramos que teremos uma API real e um banco de dados completo.

## 🚀 Funcionalidades

A aplicação possui três principais áreas:

### 🔐 Tela de Login

* Autenticação via **e-mail e senha**
* Diferenciação de acesso entre **usuário comum** e **administrador**

---

### 👤 Área do Usuário

O usuário comum possui acesso restrito às suas próprias tarefas:

* 📋 Visualizar tarefas atribuídas a ele
* ➕ Criar novas tarefas (somente para si mesmo)
* 🔄 Atualizar o status das suas tarefas

---

### 🛠️ Área do Administrador

O Administrador possui controle total do sistema, com acesso a três abas principais:

#### 📌 Lista de Tarefas

* Visualização de todas as tarefas
* Identificação de qual usuário cada tarefa está atribuída

#### 👥 Usuários

* Visualização de todos os usuários cadastrados

#### ✅ Minhas Tarefas

* Acesso às tarefas atribuídas ao próprio administrador

---

## 🔒 Regras de Negócio

* Apenas o **administrador** pode:

  * Criar novos usuários
  * Atribuir tarefas para outros usuários

* O **usuário comum**:

  * Só pode criar tarefas para si mesmo
  * Só pode alterar o status das suas próprias tarefas

---

## 🧪 Tecnologias Utilizadas

* HTML5
* CSS3
* JavaScript (Vanilla JS)
* json-server (fake API com `db.json`)
* Vercel (deploy)

---

## ⚙️ Como Executar o Projeto Localmente

### 1. Clone o repositório

```bash
git clone https://github.com/ingridfreitas/TaskMaster.git
```

### 2. Instale o json-server

```bash
npm install -g json-server
```

### 3. Inicie a API fake

```bash
json-server --watch db.json --port 3000
```

### 4. Execute o projeto

Abra o arquivo `index.html` no navegador
ou utilize uma extensão como **Live Server**

---

## 🌐 Deploy

O projeto está configurado para deploy na **Vercel**.

Pode realizar os testes nesse link aqui:
[task-master.vercel.app/](https://task-master-six-rho.vercel.app/)

Lembrando que para o site funcionar, o `json-server db.json` deverá estar rodando localmente.

---

## 🔑 Credenciais para Teste

### 👤 Usuário Comum

* **E-mail:** [lara@unisagrado.com](mailto:lara@unisagrado.com)
* **Senha:** Lara@123

### 🛠️ Administrador

* **E-mail:** [iindyh@unisagrado.com](mailto:iindyh@unisagrado.com)
* **Senha:** Indy@123

---

## 📁 Estrutura do Projeto

```
📦 projeto
 ┣ 📂 administrador
 ┣ 📂 usuario
 ┣ 📂 tarefa
 ┣ 📄 index.html
 ┣ 📄 style.css
 ┣ 📄 login.css
 ┣ 📄 login.js
 ┣ 📄 db.json
 ┗ 📄 README.md
```

---

## 💡 Observações

* Este projeto utiliza uma API fake (`json-server`) (Olá Rafael!), portanto não é recomendado para produção sem backend real.
* Feito para fins de estudo e prototipação.

---

## ✨ Melhorias Futuras

* Criar backend real (Java + banco de dados)
* Melhorar UX/UI
* Adicionar filtros e busca de tarefas

---

## 💻 Responsáveis pelo Projeto:

* ANDRÉ AZENHA NANNI
* GEOVANA MOREIRA DE OLIVEIRA
* INGRID HELOISE DOS SANTOS FREITAS
* KELVIN KLEYN SANTOS GRECIA
* LARA FERNANDA CRUZ DE LIMA
* LETICIA ISABELA DE OLIVEIRA
* RAFAEL CHUN LIN CHEN
* RIAN CAIO FUZINELLI
* SARA VILA REAL DA SILVA
* VITOR HUGO CASALE DE FREITAS
