const Queue = require('bull');
const express = require('express');
const authenticateToken = require('./authenticateToken');
const dotenv = require('dotenv');
var cors = require('cors');

dotenv.config(); // Carga las variables de entorno de .env


// Configuración de la aplicación
// enable cors:
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Headers', 'Origin','Accept', 'X-Requested-With', 'Content-Type', 'Access-Control-Request-Method', 'Access-Control-Request-Headers', 'Auth'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};


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
app.use(cors(corsOptions));
const port = process.env.MASTER_PORT || 4004;


// Endpoint para crear trabajos
app.post('/job', authenticateToken, async (req, res) => {
  try {
    const jobData = req.body;
    jobData.userId = req.user.id
    
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


// Endpoint para obtener el ultimo trabajo asociado a un usuario
app.get('/latest', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const jobs = await recommendationQueue.getJobs(['completed']);
    const latestJob = jobs
      .filter(job => job.data.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    if (latestJob) {
      res.status(200).json({
        id: latestJob.id,
        state: await latestJob.getState(),
        data: latestJob.data,
        result: latestJob.returnvalue,
        completedAt: new Date(latestJob.finishedOn).toISOString()
      });
    } else {
      res.status(404).json({ message: 'No jobs found for this user' });
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


module.exports = app;