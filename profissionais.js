// ============================================================
// ÂNCORA — profissionais.js
// Controla a página de listagem de profissionais.
//
// RESPONSABILIDADES:
//   • Proteção de rota: redireciona visitantes não logados
//   • Filtro por categoria dos cards
// ============================================================


// ============================================================
// BLOCO 1 — PROTEÇÃO DE ROTA
// ============================================================
// Dupla proteção:
//   1. nav.js: pointer-events:none nos links (só UI)
//   2. Esta IIFE: bloqueia acesso mesmo via URL direta
(function () {
  if (localStorage.getItem('logado') !== 'true') {
    document.documentElement.style.visibility = 'hidden';
    alert('Você precisa estar logado para acessar esta página.');
    window.location.href = 'login.html';
  }
})();


// ============================================================
// BLOCO 2 — FILTRO POR ESPECIALIDADE
// ============================================================

// ------------------------------------------------------------
// filtrar(cat, btn)
// Mostra apenas os cards da categoria escolhida.
//
// Parâmetros:
//   cat — 'todos', 'psicologia', 'enfermagem' ou 'social'
//   btn — <button> clicado (passado via 'this')
//
// data-cat nos cards:
//   psicologia → Levi Costa, Joyce Kelly
//   enfermagem → Elisa Saraiva, Vinícius Nogueira
//   social     → Allice Coutinho, Matheus Souza
//
// Por que display:'block' direto?
//   Estilo base do .card já é block via .grid.
//   Alterar inline é direto e não depende de cascata de classes.
// ------------------------------------------------------------
function filtrar(cat, btn) {
  document.querySelectorAll('.filtro').forEach(f => f.classList.remove('ativo'));
  btn.classList.add('ativo');

  document.querySelectorAll('.card').forEach(card => {
    const visivel = (cat === 'todos' || card.dataset.cat === cat);
    card.style.display = visivel ? 'block' : 'none';
  });
}