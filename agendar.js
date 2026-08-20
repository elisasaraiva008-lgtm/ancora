// ============================================================
// ÂNCORA — agendar.js
// Controla toda a lógica da página de agendamento (agendar.html).
//
// RESPONSABILIDADES:
//   • Bloquear acesso a visitantes não logados
//   • Pré-selecionar profissional/especialidade via URL params
//   • Gerenciar seleção de modalidade e campos condicionais
//   • Máscara de telefone
//   • Validação de todos os campos
//   • Gravar agendamento no localStorage
//   • Exibir tela de confirmação com resumo
//   • Resetar formulário para novo agendamento
// ============================================================


// ============================================================
// BLOCO 1 — PROTEÇÃO DE ROTA
// ============================================================
// IIFE no topo: roda antes de qualquer outra coisa.
// visibility:hidden oculta a página instantaneamente.
// Se não logado: mostra alert e redireciona.
// IMPORTANTE: proteção de front-end apenas. Proteção real exige servidor.
(function () {
  if (localStorage.getItem('logado') !== 'true') {
    document.documentElement.style.visibility = 'hidden';
    alert('Você precisa estar logado para acessar esta página.');
    window.location.href = 'login.html';
  }
})();


// Estado da modalidade — escopo do módulo, acessível por todas as funções
let modalidade = '';


// ============================================================
// BLOCO 2 — PRÉ-SELEÇÃO VIA URL PARAMS
// ============================================================
// Link de profissionais.html: agendar.html?esp=Psicologia&prof=Levi+Costa
//
// Por que disabled + dataset.fixo?
//   <select disabled> tem .value inacessível em alguns cenários.
//   dataset.fixo age como valor de backup para agendar() usar.
(function () {
  const params = new URLSearchParams(window.location.search);
  const esp  = params.get('esp');
  const prof = params.get('prof');

  if (esp) {
    const sel = document.getElementById('especialidade');
    sel.value        = esp;
    sel.disabled     = true;
    sel.dataset.fixo = esp;
  }

  if (prof) {
    const aviso = document.getElementById('prof-escolhido');
    if (aviso) {
      aviso.textContent   = 'Agendamento com ' + prof;
      aviso.style.display = 'block';
    }
  }
})();


// ============================================================
// BLOCO 3 — SELEÇÃO DE MODALIDADE
// ============================================================

// ------------------------------------------------------------
// selModal(valor, el)
// Registra a modalidade e abre o campo de contato correto.
//
// Animação via CSS:
//   .tel-wrap        → max-height:0; overflow:hidden
//   .tel-wrap.open   → max-height:120px; transition suave
//
// Limpa campos ao trocar: evita dados de modalidade anterior
// "vazando" para o agendamento seguinte.
// ------------------------------------------------------------
function selModal(valor, el) {
  modalidade = valor;

  document.querySelectorAll('.modal-opt').forEach(o => o.classList.remove('sel'));
  el.classList.add('sel');

  const emailWrap = document.getElementById('email-wrap');
  const telWrap   = document.getElementById('tel-wrap');
  emailWrap.classList.remove('open');
  telWrap.classList.remove('open');

  document.getElementById('email').value    = '';
  document.getElementById('telefone').value = '';

  if (valor === 'Vídeo')    emailWrap.classList.add('open');
  if (valor === 'Telefone') telWrap.classList.add('open');
}


// ============================================================
// BLOCO 4 — MÁSCARA DE TELEFONE
// ============================================================
// Padrão (00) 00000-0000 em 3 ramos:
//   > 6 dígitos → formato completo
//   > 2 dígitos → parcial com DDD
//   > 0 dígitos → só parêntese inicial
// slice(0,11): limita a 11 dígitos (2 DDD + 9 número)
const telEl = document.getElementById('telefone');
telEl.addEventListener('input', () => {
  let v = telEl.value.replace(/\D/g, '').slice(0, 11);
  if (v.length > 6)      v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  else if (v.length > 0) v = v.replace(/(\d{0,2})/, '($1');
  telEl.value = v;
});


// ============================================================
// BLOCO 5 — FUNÇÕES AUXILIARES
// ============================================================

function erro(txt) {
  const a = document.getElementById('alert');
  a.className  = 'alert bad';
  a.textContent = txt;
}

// Valida formato de e-mail — estrutura apenas, não existência
function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ------------------------------------------------------------
// dataValida(str)
// Aceita datas entre hoje e 1 ano à frente.
//
// Por que split('-').map(Number) em vez de new Date(str)?
//   new Date('2024-01-15') interpreta como UTC. Em São Paulo
//   (UTC-3) isso pode resultar no dia anterior no horário local.
//   Construir com (ano, mes-1, dia) usa o fuso local.
// ------------------------------------------------------------
function dataValida(str) {
  if (!str) return false;
  const [ano, mes, dia] = str.split('-').map(Number);
  const escolhida = new Date(ano, mes - 1, dia); // mes-1: Date é 0-indexed
  if (isNaN(escolhida)) return false;

  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const limite = new Date(); limite.setHours(0, 0, 0, 0);
  limite.setFullYear(limite.getFullYear() + 1);

  return escolhida >= hoje && escolhida <= limite;
}


// ============================================================
// BLOCO 6 — CONFIRMAR AGENDAMENTO
// ============================================================

