#!/bin/bash

echo "🔍 Validating Driving School Platform..."

# Test backend health
echo "1. Testing backend health..."
curl -f http://34.228.166.62:8000/health || echo "❌ Backend health check failed"

# Test API endpoints
echo "2. Testing API endpoints..."
curl -f http://34.228.166.62:8000/docs || echo "❌ API docs not accessible"

# Test database connection
echo "3. Testing database..."
curl -f http://34.228.166.62:8000/api/v1/instructors/ || echo "❌ Database connection issue"

# Check mobile app dependencies
echo "4. Checking mobile app..."
cd mobile-app
npm list --depth=0 | grep -E "(expo|react-native)" || echo "❌ Mobile dependencies issue"

echo "✅ Validation completed!"