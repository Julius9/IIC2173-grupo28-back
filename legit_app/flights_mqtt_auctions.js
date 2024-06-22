const mqtt = require('mqtt');

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
        // if (msg.status === 'accepted') {
        //     console.log('Auction accepted');
        //     if (mqttHandler.onValidationReceived) {
        //         mqttHandler.onValidationReceived(msg);
        //     }
        // } else {
        //     console.log('Auction rejected');
        // }
        console.log('Auction received:', msg);
        
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
