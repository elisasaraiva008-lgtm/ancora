// ============================================================
// ÂNCORA — cadastro.js
// Controla toda a lógica da página de cadastro (cadastro.html).
//
// DEPENDÊNCIAS (carregadas ANTES no HTML):
//   • utils.js — verSenha(), aplicarMascaraCPF(), validarCPF()
//   • nav.js   — já ajustou a navegação
//
// RESPONSABILIDADES:
//   • Máscaras de CPF e CEP
//   • Busca de endereço via API ViaCEP
//   • Indicador de força de senha em tempo real
//   • Confirmação de senha em tempo real
//   • Salvar / carregar / remover cadastro no localStorage
//   • Modal de confirmação antes de remover
//
// ARMAZENAMENTO — chave 'usuario' no localStorage:
//   { nome, cpf, cep, endereco, bairro, cidade, uf,
//     numero, complemento, anonimo, senha }
//   Senha em texto puro — aceitável apenas para prototipagem.
// ============================================================


// ============================================================
// SEÇÃO 1 — MÁSCARAS
// ============================================================

const cpfEl = document.getElementById('cpf');
aplicarMascaraCPF(cpfEl); // vem de utils.js

// Máscara do CEP: 00000-000
const cepEl = document.getElementById('cep');
cepEl.addEventListener('input', () => {
  let v = cepEl.value.replace(/\D/g, '').slice(0, 8);
  v = v.replace(/(\d{5})(\d)/, '$1-$2');
  cepEl.value = v;
});


// ============================================================
// SEÇÃO 2 — FEEDBACK DO CPF (ao sair do campo)
// ============================================================
// 'blur' dispara quando o campo perde o foco.
// Validamos só então — não a cada tecla — para não frustrar
// o usuário que ainda não terminou de digitar.
cpfEl.addEventListener('blur', () => {
  const m = document.getElementById('msg-cpf');
  if (cpfEl.value === '') { cpfEl.className = ''; m.textContent = ''; return; }
  if (validarCPF(cpfEl.value)) {
    cpfEl.className = 'ok';  // borda verde (.fg input.ok)
    m.className = 'msg s';   // texto verde (.msg.s)
    m.textContent = 'CPF válido';
  } else {
    cpfEl.className = 'err'; // borda vermelha
    m.className = 'msg e';   // texto vermelho
    m.textContent = 'CPF inválido';
  }
});


// ============================================================
// SEÇÃO 3 — BUSCA DE CEP (API ViaCEP)
// ============================================================
// Também no 'blur': busca só quando o usuário sai do campo,
// evitando requisições para CEPs incompletos.
//
// API: https://viacep.com.br/ws/{CEP}/json/
//   Retorna: { logradouro, bairro, localidade, uf, erro? }
//   CEP inexistente retorna { "erro": true }
//
// async/await torna o fluxo assíncrono legível como síncrono.
cepEl.addEventListener('blur', async () => {
  const cep = cepEl.value.replace(/\D/g, '');
  const m   = document.getElementById('msg-cep');

  if (cep.length !== 8) {
    m.className = 'msg e';
    m.textContent = 'CEP deve ter 8 dígitos';
    return;
  }

  m.className = 'msg';
  m.textContent = 'Buscando...';

  try {
    const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await resp.json();

    if (data.erro) {
      m.className = 'msg e';
      m.textContent = 'CEP não encontrado';
      return;
    }

    // || '' garante string vazia se a API não retornar o campo
    document.getElementById('endereco').value = data.logradouro || '';
    document.getElementById('bairro').value   = data.bairro     || '';
    document.getElementById('cidade').value   = data.localidade || ''; // ViaCEP usa 'localidade' para cidade
    document.getElementById('uf').value       = data.uf         || '';

    cepEl.className = 'ok';
    m.className = 'msg s';
    m.textContent = 'Endereço preenchido';
    document.getElementById('numero').focus(); // foca no próximo campo obrigatório

  } catch (e) {
    // Erros de rede: sem internet, timeout etc.
    m.className = 'msg e';
    m.textContent = 'Erro ao buscar CEP';
  }
});


