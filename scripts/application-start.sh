#!/bin/bash

echo "Starting application"
cd /home/ubuntu/IIC2173-grupo28-back 
docker compose --file docker-compose.production.yml up -d