const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'database', // Este es el nombre del servicio en el archivo docker-compose.yml
    database: 'flights',
    password: 'postgres',
    port: 5432,
});

client.connect()
    .then(() => console.log('Conectado a la base de datos'))
    .catch(err => console.error('Error de conexión a la base de datos:', err));
