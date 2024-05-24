#!/bin/bash

echo "Stopping application"
docker compose --file docker-compose.production.yml down