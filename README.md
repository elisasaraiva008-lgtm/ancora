# ÂNCORA

Plataforma de saúde mental masculina — agendamento gratuito de atendimentos com psicólogas, enfermeiras e assistentes sociais, sem julgamento e sem burocracia.

> Projeto acadêmico/protótipo. Front-end puro (HTML, CSS e JavaScript), sem back-end — os dados de cadastro e agendamento são salvos no `localStorage` do navegador, não em um servidor.

🔗 Deploy: _adicione aqui o link do Netlify_

## Funcionalidades

- **Início** (`index.html`) — apresentação da plataforma e dos serviços oferecidos.
- **Cadastro** (`cadastro.html` / `cadastro.js`) — criação de conta com validação de CPF (dígito verificador), busca de endereço por CEP (API ViaCEP), força de senha e opção de manter identidade anônima para o profissional.
- **Login** (`login.html` / `login.js`) — autenticação por CPF e senha.
- **Profissionais** (`profissionais.html` / `profissionais.js`) — lista de profissionais disponíveis, com filtro por especialidade.
- **Agendar** (`agendar.html` / `agendar.js`) — agendamento de atendimento (Presencial, Vídeo ou Telefone), com validação de data (até 1 ano à frente) e campos condicionais de contato.
- **Navegação** (`nav.js`) — controla o menu conforme o usuário está logado ou não.
- **Utilitários** (`utils.js`) — funções compartilhadas (máscara e validação de CPF, mostrar/ocultar senha).

## Estrutura

```
.
├── index.html / index.js
├── cadastro.html / cadastro.js
├── login.html / login.js
├── profissionais.html / profissionais.js
├── agendar.html / agendar.js
├── nav.js
├── utils.js
└── estilo.css
```

## Como rodar localmente

Como é um site estático, basta abrir o `index.html` no navegador, ou servir a pasta com qualquer servidor local, por exemplo:

```bash
npx serve .
```

## Aviso importante

Este projeto guarda os dados (incluindo a senha) em texto puro no `localStorage` do navegador, sem criptografia — adequado para fins de demonstração/acadêmicos, mas **não deve ser usado com dados reais de usuários** nem é seguro para produção.
