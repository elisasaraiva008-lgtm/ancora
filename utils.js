// ============================================================
// ÂNCORA — utils.js
// Funções utilitárias COMPARTILHADAS entre todas as páginas.
//
// POR QUE EXISTE ESTE ARQUIVO?
// Sem ele, funções como verSenha() e validarCPF() precisariam
// ser copiadas dentro de cada .js que as usa (login.js,
// cadastro.js…). Isso viola o princípio DRY — Don't Repeat
// Yourself. Com um único arquivo:
//   • Uma correção de bug beneficia todas as páginas de uma vez.
//   • O navegador cacheia o arquivo; páginas subsequentes não
//     precisam baixá-lo novamente.
//
// ORDEM DE CARREGAMENTO NO HTML (OBRIGATÓRIA):
//   <script src="utils.js"></script>   ← primeiro
//   <script src="cadastro.js"></script> ← depois
//   <script src="login.js"></script>    ← idem
//
// Se a ordem for invertida, o navegador lançará ReferenceError
// porque as funções ainda não existem quando o outro script roda.
// ============================================================


// ------------------------------------------------------------
// verSenha(id, btn)
// Alterna o tipo do campo de senha entre 'password' e 'text'.
//
// Parâmetros:
//   id  — string com o id do <input type="password"> alvo
//   btn — referência ao <button> clicado (via 'this' no onclick)
//
// campo.type === 'password' → estava oculto → vamos mostrar
// btn.style.color: teal quando visível, padrão quando oculto
// ------------------------------------------------------------
function verSenha(id, btn) {
  const campo = document.getElementById(id);
  const visivel = campo.type === 'password';
  campo.type = visivel ? 'text' : 'password';
  btn.style.color = visivel ? 'var(--teal-l)' : '';
}


// ------------------------------------------------------------
// aplicarMascaraCPF(el)
// Formata o CPF enquanto o usuário digita: 000.000.000-00
//
// Lógica a cada evento 'input':
//  1. Remove não-dígitos com /\D/g, limita a 11 chars
//  2. Insere ponto após o 3.º dígito
//  3. Insere ponto após o 6.º dígito (roda na string já modificada)
//  4. Insere traço antes dos 2 dígitos verificadores
//
// Por que 3 replace encadeados em vez de 1 regex única?
//   Regex única para CPF fica ilegível e frágil. Três
//   substituições são mais fáceis de ler e depurar.
// ------------------------------------------------------------
function aplicarMascaraCPF(el) {
  el.addEventListener('input', () => {
    let v = el.value.replace(/\D/g, '').slice(0, 11);
    v = v
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    el.value = v;
  });
}


// ------------------------------------------------------------
// validarCPF(cpf)
// Valida CPF pelo algoritmo oficial da Receita Federal.
// Retorna true se válido, false caso contrário.
//
// 5 etapas:
//  1. Normalização: remove pontos e traços
//  2. Tamanho: precisa ter exatamente 11 dígitos
//  3. Sequências iguais: 111.111.111-11 passaria no cálculo
//     mas é inválido. /^(\d)\1{10}$/ rejeita todas.
//  4. Primeiro dígito verificador (posição 9):
//     pesos 10→2, d1 = 11 − (soma mod 11), se ≥10 → d1=0
//  5. Segundo dígito verificador (posição 10):
//     pesos 11→2, mesmo cálculo
//
//  Valida estrutura — não garante existência na base da Receita.
// ------------------------------------------------------------
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
  let d1 = 11 - (soma % 11);
  if (d1 >= 10) d1 = 0;
  if (d1 !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
  let d2 = 11 - (soma % 11);
  if (d2 >= 10) d2 = 0;
  if (d2 !== parseInt(cpf[10])) return false;

  return true;
}