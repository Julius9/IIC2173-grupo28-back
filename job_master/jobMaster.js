const Queue = require('bull');
// require('dotenv').config();

// Configuración de la conexión Redis
const redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD || null,
};

// Crear una cola de Bull
const flightRecommendationQueue = new Queue('flight-recommendation', { redis: redisConfig });

// Manejar eventos de la cola (opcional)
flightRecommendationQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result: ${result}`);
});

flightRecommendationQueue.on('failed', (job, err) => {
  console.log(`Job ${job.id} failed with error: ${err.message}`);
});

console.log('Job Master configured and ready to handle jobs');