// ------------------------------------------------------------
// agendar()
// Valida, grava e exibe a confirmação.
//
// Validações em ordem:
//  1. Especialidade
//  2. Modalidade selecionada
//  3. E-mail válido (só se Vídeo)
//  4. Telefone mínimo (só se Telefone) — length 14 = "(00) 00000-000"
//  5. Data escolhida e no intervalo
//  6. Horário selecionado
// ------------------------------------------------------------
function agendar() {
  const espEl = document.getElementById('especialidade');
  // Se disabled, usa dataset.fixo como fallback
  const esp   = espEl.disabled ? espEl.dataset.fixo : espEl.value;
  const data  = document.getElementById('data').value;
  const hora  = document.getElementById('horario').value;
  const tel   = document.getElementById('telefone').value;
  const email = document.getElementById('email').value;

  if (!esp)                                          { erro('Selecione a especialidade.'); return; }
  if (!modalidade)                                   { erro('Selecione a modalidade.'); return; }
  if (modalidade === 'Vídeo' && !emailValido(email)) { erro('Informe um e-mail válido.'); return; }
  if (modalidade === 'Telefone' && tel.length < 14)  { erro('Informe um telefone válido.'); return; }
  if (!data)                                         { erro('Escolha a data.'); return; }
  if (!dataValida(data))                             { erro('Escolha uma data entre hoje e o próximo ano.'); return; }
  if (!hora)                                         { erro('Escolha o horário.'); return; }

  const params = new URLSearchParams(window.location.search);
  const prof   = params.get('prof') || '';

  const agendamento = {
    profissional: prof,
    especialidade: esp,
    modalidade,
    email:    modalidade === 'Vídeo'    ? email : '',
    telefone: modalidade === 'Telefone' ? tel   : '',
    data,
    horario: hora
  };

  localStorage.setItem('agendamento', JSON.stringify(agendamento));

  // Preenche o resumo
  if (prof) {
    document.getElementById('r-prof-row').style.display = 'flex';
    document.getElementById('r-prof').textContent       = prof;
  }
  document.getElementById('r-esp').textContent  = esp;
  document.getElementById('r-mod').textContent  = modalidade;
  // Converte YYYY-MM-DD → DD/MM/YYYY (legível em pt-BR)
  document.getElementById('r-data').textContent = data.split('-').reverse().join('/');
  document.getElementById('r-hora').textContent = hora;

  const okMsg = document.getElementById('ok-msg');
  if (modalidade === 'Vídeo') {
    document.getElementById('r-email-row').style.display = 'flex';
    document.getElementById('r-email').textContent       = email;
    okMsg.textContent = 'O link da videochamada será enviado ao seu e-mail antes do atendimento.';
  } else if (modalidade === 'Telefone') {
    document.getElementById('r-tel-row').style.display = 'flex';
    document.getElementById('r-tel').textContent       = tel;
    okMsg.textContent = 'Guarde estas informações. O contato será feito pelo telefone informado.';
  } else {
    okMsg.textContent = 'Anote ou guarde estas informações e leve-as ao seu atendimento na data escolhida.';
  }

  document.getElementById('alert').className        = 'alert';
  document.getElementById('form-area').style.display = 'none';
  document.getElementById('ok').style.display        = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ============================================================
// BLOCO 7 — NOVO AGENDAMENTO
// ============================================================

// ------------------------------------------------------------
// novo()
// Reseta tudo para um segundo agendamento.
//
// Por que liberar o select?
//   Se veio de profissionais.html estava disabled.
//   delete espEl.dataset.fixo evita que agendar() use
//   valor fantasma numa próxima tentativa.
// ------------------------------------------------------------
function novo() {
  const espEl = document.getElementById('especialidade');

  document.getElementById('ok').style.display        = 'none';
  document.getElementById('form-area').style.display = 'block';

  espEl.disabled   = false;
  delete espEl.dataset.fixo;
  espEl.value      = '';

  document.getElementById('data').value     = '';
  document.getElementById('horario').value  = '';
  document.getElementById('telefone').value = '';
  document.getElementById('email').value    = '';

  document.getElementById('r-email-row').style.display = 'none';
  document.getElementById('r-tel-row').style.display   = 'none';
  document.getElementById('r-prof-row').style.display  = 'none';

  const aviso = document.getElementById('prof-escolhido');
  if (aviso) { aviso.style.display = 'none'; aviso.textContent = ''; }

  modalidade = '';
  document.querySelectorAll('.modal-opt').forEach(o => o.classList.remove('sel'));
  document.getElementById('email-wrap').classList.remove('open');
  document.getElementById('tel-wrap').classList.remove('open');
}


// ============================================================
// BLOCO 8 — ENVIO COM ENTER
// ============================================================
['email', 'telefone', 'data'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') agendar(); });
});


// ============================================================
// BLOCO 9 — LIMITES DO CALENDÁRIO
// ============================================================
// Feito em JS porque as datas são relativas a "hoje" —
// não é possível escrever valor fixo no HTML.
// toISOString().split('T')[0] → "2024-01-15"
// .min e .max são só UX — dataValida() faz a validação real.
window.addEventListener('DOMContentLoaded', () => {
  const hoje   = new Date();
  const limite = new Date();
  limite.setFullYear(limite.getFullYear() + 1);

  const dataEl = document.getElementById('data');
  dataEl.min   = hoje.toISOString().split('T')[0];
  dataEl.max   = limite.toISOString().split('T')[0];
});