const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');


const configPath = path.resolve(__dirname, './config.json');

// Leer la configuración del archivo
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const dbClient = new Client({
    user: config.DB_USER,
    host: config.DB_HOST,
    database: config.DB_NAME,
    password: config.DB_PASSWORD,
    port: config.DB_PORT,
});

dbClient.connect()
    .then(() => {
        console.log('Conexión a la base de datos establecida');
    })
    .catch(err => {
        console.error('Error al conectar a la base de datos:', err);
        process.exit(1); // Salir de la aplicación en caso de error de conexión
    });

// Configuración y conexión con el broker MQTT
const client = mqtt.connect('mqtt://broker.iic2173.org:9000', {
    username: 'students',
    password: 'iic2173-2024-1-students'
});

client.on('connect', () => {
    console.log('Connected to MQTT Auctions broker');
    client.subscribe('flights/auctions');
});

client.on('message', (topic, message) => {
    if (topic === 'flights/auctions') {
        const msg = JSON.parse(message.toString());
        console.log('Auction received:', msg);
        let query;
        let values;
        let result;
        try {
            if (msg.type === 'offer'){
                if (msg.group_id !== 28) {
                    query = 'INSERT INTO external_auction (auction_id, proposal_id, departure_airport, arrival_airport, departure_time, airline, quantity, group_id, type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
                    values = [msg.auction_id, msg.proposal_id, msg.departure_airport, msg.arrival_airport, msg.departure_time, msg.airline, msg.quantity, msg.group_id, msg.type];
                    dbClient.query(query, values);
                }
            } else if (msg.type === 'proposal') {
                // Buscar si el auction_id se encuentra en la table de internal_auction
                query = 'SELECT * FROM internal_auction WHERE auction_id = $1';
                values = [msg.auction_id];
                result = dbClient.query(query, values);
                if (result.rows.length === 0) {
                    console.log('Auction not found:', msg.auction_id);
                    return;
                } else {
                    // añadir la propuesta a la tabla de external_proposal
                    query = 'INSERT INTO external_proposal (auction_id, proposal_id, departure_airport, arrival_airport, departure_time, airline, quantity, group_id, type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
                    values = [msg.auction_id, msg.proposal_id, msg.departure_airport, msg.arrival_airport, msg.departure_time, msg.airline, msg.quantity, msg.group_id, msg.type];
                    dbClient.query(query, values);
                }
            } else if (msg.type === 'acceptance' || msg.type === 'rejection') {
                query = 'SELECT * FROM internal_proposal WHERE proposal_id = $1';
                values = [msg.proposal_id];
                result = dbClient.query(query, values);
                if (result.rows.length === 0) {return;}
                if (msg.type === 'acceptance') {
                    // hago update de los tickets al vuelo de la tabla flights
                    try {
                        query = 'UPDATE flights SET tickets_left = tickets_left - $1 WHERE departure_airport = $2 AND arrival_airport = $3 AND departure_time = $4 AND airline = $5';
                        values = [msg.quantity, msg.departure_airport, msg.arrival_airport, msg.departure_time, msg.airline];
                        
                        dbClient.query(query, values);

                        // hago update del estado de la propuesta en la tabla internal_proposal
                        query = 'UPDATE internal_proposal SET expired = $1 WHERE proposal_id = $2';
                        values = [true, msg.proposal_id];
                        dbClient.query(query, values);

                    } catch (error) {
                        console.error('Error al aceptar los tickets del proposal:', error);
                    }
                } else {
                    // hago update del estado de la propuesta en la tabla internal_proposal
                    query = 'UPDATE internal_proposal SET expired = $1 WHERE proposal_id = $2';
                    values = [true, msg.proposal_id];
                    dbClient.query(query, values);
                }
            }
        } catch (error) {
            console.error('Error al procesar mensaje:', error);
        }
    }
});

const mqttHandler = {
    publishAuction: (message) => {
        const json_msg = JSON.stringify(message); // Convertir mensaje a JSON
        console.log('Publishing request:', json_msg);
        const request_id = message.request_id;
        client.publish('flights/auctions', json_msg, (err) => { // Asegúrate de enviar json_msg
            if (err) {
                console.error('Failed to publish message:', err);
            } else {
                console.log('Message published successfully');
            }
        });
        // publishUsingPython(json_msg);
        return request_id;  // Devolver el request_id para referencia futura
    },
    onValidationReceived: null  // Placeholder para la función de callback
};
// Suponiendo que tu script Python se llama `flights_mqtt_request.py` y está en el mismo directorio



module.exports = mqttHandler;
