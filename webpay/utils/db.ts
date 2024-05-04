import { Pool } from 'pg';
import dotenv from 'dotenv';

// Carga las variables de entorno
dotenv.config();

// Configuración de la conexión a la base de datos usando un pool de conexiones
const dbConnectionPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'), // Puerto por defecto de PostgreSQL
});

console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_PORT:', process.env.DB_PORT);

// dbConnectionPool.on('connect', () => {
//   console.log('Connected to the PostgreSQL database!');
// });

// Exporta solo el pool de conexiones
export { dbConnectionPool as db };