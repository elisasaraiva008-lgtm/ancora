// ============================================================
// ÂNCORA — login.js
// Controla toda a lógica da página de login (login.html).
//
// DEPENDÊNCIAS (carregadas ANTES no HTML):
//   • utils.js — verSenha(), aplicarMascaraCPF()
//   • nav.js   — já ajustou a nav antes deste script rodar
//
// MODELO DE AUTENTICAÇÃO:
//   Protótipo: compara CPF e senha diretamente com o objeto
//   no localStorage. Em produção, senhas devem ser hasheadas
//   no servidor — nunca armazenadas em texto puro no cliente.
// ============================================================


// Aplica máscara 000.000.000-00 enquanto digita
// aplicarMascaraCPF() vem de utils.js
const cpfEl = document.getElementById('cpf');
aplicarMascaraCPF(cpfEl);


// Permite enviar com Enter em qualquer campo
['cpf', 'senha'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') entrar();
  });
});


// ------------------------------------------------------------
// alerta(txt, tipo)
// Exibe feedback no banner acima do formulário.
// tipo: 'ok' (verde) ou 'bad' (vermelho) — classes de estilo.css
// ------------------------------------------------------------
function alerta(txt, tipo) {
  const a = document.getElementById('alert');
  a.className = 'alert ' + tipo;
  a.textContent = txt;
}


// ------------------------------------------------------------
// entrar()
// Lê os campos, busca o cadastro no localStorage e decide
// se o login é bem-sucedido.
//
// Fluxo:
//  1. Lê CPF e senha digitados
//  2. Busca 'usuario' no localStorage — abort se não existir
//  3. Parse do JSON (localStorage armazena strings)
//  4. Compara CPF e senha
//  5. Sucesso → grava 'logado'='true' e redireciona
//     Falha   → mensagem vaga (não revela qual campo errou —
//               boa prática de segurança)
//
// Por que 'logado' separado de 'usuario'?
//   Permite checar sessão com uma leitura simples, sem
//   re-parsear o objeto completo em cada página.
// ------------------------------------------------------------
function entrar() {
  const cpf   = document.getElementById('cpf').value;
  const senha = document.getElementById('senha').value;

  const dados = localStorage.getItem('usuario');
  if (!dados) {
    alerta('Nenhum cadastro encontrado. Cadastre-se primeiro.', 'bad');
    return;
  }

  const u = JSON.parse(dados);

  if (u.cpf === cpf && u.senha === senha) {
    localStorage.setItem('logado', 'true');
    window.location.href = 'agendar.html';
  } else {
    alerta('CPF ou senha incorretos.', 'bad');
  }
}


// Se já estiver logado ao abrir login.html (ex: botão voltar),
// redireciona direto sem mostrar o formulário
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('logado') === 'true') {
    window.location.href = 'agendar.html';
  }
});