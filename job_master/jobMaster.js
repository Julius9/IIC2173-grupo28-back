const Queue = require('bull');
const express = require('express');
// require('dotenv').config();

// Configuración de la conexión Redis
const redisConfig = {
    host: 'redis-15522.c250.eu-central-1-1.ec2.redns.redis-cloud.com',
    port: 15522,
    password: 'OjeviBhBEGER0Nenbv8joBsVw5BBx2cR',
  };

// Crear una cola de Bull
const recommendationQueue = new Queue('flight-recommendation', { redis: redisConfig });

// Manejar eventos de la cola (opcional)
recommendationQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result: ${result}`);
});

recommendationQueue.on('failed', (job, err) => {
  console.log(`Job ${job.id} failed with error: ${err.message}`);
});

// Se indica que ya esta disponible
console.log('Job Master configured and ready to handle jobs');


// Función para añadir trabajos a la cola
async function addJobToQueue(jobData) {
    try {
      const job = await recommendationQueue.add(jobData);
      console.log(`Job ${job.id} added to the queue`);
    } catch (error) {
      console.error('Error adding job to the queue:', error);
    }
}


// Prueba para saber que todo esta Okey!
addJobToQueue({ flightId: '12345', userId: 'user1' });


// PARTE 2: servicio de aplicacion
const app = express();
app.use(express.json()); // Para manejar solicitudes JSON

const port = 4004;

// Endpoint para crear trabajos
app.post('/job', async (req, res) => {
    try {
      const jobData = req.body;
      const jobId = await addJobToQueue(jobData);
      res.status(200).json({ id: jobId, message: 'Job created successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Endpoint para obtener el estado de un trabajo
app.get('/job/:id', async (req, res) => {
    try {
      const job = await recommendationQueue.getJob(req.params.id);
      if (job) {
        res.status(200).json({
          id: job.id,
          state: await job.getState(),
          data: job.data,
          result: job.returnvalue,
        });
      } else {
        res.status(404).json({ message: 'Job not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


// Endpoint de heartbeat para verificar si el servicio está operativo
app.get('/heartbeat', (req, res) => {
    res.status(200).json({ operational: true });
  });


// Nos ponemos a escuchar
app.listen(port, () => {
    console.log(`Job Master running on port ${port}`);
  });