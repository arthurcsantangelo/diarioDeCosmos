require('dotenv').config();

const express = require('express');
const path = require('node:path');
const apodRoutes = require('./routes/apodRoutes');

const app = express();
const port = process.env.PORT || 3000;
const frontendDirectory = path.join(__dirname, '..', 'frontend');

app.use('/api', (request, response, next) => {
  response.set('Cache-Control', 'no-store');
  next();
});

app.use('/api/apod', apodRoutes);
app.use(express.static(frontendDirectory, {
  setHeaders(response, filePath) {
    if (/\.(html|css|js)$/.test(filePath)) {
      response.set('Cache-Control', 'no-store');
    }
  }
}));

app.use((error, request, response, next) => {
  if (response.headersSent) {
    return next(error);
  }

  const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;

  if (statusCode >= 500) {
    console.error(error.message);
  }

  response.status(statusCode).json({
    error: statusCode === 500 ? 'Ocorreu um erro interno. Tente novamente.' : error.message
  });
});

app.listen(port, () => {
  console.log(`Diário de Cosmos disponível em http://localhost:${port}`);
});
