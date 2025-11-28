#!/bin/bash

set -e

echo "Starting deployment..."

# Build backend Docker image
echo "Building backend image..."
cd backend
docker build -t driving-school-backend:latest .
cd ..

# Deploy to production
echo "Deploying to production..."
docker-compose -f database/docker-compose.yml up -d

echo "Deployment completed successfully!"