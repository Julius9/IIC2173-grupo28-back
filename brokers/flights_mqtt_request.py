import paho.mqtt.client as mqtt
from time import sleep

# Crear un cliente MQTT
mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
mqttc.username_pw_set("students", "iic2173-2024-1-students")

# Conectar al broker
mqttc.connect("broker.iic2173.org", 9000, 60)

# Iniciar el loop
mqttc.loop_start()


def publish(json_data):
    mqttc.publish("flights/requests", json_data)
    sleep(2)  # Ajusta este tiempo si es necesario
    # Detener el loop y desconectar
    mqttc.loop_stop()
    mqttc.disconnect()
