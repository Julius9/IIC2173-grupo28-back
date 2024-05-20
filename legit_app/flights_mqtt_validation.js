const mqtt = require('mqtt');

// Configuración y conexión con el broker MQTT
const client = mqtt.connect('mqtt://broker.iic2173.org:9000', {
    username: 'students',
    password: 'iic2173-2024-1-students'
});


const mqttHandler = {
    publishValidation: (message) => {
        const json_msg = JSON.stringify(message); // Convertir mensaje a JSON
        console.log('Publishing validation:', json_msg);
        client.publish('flights/validation', json_msg, (err) => { // Asegúrate de enviar json_msg
            if (err) {
                console.error('Failed to publish message:', err);
            } else {
                console.log('Message published successfully');
            }
        });
        // publishUsingPython(json_msg);
    },
};
// Suponiendo que tu script Python se llama `flights_mqtt_request.py` y está en el mismo directorio



module.exports = mqttHandler;
