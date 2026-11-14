require('dotenv').config();

const express = require('express');
const path = require('node:path');

const app = express();
const port = process.env.PORT || 3000;
const frontendDirectory = path.join(__dirname, '..', 'frontend');

app.use(express.static(frontendDirectory));

app.listen(port, () => {
  console.log(`Diário de Cosmos disponível em http://localhost:${port}`);
});
