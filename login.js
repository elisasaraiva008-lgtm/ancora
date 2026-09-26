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
// LISTA FIXA DE COLABORADORES (protótipo)
// Cada colaborador tem CPF, senha e função. Quem logar com um
// destes é tratado como colaborador e enviado à Área do Colaborador.
//
// POR QUE UMA LISTA AQUI?
//   O cadastro comum (cadastro.html) só cria usuários normais.
//   Colaboradores não se cadastram sozinhos — são pessoas da
//   equipe. Neste protótipo front-end, mantemos a lista fixa.
//   No sistema real (back-end), isso seria uma TABELA de
//   colaboradores no banco de dados, não uma lista no código.
//
// É um array de objetos — a mesma ideia de "linhas de uma tabela":
// cada objeto é uma linha, cada propriedade é uma coluna.
// ------------------------------------------------------------
const colaboradores = [
  { cpf: '111.111.111-11', senha: '123456', funcao: 'Psicólogo' },
  { cpf: '222.222.222-22', senha: '123456', funcao: 'Enfermeiro' }
];


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
//  2. É colaborador? Procura CPF+senha na lista 'colaboradores'.
//     Se for → grava tipo 'colaborador' e vai para colaborador.html
//  3. Busca 'usuario' no localStorage — abort se não existir
//  4. Parse do JSON (localStorage armazena strings)
//  5. Compara CPF e senha
//  6. Sucesso → grava 'logado'='true', tipo 'usuario' e redireciona
//     Falha   → mensagem vaga (não revela qual campo errou —
//               boa prática de segurança)
//
// Por que 'logado' separado de 'usuario'?
//   Permite checar sessão com uma leitura simples, sem
//   re-parsear o objeto completo em cada página.
//
// Por que gravar 'tipo'?
//   A guarda de colaborador.html lê 'tipo' para decidir quem
//   pode entrar. 'colaborador' abre a área; qualquer outro é
//   redirecionado para o login. É a AUTORIZAÇÃO acontecendo.
// ------------------------------------------------------------
function entrar() {
  const cpf   = document.getElementById('cpf').value;
  const senha = document.getElementById('senha').value;

  // 1º: é colaborador?
  // .find() procura na lista o PRIMEIRO item cujo CPF e senha
  // batem com o que foi digitado. Se achar, devolve o objeto do
  // colaborador; se não, devolve undefined (o if trata como falso).
  const colab = colaboradores.find(c => c.cpf === cpf && c.senha === senha);
  if (colab) {
    localStorage.setItem('logado', 'true');
    localStorage.setItem('tipo', 'colaborador');   // marca o tipo → a guarda do colaborador.html lê isto
    window.location.href = 'colaborador.html';      // "porta dos fundos": área da equipe
    return;                                         // FREIO: para aqui, não checa usuário comum
  }

  // 2º: não é colaborador → segue a lógica de usuário comum.
  const dados = localStorage.getItem('usuario');
  if (!dados) {
    alerta('Nenhum cadastro encontrado. Cadastre-se primeiro.', 'bad');
    return;
  }

  const u = JSON.parse(dados);

  if (u.cpf === cpf && u.senha === senha) {
    localStorage.setItem('logado', 'true');
    localStorage.setItem('tipo', 'usuario');        // usuário comum também ganha um tipo
    window.location.href = 'agendar.html';
  } else {
    alerta('CPF ou senha incorretos.', 'bad');
  }
}


// ------------------------------------------------------------
// Se já estiver logado ao abrir login.html (ex: botão voltar),
// redireciona direto sem mostrar o formulário.
//
// Agora respeita o TIPO: um colaborador logado volta para a
// área dele; um usuário comum volta para o agendamento.
// Sem isso, um colaborador logado cairia em agendar.html por engano.
// ------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('logado') === 'true') {
    const tipo = localStorage.getItem('tipo');
    if (tipo === 'colaborador') {
      window.location.href = 'colaborador.html';
    } else {
      window.location.href = 'agendar.html';
    }
  }
});
