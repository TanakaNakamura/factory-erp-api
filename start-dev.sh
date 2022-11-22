#!/bin/bash

echo "Starting Factory ERP API Development Environment..."

if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
fi

echo "Starting services with Docker Compose..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

echo "Services started! Access the API at http://localhost:3000"
echo "MongoDB UI available at http://localhost:8081"