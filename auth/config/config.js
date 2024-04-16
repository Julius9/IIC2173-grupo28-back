// config/config.js

require('dotenv').config(); // Importante para poder usar variables de entorno

module.exports = {
  "development": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASS,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": "postgres", // Especifica que estás utilizando PostgreSQL
    // Utiliza SSL si es necesario, por ejemplo en producción con Heroku

  },
  "test": {
    // Configuraciones para el entorno de prueba
  },
  "production": {
    // Configuraciones para el entorno de producción
    "use_env_variable": "DATABASE_URL" // A menudo usado en entornos de producción como Heroku
  }
};
