# Installation Guide

## Prerequisites

Before installing the Simple E-Commerce Platform, ensure you have the following installed:

- **Docker** 20.10+ and **Docker Compose** 2.0+
- **Git** for version control
- **Node.js** 18+ (for frontend development)
- **DLang** compiler (dmd) 2.100+ (for backend development)

## Quick Start (Docker)

The fastest way to get started is using Docker:

```bash
# Clone the repository
git clone https://github.com/tuliofh01/simple_e-commerce.git
cd simple_e-commerce

# Copy environment template
cp .env.example .env

# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Verify services are running
docker-compose ps
```

## Manual Installation

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install D dependencies
dub fetch
dub install

# Build the application
dub build --build=release

# Run the server
./bin/simple_ecommerce
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start development server
npm start

# Build for production
npm run build:prod
```

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
SERVER_PORT=8080
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Database Configuration
DB_PATH=data/database.db

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Security
HCAPTCHA_SECRET=your-hcaptcha-secret
```

## Verification

After installation, verify your setup:

### Backend Health Check

```bash
curl http://localhost:8080/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-02-09T18:00:00Z",
  "version": "1.0.0"
}
```

### Frontend Access

Open your browser and navigate to:
- **Development**: http://localhost:4200
- **Production**: http://localhost

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :8080

# Kill the process
kill -9 <PID>
```

#### Database Issues
```bash
# Reset database
rm -rf backend/data/database.db
docker-compose restart backend
```

#### Permission Issues
```bash
# Fix permissions
chmod +x backend/bin/simple_ecommerce
```