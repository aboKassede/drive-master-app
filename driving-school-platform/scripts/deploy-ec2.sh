#!/bin/bash

# Deploy Driving School Platform to EC2

echo "🚀 Deploying to EC2..."

# Get EC2 public IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "📍 EC2 IP: $EC2_IP"

# Navigate to project directory
cd /home/ubuntu/app/driving-school-platform

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Update mobile app API URL
echo "📱 Updating mobile app API URL..."
sed -i "s/YOUR-EC2-PUBLIC-IP/$EC2_IP/g" mobile-app/src/services/api.js

# Start services with Docker Compose
echo "🐳 Starting services..."
cd database
docker-compose down
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check health
echo "🏥 Checking application health..."
curl -f http://localhost:8000/health || echo "❌ Health check failed"

echo "✅ Deployment completed!"
echo "🌐 API available at: http://$EC2_IP:8000"
echo "📚 API docs at: http://$EC2_IP:8000/docs"