const http = require('http');
const fs = require('fs');
const path = require('path');
const mqtt = require('mqtt');

// Ruta al archivo de configuración
const configPath = path.resolve(__dirname, './config.json');

// Leer la configuración del archivo
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Conectar al broker MQTT
const client = mqtt.connect({
    host: config.HOST,
    port: config.PORT,
    username: config.USER,
    password: config.PASSWORD
});

// Manejar eventos de conexión
client.on('connect', () => {
    console.log('Conexión establecida con el broker MQTT');
    // Suscribirse al canal de interés
    client.subscribe('flights/info', (err) => {
        if (err) {
            console.error('Error al suscribirse al canal:', err);
        }
    });
});

/* Formato de los datos recibidos:
[
    {
    "flights": [
        {
            "departure_airport": {
                "name": <string>,
                "id": <string>,
                "time": <YYYY-MM-DD hh:mm (en horario chileno)>
            },
            "arrival_airport": {
                "name": <string>,
                "id": <string>,
                "time": <YYYY-MM-DD hh:mm (en horario chileno)>
            },
            "duration": <number>,
            "airplane": <string>,
            "airline": <string>,
            "airline_logo": <string>,
        }
    ],
    "carbon_emissions": { this_flight: <number> | <null> },
    "price": <number>,
    "currency": 'CLP',
    "airlineLogo": <string>
    }
]
*/


// Manejar mensajes recibidos
client.on('message', (topic, message) => {
    const data = JSON.parse(message.toString())[0];
    sendDataToAPI(data);
});

function sendDataToAPI(data) {
    const options = {
        hostname: 'api',
        port: 3000,
        path: '/flights',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Estado de la respuesta: ${res.statusCode}`);
        res.on('data', (d) => {
            process.stdout.write(d);
        });
    });

    req.on('error', (error) => {
        console.error('Error al enviar datos al servidor:', error);
    });

    req.write(JSON.stringify(data));
    req.end();
}










/*
// Conectar a la base de datos
const dbClient = new Client({
    user: config.DB_USER,
    host: config.DB_HOST,
    database: config.DB_NAME,
    password: String(config.DB_PASSWORD),
    port: config.DB_PORT,
  });

dbClient.connect();

  

// Conectar al broker MQTT
const client = mqtt.connect({
    host: config.HOST,
    port: config.PORT,
    username: config.USER,
    password: config.PASSWORD
});

// Manejar eventos de conexión
client.on('connect', () => {
    console.log('Conexión establecida con el broker MQTT');
    // Suscribirse al canal de interés
    client.subscribe('flights/info', (err) => {
        if (err) {
            console.error('Error al suscribirse al canal:', err);
        }
    });
});

// Manejar mensajes recibidos
client.on('message', async (topic, message) => {
    console.log('Mensaje recibido:', message.toString());
    
    try {
        const data = JSON.parse(message.toString())[0]; // Parsear el objeto JSON directamente
        const flights = data.flights; // Acceder al array de vuelos
        
        // Iterar sobre cada vuelo y extraer los datos relevantes
        for (const flight of flights) {
            const departureAirport = flight.departure_airport;
            const arrivalAirport = flight.arrival_airport;
            
            // Insertar los datos en la base de datos
            await insertFlightData(
                departureAirport.name,
                departureAirport.id,
                departureAirport.time,
                arrivalAirport.name,
                arrivalAirport.id,
                arrivalAirport.time,
                flight.duration,
                flight.airplane,
                flight.airline,
                flight.airline_logo,
                data.carbon_emissions ? data.carbon_emissions.this_flight : null, // Verificar si hay emisiones de carbono
                data.price,
                data.currency,
                data.airlineLogo
            );
        }
    } catch (error) {
        console.error('Error al insertar datos de vuelo:', error);
    }
}); */

