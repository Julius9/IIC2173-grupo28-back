const Queue = require('bull');
const express = require('express');
// require('dotenv').config();

// Configuración de la conexión Redis
const redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASS,
};

// Crear una cola de Bull
const recommendationQueue = new Queue('flight-recommendation', { redis: redisConfig });

// Manejar eventos de la cola
recommendationQueue.on('completed', job => {
  console.log(`El trabajo con id: ${job.id}, ha sido completado`);
})

// recommendationQueue.on('failed', (job, err) => {
//   console.log(`Job ${job.id} failed with error: ${err.message}`);
// });

// Se indica que ya está disponible
console.log('Job Master configurado y listo para recibir trabajos');

// Función para añadir trabajos a la cola
async function addJobToQueue(jobData) {
  try {
    const job = await recommendationQueue.add(jobData);
    console.log(`Trabajo con id: ${job.id} agregado a la cola`);
    return job.id;
  } catch (error) {
    console.error('Error adding job to the queue:', error);
  }
}

// PARTE 2: servicio de aplicación
const app = express();
app.use(express.json()); // Para manejar solicitudes JSON

const port = process.env.MASTER_PORT || 4004;

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
