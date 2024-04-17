import paho.mqtt.client as mqtt
from time import sleep
import sys
import json

# Crear un cliente MQTT
mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
mqttc.username_pw_set("students", "iic2173-2024-1-students")

# Conectar al broker
mqttc.connect("broker.iic2173.org", 9000, 60)

# Iniciar el loop
mqttc.loop_start()

def publish():

    # Publicar el mensaje
    # Prueba de mensaje

    json_data = {
            "request_id": "0b56dfcb-8ae6-40a3-a3d5-d41503894a60",
             "group_id": "28",
             "departure_airport": "JFK",
             "arrival_airport": "LHR",
             "departure_time": "2024-04-24T19:40:00.000Z",
             "datetime": "2024-04-17T01:28:17.315Z",
             "deposit_token": "",
             "quantity": 2,
             "seller": 0
             }
    json_data = json.dumps(json_data)
    print(json_data)
    mqttc.publish("flights/requests", json_data)
    sleep(2)  # Ajusta este tiempo si es necesario
    # Detener el loop y desconectar
    mqttc.loop_stop()
    mqttc.disconnect()

if __name__ == "__main__":
    # Recibir los argumentos por consola
    publish()