// ============================================================
// SEÇÃO 4 — SALVAR CADASTRO
// ============================================================

// ------------------------------------------------------------
// salvar()
// Valida os campos e grava 'usuario' no localStorage.
//
// Validações em ordem — cada uma usa 'return' para parar:
//  1. Nome não vazio
//  2. CPF válido pelo algoritmo da Receita
//  3. Senha com ao menos 4 caracteres
//  4. Confirmação idêntica à senha
// ------------------------------------------------------------
function salvar() {
  const nome   = document.getElementById('nome').value.trim();
  const cpf    = document.getElementById('cpf').value;
  const senha  = document.getElementById('senha').value;
  const senha2 = document.getElementById('senha2').value;

  if (!nome)            { erro('Informe o nome.'); return; }
  if (!validarCPF(cpf)) { erro('CPF inválido.'); return; }
  if (senha.length < 4) { erro('A senha deve ter ao menos 4 caracteres.'); return; }
  if (senha !== senha2) { erro('As senhas não conferem.'); return; }

  const usuario = {
    nome,
    cpf,
    cep:         document.getElementById('cep').value,
    endereco:    document.getElementById('endereco').value,
    bairro:      document.getElementById('bairro').value,
    cidade:      document.getElementById('cidade').value,
    uf:          document.getElementById('uf').value,
    numero:      document.getElementById('numero').value,
    complemento: document.getElementById('complemento').value,
    anonimo:     document.getElementById('anonimo').checked, // boolean
    senha // texto puro — só para protótipo
  };

  localStorage.setItem('usuario', JSON.stringify(usuario));

  const alert = document.getElementById('alert');
  alert.className  = 'alert ok';
  alert.textContent = 'Cadastro salvo com sucesso!';

  mostrarSalvo();
}

function erro(txt) {
  const alert = document.getElementById('alert');
  alert.className  = 'alert bad';
  alert.textContent = txt;
}


// ============================================================
// SEÇÃO 5 — LER E EXIBIR CADASTRO SALVO
// ============================================================

// ------------------------------------------------------------
// mostrarSalvo()
// Lê 'usuario' do localStorage e preenche a view de resumo.
// Se não houver dados, mantém o formulário visível.
// Chamada em dois momentos:
//   • DOMContentLoaded: ao abrir a página
//   • Após salvar(): para exibir o resumo recém-gravado
// ------------------------------------------------------------
function mostrarSalvo() {
  const dados = localStorage.getItem('usuario');
  if (!dados) return;

  const u = JSON.parse(dados);
  document.getElementById('s-nome').textContent = u.nome;
  document.getElementById('s-cpf').textContent  = u.cpf;
  document.getElementById('s-end').textContent  = `${u.endereco}, ${u.numero}`;
  document.getElementById('s-cid').textContent  = `${u.cidade} / ${u.uf}`;
  // boolean → texto legível
  document.getElementById('s-priv').textContent =
    u.anonimo ? 'Oculta para o profissional' : 'Visível';

  document.getElementById('form-area').style.display = 'none';
  document.getElementById('saved').style.display     = 'block';
}


// ============================================================
// SEÇÃO 6 — ALTERAR CADASTRO
// ============================================================

