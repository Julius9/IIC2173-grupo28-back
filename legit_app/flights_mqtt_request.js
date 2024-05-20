const mqtt = require('mqtt');

// Configuración y conexión con el broker MQTT
const client = mqtt.connect('mqtt://broker.iic2173.org:9000', {
    username: 'students',
    password: 'iic2173-2024-1-students'
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
