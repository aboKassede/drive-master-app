# Driving School Platform

A comprehensive platform for managing driving school operations with a FastAPI backend and React Native mobile app.

## Features

- Student and instructor registration/authentication
- Lesson scheduling and management
- Payment processing
- Mobile app for students and instructors
- RESTful API with JWT authentication
- MongoDB database
- Docker containerization

## Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements/base.txt
```

3. Set environment variables:
```bash
cp ../.env.example .env
# Edit .env with your configuration
```

4. Run the application:
```bash
uvicorn app.main:app --reload
```

### Mobile App Setup

1. Navigate to mobile app directory:
```bash
cd mobile-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### Docker Setup

1. Start the complete stack:
```bash
cd database
docker-compose up -d
```

## API Documentation

Once the backend is running, visit:
- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

## Project Structure

- `backend/` - FastAPI backend application
- `mobile-app/` - React Native mobile application
- `database/` - MongoDB setup and initialization
- `infra/` - Infrastructure as code (Terraform, K8s)
- `scripts/` - Deployment and utility scripts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request