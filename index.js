// ============================================================
// ÂNCORA — index.js
// Comportamentos específicos da home (index.html).
//
// RESPONSABILIDADES:
//   • Adaptar CTAs conforme estado de login
//   • Animações de revelação no scroll
// ============================================================


// ============================================================
// BLOCO 1 — CTAs PARA USUÁRIO LOGADO
// ============================================================
// Para usuário autenticado, "Criar cadastro" e "Já tenho conta"
// não fazem sentido — substitui por "Agendar atendimento".
//
// innerHTML com string estática é seguro aqui.
// NUNCA usar innerHTML com dados do usuário sem sanitização — XSS.
(function () {
  if (localStorage.getItem('logado') === 'true') {
    const botaoAgendar = '<a href="agendar.html" class="btn-primary">Agendar atendimento</a>';
    const ctaHero    = document.getElementById('cta-hero');
    const ctaAgendar = document.getElementById('cta-agendar');
    if (ctaHero)    ctaHero.innerHTML    = botaoAgendar;
    if (ctaAgendar) ctaAgendar.innerHTML = botaoAgendar;
  }
})();


// ============================================================
// BLOCO 2 — ANIMAÇÕES DE REVELAÇÃO NO SCROLL
// ============================================================
// IntersectionObserver detecta quando .reveal entra na viewport
// e adiciona .visible, disparando a transição CSS:
//
//   .reveal         { opacity:0; transform:translateY(28px); transition:... }
//   .reveal.visible { opacity:1; transform:translateY(0) }
//
// POR QUE IntersectionObserver E NÃO evento 'scroll'?
//   'scroll' dispara dezenas de vezes por segundo e força
//   reflow com getBoundingClientRect(). IntersectionObserver
//   é assíncrono e roda fora da thread principal — muito mais eficiente.
//
// threshold:0.1 → dispara com 10% do elemento visível.
//
// EFEITO CASCATA (i * 80ms):
//   Vários elementos entrando juntos revelam em sequência.
//   80ms: curto o suficiente para parecer fluido, longo o
//   suficiente para o olho perceber a sequência.
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(
          () => entry.target.classList.add('visible'),
          i * 80
        );
      }
      // Não remove 'visible' ao sair: animação de entrada é uma vez só.
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));