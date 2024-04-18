import datetime
import paho.mqtt.client as mqtt
from time import sleep
import sys
import json
import pytz

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
    #datetime tiene que estar en este formato: <YYYY-MM-DD hh:mm (en horario chileno)>

    chile_zone = pytz.timezone('Chile/Continental')

# Obtener la fecha y hora actual en la zona horaria de Chile
    chile_time = datetime.datetime.now(chile_zone)

    # Formatear la fecha y hora en formato ISO 8601
    formatted_time = chile_time.strftime('%Y-%m-%dT%H:%M:%S%z')
    json_data = {
        "request_id":"68c9663b-eee3-44fe-83b6-6bf10a41c559",
        "group_id":"28",
        "departure_airport":"DEN",
        "arrival_airport":"LHR",
        "departure_time":"2024-04-24 20:20",
        "datetime": formatted_time,
        "deposit_token":"",
        "quantity":2,
        "seller":0}
    print(json_data)
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