
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