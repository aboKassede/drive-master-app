#!/bin/bash

echo "🔍 Troubleshooting EC2 Backend Access..."

# Check if Docker is running
echo "1. Checking Docker status..."
sudo systemctl status docker --no-pager

# Check if containers are running
echo -e "\n2. Checking running containers..."
docker ps

# Check if port 8000 is listening
echo -e "\n3. Checking if port 8000 is listening..."
sudo netstat -tlnp | grep :8000

# Check backend logs
echo -e "\n4. Checking backend container logs..."
docker logs driving_school_backend --tail 20

# Test local connection
echo -e "\n5. Testing local connection..."
curl -v http://localhost:8000/health

# Check firewall status
echo -e "\n6. Checking firewall status..."
sudo ufw status

# Check security group (if this fails, it means you need to check AWS console)
echo -e "\n7. Your public IP is:"
curl -s http://169.254.169.254/latest/meta-data/public-ipv4

echo -e "\n8. Testing external access..."
curl -v http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8000/health