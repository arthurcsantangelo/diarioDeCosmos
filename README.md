# Diário de Cosmos

Aplicação web para consultar a Astronomy Picture of the Day (APOD) da NASA,
com uma galeria dos 7 registros mais recentes, suporte a imagens e vídeos e
consulta por data.

## Requisitos

- Node.js 18 ou superior
- Uma chave da API NASA

## Como executar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie ou edite o arquivo `.env` na raiz do projeto e configure a chave:

   ```env
   NASA_API_KEY=sua_chave_da_nasa
   ```

3. Inicie o servidor:

   ```bash
   npm start
   ```

4. Abra [http://localhost:3000](http://localhost:3000).

Durante o desenvolvimento, use `npm run dev` para reiniciar o servidor quando
os arquivos do backend forem alterados.

## Estrutura

- `frontend/`: página, estilos e interações do navegador.
- `backend/routes/`: rotas HTTP da aplicação.
- `backend/controllers/`: validação de entrada e respostas HTTP.
- `backend/services/`: comunicação com a API NASA APOD.

A chave `NASA_API_KEY` é usada somente no backend. O arquivo `.env` não deve
ser enviado ao GitHub.