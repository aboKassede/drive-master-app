#!/bin/bash

echo "Checking application health..."

# Check backend health
echo "Backend health:"
curl -s http://localhost:8000/health | python -m json.tool

echo -e "\nAPI documentation available at: http://localhost:8000/docs"
echo "Backend API: http://localhost:8000"