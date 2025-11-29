#!/bin/bash

echo "Creating instructor account..."

curl -X POST "http://34.228.166.62:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "instructor@example.com",
    "password": "password123",
    "first_name": "Sarah",
    "last_name": "Wilson",
    "phone": "555-0123",
    "user_type": "instructor"
  }'

echo -e "\n\nInstructor created!"
echo "Email: instructor@example.com"
echo "Password: password123"