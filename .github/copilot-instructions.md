
## Tecnologias utilizadas

- HTML, CSS e JavaScript puro no frontend.
- Node.js e Express no backend.
- API NASA APOD para obter os dados.
- `.env` para armazenar a chave da API.
- Não utilizar React, TypeScript, banco de dados ou frameworks CSS.

## Arquitetura do sistema

- O frontend será responsável pela interface e interação com o usuário.
- O backend será responsável pelas requisições à API da NASA.
- O frontend nunca deve acessar diretamente a API da NASA.
- O backend deve possuir uma organização simples e separada por responsabilidades.
- A aplicação deve permitir consultar o APOD do dia e escolher outras datas.
- Deve funcionar com conteúdo do tipo imagem ou vídeo.

## Estilização do frontend

- Utilizar HTML semântico e CSS responsivo.
- A interface deve funcionar em celular e computador.
- O visual deve ter temática espacial, mas permanecer simples e legível.
- Exibir título, data, mídia e explicação do APOD.
- Mostrar mensagens durante o carregamento e quando ocorrerem erros.

## Segurança

- A chave da NASA deve ficar somente no backend.
- Armazenar a chave na variável `NASA_API_KEY`.
- O arquivo `.env` não pode ser enviado ao GitHub.
- O frontend nunca deve receber ou expor a chave da API.
- Validar a data informada pelo usuário e tratar erros da API.

# Registro das Interações com o GitHub Copilot


## Interação 1 — Estrutura do projeto

**O que pedi:**  
Pedi ao Copilot para criar a estrutura inicial do projeto com Node.js e Express.

**O que o Copilot respondeu:**  
Criou o `package.json` e a estrutura inicial de pastas do projeto.
---
## Interação 2 — Backend

**O que pedi:**  
Pedi para criar o servidor Express e preparar a rota para o APOD.

**O que o Copilot respondeu:**  
Criou o servidor e a rota solicitada.
---

## Interação 3 — API da NASA

**O que pedi:**  
Pedi para integrar o backend com a API NASA APOD utilizando a chave armazenada no `.env`.

**O que o Copilot respondeu:**  
Criou o serviço para consultar a API e utilizar a variável `NASA_API_KEY`.
---

## Interação 4 — Frontend

**O que pedi:**  
Pedi para criar a interface para mostrar título, data, imagem ou vídeo e explicação do APOD.

**O que o Copilot respondeu:**  
Criou a interface utilizando HTML, CSS e JavaScript.

**O que alterei:**  
Ajustei o layout e conferi a responsividade.

---

## Interação 5 — Testes e correções

**O que pedi:**  
Pedi para verificar se a aplicação atendia aos requisitos da atividade.

**O que o Copilot respondeu:**  
Analisou o projeto e apontou possíveis melhorias e erros.

**O que alterei:**  
Direcionei o copilot para os problemas encontrados e testei novamente a aplicação.