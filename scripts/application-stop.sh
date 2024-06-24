#!/bin/bash

echo "Stopping application"
cd /home/ubuntu/IIC2173-grupo28-back
pwd  # Imprime el directorio actual
ls -l # Lista los archivos en el directorio actual
docker compose --file docker-compose.production.yml down
