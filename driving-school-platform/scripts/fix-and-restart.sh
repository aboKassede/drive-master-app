#!/bin/bash

echo "🔧 Fixing backend and restarting services..."

# Stop containers
echo "1. Stopping containers..."
cd /home/ubuntu/app/driving-school-platform/database
docker-compose down

# Rebuild backend with fix
echo "2. Rebuilding backend..."
docker-compose build --no-cache backend

# Start services
echo "3. Starting services..."
docker-compose up -d

# Wait for startup
echo "4. Waiting for services to start..."
sleep 15

# Check status
echo "5. Checking container status..."
docker ps

# Test health
echo "6. Testing health endpoint..."
curl http://localhost:8000/health

echo "7. Backend logs:"
docker logs driving_school_backend --tail 10