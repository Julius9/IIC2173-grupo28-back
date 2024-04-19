// src/app.js

const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const authRoutes = require('./authRoutes');
const errorHandler = require('./errorHandler'); // Asegúrate de crear este middleware


dotenv.config(); // Carga las variables de entorno de .env

const app = express();

// Middleware para parsear el cuerpo de las solicitudes JSON
app.use(bodyParser.json());

// Middleware para rutas de autenticación
app.use('/api/auth', authRoutes);

// Middleware de manejo de errores, captura cualquier error lanzado en las rutas
app.use(errorHandler);

// Definir el puerto del servidor
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


module.exports = app;