// ------------------------------------------------------------
// carregarParaEditar()
// Popula o formulário com os dados existentes.
// Nota: senha NÃO é restaurada — usuário precisa redigitar.
// Intencional: boa prática de segurança.
// ------------------------------------------------------------
function carregarParaEditar() {
  const dados = localStorage.getItem('usuario');
  if (!dados) return;

  const u = JSON.parse(dados);
  document.getElementById('nome').value        = u.nome;
  document.getElementById('cpf').value         = u.cpf;
  document.getElementById('cep').value         = u.cep;
  document.getElementById('endereco').value    = u.endereco;
  document.getElementById('bairro').value      = u.bairro;
  document.getElementById('cidade').value      = u.cidade;
  document.getElementById('uf').value          = u.uf;
  document.getElementById('numero').value      = u.numero;
  document.getElementById('complemento').value = u.complemento;
  document.getElementById('anonimo').checked   = u.anonimo || false;
  // senha omitida intencionalmente

  document.getElementById('saved').style.display    = 'none';
  document.getElementById('form-area').style.display = 'block';
  document.getElementById('alert').className = 'alert';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ============================================================
// SEÇÃO 7 — REMOVER CADASTRO (modal de confirmação)
// ============================================================
// Modal customizado em vez de window.confirm() nativo:
//   • confirm() não pode ser estilizado com CSS
//   • Alguns browsers bloqueiam confirm() em iframes

function remover() {
  document.getElementById('modal-remover').classList.add('open');
}

function fecharModal() {
  document.getElementById('modal-remover').classList.remove('open');
}

function confirmarRemocao() {
  localStorage.removeItem('usuario'); // remove cadastro, mantém sessão

  document.getElementById('saved').style.display = 'none';
  fecharModal();

  ['nome', 'cpf', 'cep', 'endereco', 'bairro', 'cidade',
   'uf', 'numero', 'complemento', 'senha', 'senha2'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('anonimo').checked = false;
  document.getElementById('form-area').style.display = 'block';

  const alert = document.getElementById('alert');
  alert.className  = 'alert bad';
  alert.textContent = 'Cadastro removido.';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ============================================================
// SEÇÃO 8 — FORÇA DA SENHA
// ============================================================

const senhaEl  = document.getElementById('senha');
const senha2El = document.getElementById('senha2');

// ------------------------------------------------------------
// forcaSenha(s)
// Avalia a senha por pontuação acumulada (0–5 pontos):
//  1. Comprimento ≥ 6
//  2. Comprimento ≥ 10 (bônus)
//  3. Tem maiúscula [A-Z]
//  4. Tem dígito [0-9]
//  5. Tem caractere especial
// Apenas informativo — o form só exige ≥ 4 chars para salvar.
// ------------------------------------------------------------
function forcaSenha(s) {
  let pontos = 0;
  if (s.length >= 6)          pontos++;
  if (s.length >= 10)         pontos++;
  if (/[A-Z]/.test(s))        pontos++;
  if (/[0-9]/.test(s))        pontos++;
  if (/[^A-Za-z0-9]/.test(s)) pontos++;

  if (pontos <= 1) return { txt: 'Fraca', cls: 'fraca' };
  if (pontos <= 3) return { txt: 'Média', cls: 'media' };
  return { txt: 'Forte', cls: 'forte' };
}

senhaEl.addEventListener('input', () => {
  const m = document.getElementById('msg-senha');
  if (senhaEl.value === '') { m.textContent = ''; m.className = 'msg'; return; }

  const f = forcaSenha(senhaEl.value);
  m.textContent = 'Senha: ' + f.txt;
  // Classe composta: 'msg forca fraca' | 'msg forca media' | 'msg forca forte'
  m.className = 'msg forca ' + f.cls;

  conferirIgualdade(); // revalida confirmação se já tiver algo
});


// ============================================================
// SEÇÃO 9 — CONFIRMAÇÃO DE SENHA EM TEMPO REAL
// ============================================================

function conferirIgualdade() {
  const m2 = document.getElementById('msg-senha2');
  if (senha2El.value === '') {
    m2.textContent = ''; m2.className = 'msg'; senha2El.className = '';
    return;
  }
  if (senhaEl.value === senha2El.value) {
    m2.textContent = 'As senhas conferem';
    m2.className   = 'msg s';
    senha2El.className = 'ok';
  } else {
    m2.textContent = 'As senhas não conferem';
    m2.className   = 'msg e';
    senha2El.className = 'err';
  }
}

senha2El.addEventListener('input', conferirIgualdade);


// ============================================================
// SEÇÃO 10 — ENVIO COM ENTER
// ============================================================
// Campos readonly excluídos: usuário não interage via teclado.
['nome', 'cpf', 'cep', 'numero', 'complemento', 'senha', 'senha2'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') salvar(); });
});


// ============================================================
// SEÇÃO 11 — INICIALIZAÇÃO
// ============================================================
// Verifica se já existe cadastro ao abrir a página.
// Se sim, pula o formulário e mostra o resumo diretamente.
window.addEventListener('DOMContentLoaded', mostrarSalvo);