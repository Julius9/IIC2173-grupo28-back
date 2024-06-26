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

(async () => {
    try {
        await dbClient.connect();
        console.log('Conexión a la base de datos establecida');
    } catch (err) {
        console.error('Error al conectar a la base de datos:', err);
        process.exit(1); // Salir de la aplicación en caso de error de conexión
    }
})();

// Configuración y conexión con el broker MQTT
const client = mqtt.connect('mqtt://broker.iic2173.org:9000', {
    username: 'students',
    password: 'iic2173-2024-1-students'
});

client.on('connect', () => {
    console.log('Connected to MQTT Auctions broker');
    client.subscribe('flights/auctions');
});

client.on('message', async (topic, message) => {
    if (topic === 'flights/auctions') {
        const msg = JSON.parse(message.toString());
        console.log('Auction received:', msg);

        try {
            if (msg.type === 'offer') {
                if (msg.group_id !== 28) {
                    const query = 'INSERT INTO external_auction (auction_id, proposal_id, departure_airport, arrival_airport, departure_time, airline, quantity, group_id, type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)';
                    const values = [msg.auction_id, msg.proposal_id, msg.departure_airport, msg.arrival_airport, msg.departure_time, msg.airline, msg.quantity, msg.group_id, msg.type];
                    await dbClient.query(query, values);
                }
            } else if (msg.type === 'proposal') {
                const query = 'SELECT * FROM internal_auction WHERE auction_id = $1';
                const values = [msg.auction_id];
                const result = await dbClient.query(query, values);
                if (result.rows.length === 0) {
                    console.log('Auction not found:', msg.auction_id);
                    return;
                } else {
                    const insertQuery = 'INSERT INTO external_proposal (auction_id, proposal_id, departure_airport, arrival_airport, departure_time, airline, quantity, group_id, type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
                    const insertValues = [msg.auction_id, msg.proposal_id, msg.departure_airport, msg.arrival_airport, msg.departure_time, msg.airline, msg.quantity, msg.group_id, msg.type];
                    await dbClient.query(insertQuery, insertValues);
                }
            } else if (msg.type === 'acceptance' || msg.type === 'rejection') {
                const proposalQuery = 'SELECT * FROM internal_proposal WHERE proposal_id = $1';
                const proposalValues = [msg.proposal_id];
                const proposalResult = await dbClient.query(proposalQuery, proposalValues);
                if (proposalResult.rows.length === 0) { return; }
                if (msg.type === 'acceptance') {
                    const flightQuery = 'SELECT * FROM flights WHERE departure_airport = $1 AND arrival_airport = $2 AND departure_time = $3 AND airline = $4';
                    const flightValues = [msg.departure_airport, msg.arrival_airport, msg.departure_time, msg.airline];
                    const flightResult = await dbClient.query(flightQuery, flightValues);
                    if (flightResult.rows.length === 0) {
                        console.log('Flight not found:', msg.departure_airport, msg.arrival_airport, msg.departure_time, msg.airline);
                        return;
                    } else {
                        const flightID = flightResult.rows[0].id;
                        const reservedFlightQuery = 'SELECT * FROM flights_reservados WHERE flight_id = $1';
                        const reservedFlightValues = [flightID];
                        const reservedFlightResult = await dbClient.query(reservedFlightQuery, reservedFlightValues);
                        if (reservedFlightResult.rows.length === 0) {
                            const insertReservedQuery = 'INSERT INTO flights_reservados (flight_id, num_boletos, descuento, activado) VALUES ($1, $2, $3, $4)';
                            const insertReservedValues = [flightID, msg.quantity, 0.2, true];
                            await dbClient.query(insertReservedQuery, insertReservedValues);
                        } else {
                            const updateReservedQuery = 'UPDATE flights_reservados SET num_boletos = num_boletos + $1 WHERE flight_id = $2';
                            const updateReservedValues = [msg.quantity, flightID];
                            await dbClient.query(updateReservedQuery, updateReservedValues);
                        }
                    }
                    const updateProposalQuery = 'UPDATE internal_proposal SET expired = $1 WHERE proposal_id = $2';
                    const updateProposalValues = [true, msg.proposal_id];
                    await dbClient.query(updateProposalQuery, updateProposalValues);
                } else {
                    const updateProposalQuery = 'UPDATE internal_proposal SET expired = $1 WHERE proposal_id = $2';
                    const updateProposalValues = [true, msg.proposal_id];
                    await dbClient.query(updateProposalQuery, updateProposalValues);
                }
            }
        } catch (error) {
            console.error('Error al procesar mensaje:', error);
        }
    }
});

const mqttHandler = {
    publishAuction: (message) => {
        const jsonMsg = JSON.stringify(message);
        console.log('Publishing request:', jsonMsg);
        const requestId = message.request_id;
        client.publish('flights/auctions', jsonMsg, (err) => {
            if (err) {
                console.error('Failed to publish message:', err);
            } else {
                console.log('Message published successfully');
            }
        });
        return requestId;
    },
    onValidationReceived: null
};

module.exports = mqttHandler;
