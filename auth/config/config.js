const Sequelize = require('sequelize');

require('dotenv').config(); // Importante para poder usar variables de entorno

const env = process.env.NODE_ENV || 'development'; // Usa 'development' como predeterminado si NODE_ENV no está seteado
const config = {
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: 'postgres',
    },
    test: {
        // Configuración para el entorno de pruebas
    },
    production: {
        use_env_variable: 'DATABASE_URL',
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    }
}[env];

let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

module.exports = sequelize;
