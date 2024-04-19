import paho.mqtt.client as mqtt
import json
import requests


def send_data(data):
    url = "http://app:3000/msg"
    response = requests.post(url, json=data)
    print('Response:', response.text)


def on_connect(client, userdata, flags, reason_code, properties):
    print(f"Connected with result code {reason_code}")
    client.subscribe("flights/info")


def on_message(client, userdata, msg):
    jsonString = msg.payload.decode()
    data = json.loads(jsonString)
    data = data[0]
    data['flights'] = json.loads(data['flights'])
    data['carbonEmission'] = json.loads(data['carbonEmission'])

    # send_data(data)

    print(data)
    print(type(data['flights']))
    print(type(data['price']))
    print(type(data['carbonEmission']))
    print(type(data['airlineLogo']))
    print(type(data['currency']))
    print("\n")


mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
mqttc.on_connect = on_connect
mqttc.on_message = on_message
mqttc.username_pw_set("students", "iic2173-2024-1-students")
mqttc.connect("broker.iic2173.org", 9000, 60)
mqttc.loop_forever()
