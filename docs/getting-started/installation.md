# Installation Guide

## Prerequisites

### Required Software
- **DLang Compiler (DMD)**: v2.1xx
  ```bash
  # Linux
  curl -fsS https://dlang.org/install.sh | bash -s
  source ~/dlang/*/activate

  # macOS
  brew install dmd

  # Windows
  # Download from https://dlang.org/download.html
  ```

- **Node.js**: v18+
  ```bash
  # Linux/macOS
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs

  # macOS
  brew install node
  ```

- **Angular CLI**: v17
  ```bash
  npm install -g @angular/cli@17
  ```

- **SQLite3**: v3+
  ```bash
  # Linux
  sudo apt-get install sqlite3

  # macOS
  brew install sqlite3
  ```

- **Git**: v2+

---

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-org/simple-ecommerce.git
cd simple-ecommerce
```

### 2. Setup Backend
```bash
cd backend

# Install dependencies
dub fetch
dub upgrade

# Copy environment file
cp .env.example .env

# Edit .env with your settings
nano .env

# Run database migrations
# (TODO: Add migration command)

# Start development server
dub run
```

Backend runs at: `http://localhost:8080`

### 3. Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs at: `http://localhost:4200`

---

## Development Setup

### Backend (DLang + Vibe-D)

```bash
cd backend

# Development mode with debug output
dub run -- --mode development

# Build release
dub build --build=release

# Run tests
dub test

# View logs
tail -f logs/app.log
```

### Frontend (Angular 17)

```bash
cd frontend

# Development server with hot reload
npm start

# Run unit tests
npm test

# Run e2e tests
npm run e2e

# Build for production
npm run build:prod

# Build with specific configuration
npm run build:prod -- --configuration=production
```

---

## Docker Development

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

---

## Production Deployment

```bash
# Build Docker images
./docker-build.sh

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

---

## Troubleshooting

### Backend Issues
- **Port 8080 in use**: Kill existing process or change port in .env
- **Database locked**: Ensure no other processes are using the SQLite file

### Frontend Issues
- **Node version mismatch**: Use nvm to switch to correct version
- **Angular CLI not found**: Reinstall with `npm install -g @angular/cli@17`
