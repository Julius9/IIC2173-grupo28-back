#!/bin/bash

echo "Pulling application"
cd /home/ubuntu/IIC2173-grupo28-back
docker-compose -f docker-compose.production.yml pull