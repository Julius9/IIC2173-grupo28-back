// src/app.js

const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const authRoutes = require('./authRoutes');
const errorHandler = require('./errorHandler'); // Asegúrate de crear este middleware
var cors = require('cors');

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Headers', 'Origin','Accept', 'X-Requested-With', 'Content-Type', 'Access-Control-Request-Method', 'Access-Control-Request-Headers', 'Auth'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

dotenv.config(); // Carga las variables de entorno de .env

const app = express();
app.use(cors(corsOptions));

// Middleware para parsear el cuerpo de las solicitudes JSON
app.use(bodyParser.json());

// Middleware para rutas de autenticación
app.use('/api/auth', authRoutes);

// Middleware de manejo de errores, captura cualquier error lanzado en las rutas
app.use(errorHandler);

// Definir el puerto del servidor
const PORT = process.env.PORT || 3003;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


module.exports = app;
