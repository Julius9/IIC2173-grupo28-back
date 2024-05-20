const Queue = require('bull');
// require('dotenv').config();  // Asegúrate de cargar las variables de entorno


// Configuración de la conexión Redis
const redisConfig = {
    host: 'redis-15522.c250.eu-central-1-1.ec2.redns.redis-cloud.com',
    port: 15522,
    password: 'OjeviBhBEGER0Nenbv8joBsVw5BBx2cR',
  };

// Crear una cola de Bull
const recommendationQueue = new Queue('flight-recommendation', { redis: redisConfig });

// Función para simular el procesamiento de trabajos
const processJob = async (job) => {
    console.log(`Processing job ${job.id} with data:`, job.data);
    // Simulación de procesamiento (dummy test)
    await new Promise(resolve => setTimeout(resolve, 5000));  // Simula un procesamiento de 5 segundos
    console.log(`Job ${job.id} processed`);
    return { success: true, message: 'Processed successfully' };
  };
  
  // Configurar el worker para procesar trabajos de la cola
recommendationQueue.process(async (job) => {
    try {
      const result = await processJob(job);
      return result;
    } catch (error) {
      console.error('Error processing job:', error);
      throw error;  // Permite que Bull maneje el reintento del trabajo si falla
    }
  });

// escribe la inicializacion en la consola 
console.log('Worker configured and ready to process jobs');



