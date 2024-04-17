const { json } = require('express');
const mqtt = require('mqtt');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');

// Configuración y conexión con el broker MQTT
const client = mqtt.connect('mqtt://broker.iic2173.org:9000', {
    username: 'students',
    password: 'iic2173-2024-1-students'
});

client.on('connect', () => {
    console.log('Connected to MQTT broker.');
    client.subscribe('flights/validation');
});

client.on('message', (topic, message) => {
    if (topic === 'flights/validation') {
        const validation = JSON.parse(message.toString());
        console.log('Validation received:', validation);
        // Llamada a una función de callback cuando se recibe la validación
        if (mqttHandler.onValidationReceived) {
            mqttHandler.onValidationReceived(validation);
        }
    }
});

// const publishUsingPython = (json_msg) => {
//     // Preparar el comando para ejecutar el script Python con el mensaje JSON como argumento
//     const command = `python3 brokers/flights_mqtt_request.py '${JSON.stringify(json_msg)}'`;

//     // Ejecutar el script Python
//     exec(command, (error, stdout, stderr) => {
//         if (error) {
//             console.error('Failed to publish message:', error);
//             return;
//         }
//         if (stderr) {
//             console.error('Error:', stderr);
//             return;
//         }
//         console.log('Message published successfully:', stdout);
//     });
// };

const mqttHandler = {
    publishRequest: (message) => {
        const json_msg = JSON.stringify(message); // Convertir mensaje a JSON
        console.log('Publishing request:', json_msg);
        const request_id = message.request_id;
        client.publish('flights/requests', json_msg, (err) => { // Asegúrate de enviar json_msg
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
