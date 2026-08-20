// ============================================================
// ÂNCORA — nav.js
// Controle de estado da navegação — carregado em TODAS as páginas.
//
// RESPONSABILIDADE ÚNICA:
//   Ler o estado de sessão do localStorage e ajustar a barra
//   de navegação — sem recarregar, sem servidor.
//
// POR QUE IIFE — (function(){ ... })() ?
//   Cria escopo privado: variáveis declaradas aqui não vazam
//   para window, evitando colisões com outros scripts.
//
// DEPENDÊNCIAS:
//   • localStorage.logado — 'true' quando logado
//   • IDs no HTML: #nav-login, #nav-cadastro
//   • Classe CSS: .nav-prot / .bloqueado
// ============================================================

(function () {

  // localStorage armazena strings — compara com 'true', não true
  const logado = localStorage.getItem('logado') === 'true';

  const navLogin    = document.getElementById('nav-login');
  const navCadastro = document.getElementById('nav-cadastro');

  if (logado) {

    // Esconde "Cadastro": usuário já tem conta
    if (navCadastro) navCadastro.style.display = 'none';

    // Transforma "Login" em "Sair"
    if (navLogin) {
      navLogin.textContent = 'Sair';
      navLogin.href = '#';
      navLogin.onclick = function (e) {
        e.preventDefault(); // cancela navegação padrão do <a>
        // Remove sessão; mantém 'usuario' para não apagar o cadastro
        localStorage.removeItem('logado');
        window.location.href = 'index.html';
      };
    }

    // Libera links protegidos (Profissionais, Agendar)
    document.querySelectorAll('.nav-prot').forEach(a => {
      a.classList.remove('bloqueado');
    });

  } else {

    // Visitante: bloqueia links protegidos via CSS
    // .bloqueado = pointer-events:none + opacity reduzida
    // Proteção de UI apenas — páginas protegidas têm redirect próprio
    document.querySelectorAll('.nav-prot').forEach(a => {
      a.classList.add('bloqueado');
    });
  }

})();