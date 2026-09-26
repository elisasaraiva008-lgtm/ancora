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
//   • IDs no HTML (topo): #nav-login, #nav-cadastro
//   • Itens do menu lateral: .drawer a[href="cadastro.html"] e [href="login.html"]
//   • Classe CSS: .nav-prot / .bloqueado
// ============================================================

(function () {

  // localStorage armazena strings — compara com 'true', não true
  const logado = localStorage.getItem('logado') === 'true';

  // --- Elementos do TOPO (têm id próprio) ---
  const navLogin    = document.getElementById('nav-login');
  const navCadastro = document.getElementById('nav-cadastro');

  // --- Elementos equivalentes dentro do MENU LATERAL (drawer) ---
  // Eles não têm id, então buscamos pelo href. querySelector devolve
  // null se não existir (ex.: numa página sem drawer) — os 'if' abaixo
  // tratam esse caso, então nada quebra.
  const drawerCadastro = document.querySelector('.drawer a[href="cadastro.html"]');
  const drawerLogin    = document.querySelector('.drawer a[href="login.html"]');

  // ------------------------------------------------------------
  // sair(e)
  // Função única de logout, reaproveitada pelos botões "Sair"
  // (o do topo e o do menu lateral). Remove a sessão e o tipo,
  // mas mantém 'usuario' para não apagar o cadastro salvo.
  // ------------------------------------------------------------
  function sair(e) {
    e.preventDefault(); // cancela a navegação padrão do <a>
    localStorage.removeItem('logado');
    localStorage.removeItem('tipo'); // encerra também o tipo (usuario/colaborador)
    window.location.href = 'index.html';
  }

  if (logado) {

    // ===== TOPO =====

    // Esconde "Criar cadastro": usuário já tem conta
    if (navCadastro) navCadastro.style.display = 'none';

    // Transforma "Login" em "Sair"
    if (navLogin) {
      navLogin.textContent = 'Sair';
      navLogin.href = '#';
      navLogin.onclick = sair;
    }

    // ===== MENU LATERAL (drawer) =====

    // Esconde "Cadastro" no menu também
    if (drawerCadastro) drawerCadastro.style.display = 'none';

    // Troca "Login" por "Sair" no menu — PRESERVANDO o ícone SVG.
    // (Se usássemos só textContent, o ícone seria apagado junto;
    //  por isso guardamos o <svg>, trocamos o texto e recolocamos o ícone.)
    if (drawerLogin) {
      const icone = drawerLogin.querySelector('svg'); // guarda o ícone atual
      drawerLogin.textContent = ' Sair';              // limpa e põe o texto novo
      if (icone) drawerLogin.prepend(icone);          // devolve o ícone na frente
      drawerLogin.href = '#';
      drawerLogin.onclick = sair;
    }

    // Libera links protegidos (Profissionais, Agendar), no topo e no drawer
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

  // ------------------------------------------------------------
  // FAIXA DE APOIO (CVV) — rodapé fixo em todas as páginas.
  //
  // Criada aqui (e não escrita em cada HTML) para NÃO repetir o
  // mesmo trecho em 6 arquivos: como o nav.js roda em toda página,
  // basta gerar a faixa uma vez aqui e ela aparece em todas.
  //
  // O número é um link tel:188 — no celular, abre o discador
  // já com o 188. Tom acolhedor, não alarmante.
  // ------------------------------------------------------------
  const cvv = document.createElement('div');
  cvv.className = 'cvv-bar';
  cvv.innerHTML =
    '<svg class="cvv-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M20 4H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3v4l5-4h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>' +
    '<path d="M12 13.4 9.6 11c-.8-.8-.5-2.1.6-2.4.6-.1 1.3.1 1.8.7.5-.6 1.2-.8 1.8-.7 1.1.3 1.4 1.6.6 2.4L12 13.4z"/>' +
    '</svg>' +
    '<span>Precisa conversar agora? Ligue <a href="tel:188">188</a> — CVV, 24h, gratuito e sigiloso.</span>';
  document.body.appendChild(cvv);

})();
