#!/bin/bash

echo "Stopping application"
cd /home/ubuntu/IIC2173-grupo28-back 
docker compose --file docker-compose.production.yml down