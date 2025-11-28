#!/bin/bash

# EC2 Ubuntu Setup Script for Driving School Platform

echo "🚀 Starting EC2 setup for Driving School Platform..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Install Docker Compose
echo "🔧 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
echo "📥 Installing Git..."
sudo apt install -y git

# Install Node.js (for local development if needed)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Create app directory
echo "📁 Creating application directory..."
mkdir -p /home/ubuntu/app
cd /home/ubuntu/app

# Clone repository (replace with your repo URL)
echo "📥 Cloning repository..."
# git clone https://github.com/yourusername/driving-school-platform.git
echo "⚠️  Please clone your repository manually:"
echo "   git clone https://github.com/yourusername/driving-school-platform.git"

# Set permissions
sudo chown -R ubuntu:ubuntu /home/ubuntu/app

# Configure firewall (UFW)
echo "🔒 Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 8000/tcp
sudo ufw allow 27017/tcp
sudo ufw --force enable

echo "✅ EC2 setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Clone your repository: git clone <your-repo-url>"
echo "2. Navigate to project: cd driving-school-platform/database"
echo "3. Start services: docker-compose up -d"
echo "4. Check health: curl http://localhost:8000/health"
echo ""
echo "🌐 Your EC2 public IP: $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "📱 Update mobile app API URL to: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8000/api/v1"