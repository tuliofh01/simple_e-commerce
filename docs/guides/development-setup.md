# Stack Initialization Guide

Complete guide to initializing, configuring, and running the DLang + Angular e-commerce platform.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Hardware Requirements](#hardware-requirements)
3. [Operating System Setup](#operating-system-setup)
4. [DLang Backend Setup](#dlang-backend-setup)
5. [Angular Frontend Setup](#angular-frontend-setup)
6. [Database Configuration](#database-configuration)
7. [Environment Variables](#environment-variables)
8. [Building the Project](#building-the-project)
9. [Running the Application](#running-the-application)
10. [Docker Deployment](#docker-deployment)
11. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Software

| Component | Minimum Version | Recommended Version | Purpose |
|-----------|---------------|---------------------|---------|
| **DLang Compiler** | DMD 2.100+ | DMD 2.105+ | Backend compilation |
| **Dub** | 1.30+ | 1.35+ | D package manager |
| **Node.js** | 18 LTS | 20 LTS | Frontend build tools |
| **npm** | 9+ | 10+ | Node package manager |
| **Angular CLI** | 17.0+ | 17.3+ | Frontend scaffolding |
| **SQLite** | 3.40+ | 3.45+ | Database engine |
| **Git** | 2.40+ | 2.45+ | Version control |

### Verification Commands

```bash
# Verify DLang installation
dmd --version
# Expected: DMD64 D Compiler v2.1XX.X

dub --version
# Expected: DUB version 1.XX.X

# Verify Node.js installation
node --version
# Expected: v18.X.X or v20.X.X

npm --version
# Expected: 9.X.X or 10.X.X

# Verify Angular CLI
ng version
# Expected: Angular CLI: 17.X.X

# Verify SQLite installation
sqlite3 --version
# Expected: 3.XX.X
```

---

## 💻 Hardware Requirements

### Development Environment

| Resource | Minimum | Recommended | Notes |
|----------|---------|-------------|-------|
| **CPU** | Dual-core | Quad-core | DLang compiles faster with more cores |
| **RAM** | 4 GB | 8 GB | IDE + builds need memory |
| **Storage** | 10 GB | 25 GB SSD | Dependencies + builds |
| **Network** | 10 Mbps | 100 Mbps | Package downloads |

### Production Environment (MVP)

| Resource | Minimum | Recommended | Notes |
|----------|---------|-------------|-------|
| **CPU** | 1 vCPU | 2 vCPU | Single-threaded SQLite writer |
| **RAM** | 512 MB | 1 GB | Light footprint |
| **Storage** | 5 GB | 10 GB SSD | Database + uploads |
| **Network** | 100 Mbps | 1 Gbps | User traffic |

### Production Environment (Full Platform)

| Resource | Minimum | Recommended | Notes |
|----------|---------|-------------|-------|
| **CPU** | 2 vCPU | 4 vCPU | Handle concurrent requests |
| **RAM** | 1 GB | 2 GB | Caching + app |
| **Storage** | 20 GB | 50 GB SSD | Growth + media |
| **Network** | 1 Gbps | 10 Gbps | User traffic |

### Hardware Scaling Considerations

```
SQLite Limitations:
├── Single-writer model (1,000+ concurrent users needs Redis/PostgreSQL)
├── File-locking for concurrent reads
├── Up to 1 TB database size
└── Best for read-heavy workloads

DLang Performance:
├── Native code = minimal resource usage
├── Compile-time optimization = fast runtime
├── Memory footprint: 50-200 MB typical
└── Scales linearly with CPU cores

Angular Bundle:
├── Initial load: 150-200 KB gzipped
├── Total JS: 500 KB - 1 MB
└── Benefits from CDN distribution
```

---

## 🖥️ Operating System Setup

### Ubuntu/Debian (Recommended)

```bash
# Update package lists
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y wget curl git unzip software-properties-common

# Install DLang
wget https://dlang.org/install.sh -O install-dlang.sh
chmod +x install-dlang.sh
./install-dlang.sh
source ~/dlang/*/activate

# Install Node.js (using nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Install SQLite
sudo apt install -y sqlite3 libsqlite3-dev

# Install Angular CLI globally
npm install -g @angular/cli@17

# Verify installations
dmd --version
node --version
sqlite3 --version
ng version
```

### macOS

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install DLang
brew install dmd dub

# Install Node.js (using nvm)
brew install nvm
source ~/.zshrc
nvm install 20
nvm use 20

# Install SQLite (usually pre-installed)
sqlite3 --version

# Install Angular CLI
npm install -g @angular/cli@17
```

### Windows

```powershell
# Install DLang
winget install DlangFoundation.Dlang
# Or download from https://dlang.org/download.html

# Install Node.js
winget install OpenJS.NodeJS.LTS

# Install SQLite
winget install SQLite.SQLite

# Install Angular CLI
npm install -g @angular/cli@17

# Restart terminal after installations
```

---

## 🦋 DLang Backend Setup

### Directory Structure

```
backend/
├── bin/                    # Compiled executables
├── source/                 # Source code
│   ├── config/            # Configuration modules
│   ├── controllers/        # HTTP request handlers
│   ├── crypto/           # Security (JWT, hashing)
│   ├── database/         # Database connection
│   ├── middleware/       # HTTP middleware
│   ├── models/           # Data structures
│   ├──.d server          # Application entry point
│   └── templates/        # Template patterns
├── tests/                 # Unit tests
├── dub.json              # D package configuration
├── dub.selections.json   # Dependency lock file
└── .env                  # Environment variables
```

### Dub Configuration

```json
{
  "name": "simple_ecommerce",
  "description": "Simple E-Commerce Platform Backend",
  "authors": ["Your Name"],
  "copyright": "Copyright 2024",
  "license": "Apache-2.0",
  "dependencies": {
    "vibe-d": "~>0.9.6",
    "sqlite-d": "~>3.0"
  },
  "configurations": [
    {
      "name": "default",
      "targetType": "executable",
      "targetPath": "bin",
      "workingDirectory": "backend",
      "sourcePaths": ["source"]
    },
    {
      "name": "test",
      "targetType": "executable",
      "targetPath": "bin",
      "workingDirectory": "backend"
    }
  ],
  "buildTypes": {
    "debug": {
      "buildOptions": ["debugMode", "debugInfo"]
    },
    "release": {
      "buildOptions": ["releaseMode", "optimize", "inline"]
    }
  }
}
```

### First-Time Setup

```bash
# Navigate to backend directory
cd backend

# Fetch dependencies
dub fetch

# Install dependencies
dub install

# Verify setup
dub build
# Should compile successfully

# Run tests
dub test

# Build release version
dub build --build=release
```

### DLang Key Concepts

#### Module System
```d
// module declaration (first line)
module source.server;

// Import statements
import vibe.d;              // Full vibe.d package
import std.stdio;           // Standard library
import mymodule;             // Local module (mymodule.d)
```

#### Structs vs Classes
```d
// Structs: Value types, stack-allocated, no inheritance
struct Product {
    ulong id;
    string name;
    double price;
    
    // Methods
    bool inStock() const {
        return stock > 0;
    }
    
    // Static factory
    static Product fresh(string name, double price) {
        return Product(0, name, price, 0, "", "");
    }
}

// Classes: Reference types, heap-allocated, inheritance
class ProductController {
    private Database db;
    
    this() {
        db = Database.getInstance();
    }
    
    void getProducts(HTTPServerRequest req, HTTPServerResponse res) {
        // Handler logic
    }
}
```

#### Templates (Generics)
```d
// Compile-time generic pattern
template Repository(T) {
    static assert(is(T == struct), "T must be struct");
    
    class Repository {
        private Database db;
        
        T create(T entity) {
            // Generic create logic
            return entity;
        }
        
        Nullable!T findById(ulong id) {
            // Generic find logic
        }
    }
}

// Usage
alias ProductRepo = Repository!Product;
ProductRepo productRepo = new ProductRepo();
```

---

## 🅰️ Angular Frontend Setup

### Directory Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                 # Singleton services, guards, interceptors
│   │   │   ├── guards/          # Route protection
│   │   │   ├── interceptors/    # HTTP manipulation
│   │   │   ├── interfaces/     # TypeScript interfaces
│   │   │   └── services/       # Business logic services
│   │   ├── features/           # Feature modules (lazy-loaded)
│   │   │   ├── auth/           # Authentication
│   │   │   ├── shop/           # Product browsing
│   │   │   ├── blog/           # Blog system
│   │   │   ├── account/        # User account
│   │   │   ├── admin/          # Admin dashboard
│   │   │   └── checkout/      # Checkout flow
│   │   ├── shared/            # Reusable components
│   │   │   ├── components/     # Dumb components
│   │   │   ├── directives/    # Custom directives
│   │   │   └── pipes/         # Pure functions
│   │   ├── app.component.ts   # Root component
│   │   ├── app.module.ts      # Root module
│   │   └── app-routing.module.ts
│   ├── assets/                # Static files (images, icons)
│   ├── environments/          # Environment-specific config
│   ├── index.html            # Entry HTML
│   ├── main.ts               # Bootstrap entry
│   └── styles.scss           # Global styles
├── tests/                     # Test files
├── angular.json              # Angular CLI configuration
├── package.json              # Node dependencies
├── tsconfig.json             # TypeScript configuration
└── tslint.json              # Code style rules
```

### First-Time Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Verify Angular CLI
ng version

# Create new components (if needed)
ng generate component features/auth/login
ng generate service core/services/auth

# Run development server
npm start

# Build for production
npm run build:prod

# Run tests
npm test

# Run linter
npm run lint
```

### Angular 17 Key Concepts

#### Standalone Components
```typescript
// Modern standalone component (no NgModule)
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-product-card',
  standalone: true,                    // No NgModule needed
  imports: [                           // Explicit imports
    CommonModule,
    MatCardModule
  ],
  template: `
    <mat-card>
      <img [src]="product.imageUrl">
      <h3>{{ product.name }}</h3>
      <p>{{ product.price | currency }}</p>
    </mat-card>
  `,
  styles: [`
    mat-card {
      margin: 1rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush  // Performance optimization
})
export class ProductCardComponent {
  @Input() product!: Product;          // Input from parent
  @Output() addToCart = new EventEmitter<Product>();
  
  onAddToCart() {
    this.addToCart.emit(this.product);
  }
}
```

#### Services with Dependency Injection
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'    // Singleton across app
})
export class ProductService {
  private baseUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}
  
  getProducts(params?: ProductFilters): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.baseUrl}/products`, {
      params: params as Record<string, string>
    });
  }
  
  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }
}
```

---

## 🗄️ Database Configuration

### SQLite Setup

```bash
# Create data directory
mkdir -p backend/data

# Initialize database (auto-created by app)
touch backend/data/database.db

# Set permissions
chmod 755 backend/data/database.db
```

### Database Schema Initialization

The application automatically creates required tables on startup:

```sql
-- Tables created automatically:
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    category TEXT DEFAULT 'uncategorized',
    slug TEXT UNIQUE NOT NULL,
    is_new BOOLEAN DEFAULT 0,
    is_sale BOOLEAN DEFAULT 0,
    original_price REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Additional tables: orders, order_items, blog_posts, comments, media_files
```

### Database Management

```bash
# Access SQLite CLI
sqlite3 backend/data/database.db

# Commands inside SQLite:
.tables                          -- List all tables
.schema products                 -- Show table schema
SELECT * FROM users LIMIT 5;     -- Query data
.quit                            -- Exit

# Backup database
sqlite3 backend/data/database.db .dump > backup.sql

# Restore database
sqlite3 backend/data/database.db < backup.sql
```

---

## 🔐 Environment Variables

### Configuration File (.env)

Create `backend/.env` file:

```env
# Server Configuration
SERVER_PORT=8080
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY_HOURS=24

# Database Configuration
DB_PATH=backend/data/database.db

# Stripe Payment Integration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Security
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX_ATTEMPTS=5

# File Uploads
MAX_FILE_SIZE_MB=10
UPLOAD_DIR=backend/uploads/

# CORS Configuration
CORS_ORIGIN=http://localhost:4200
```

### Environment-Specific Overrides

```d
// In config/app_config.d
struct AppConfig {
    string jwtSecret;
    string dbPath;
    uint serverPort;
    string stripeSecretKey;
    // ...
    
    static AppConfig load() {
        auto config = AppConfig.defaults();
        
        // Load from .env file
        if (exists(".env")) {
            config = parseEnvFile(".env", config);
        }
        
        // Environment variables override
        config.jwtSecret = environment.get("JWT_SECRET", config.jwtSecret);
        config.serverPort = environment.get("SERVER_PORT", 
            config.serverPort.to!string).to!uint;
        
        return config;
    }
}
```

---

## 🏗️ Building the Project

### Backend Build Commands

```bash
cd backend

# Debug build (fastest compilation)
dub build
# Output: bin/simple_ecommerce (with debug symbols)

# Release build (optimized)
dub build --build=release
# Output: bin/simple_ecommerce (production-ready)

# Build with custom config
dub build --config=default --build=release

# Build for testing
dub build --config=test

# Verbose build output
dub build -v

# Clean previous builds
dub clean
```

### Frontend Build Commands

```bash
cd frontend

# Development build (fast)
npm run build
# Output: dist/ (development)

# Production build (optimized)
npm run build:prod
# Output: dist/simple-ecommerce/ (production-ready)

# Build with custom configuration
ng build --configuration=production

# Generate bundle statistics
npm run build:stats
npx webpack-bundle-analyzer dist/simple-ecommerce/browser/stats.json

# Watch mode (auto-rebuild on changes)
npm run watch

# Type checking only
ng build --no-progress --configuration=development
```

### Build Verification

```bash
# Backend
./bin/simple_ecommerce --version
./bin/simple_ecommerce --help

# Frontend
ls -lh dist/simple-ecommerce/browser/*.js | head -5
```

---

## 🚀 Running the Application

### Development Mode

#### Backend (Auto-restart on changes)

```bash
# Run with vibe.d's watch mode
cd backend
dub run

# Or manually:
./bin/simple_ecommerce

# Expected output:
🚀 Starting Simple E-Commerce Backend Server...
✅ Server initialized successfully
🌐 Server running on http://localhost:8080
📊 Health check: http://localhost:8080/api/health
⏰ Started at: 2024-02-09T12:00:00Z
```

#### Frontend (Hot Module Replacement)

```bash
cd frontend
npm start

# Expected output:
✔ Browser application bundle generation complete.
✔ Local: http://localhost:4200/
✔ Network: http://192.168.X.X:4200/

# Open browser to http://localhost:4200
```

### Production Mode

#### Backend

```bash
cd backend

# Run optimized binary
./bin/simple_ecommerce

# Or with environment
PORT=8080 ./bin/simple_ecommerce

# Systemd service example
sudo nano /etc/systemd/system/ecommerce-api.service
```

```ini
[Unit]
Description=Simple E-Commerce Backend
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/ecommerce/backend
ExecStart=/opt/ecommerce/backend/bin/simple_ecommerce
Restart=always
RestartSec=10
Environment=PORT=8080
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable ecommerce-api
sudo systemctl start ecommerce-api
sudo systemctl status ecommerce-api
```

#### Frontend (Static Files)

```bash
cd frontend

# Build for production
npm run build:prod

# Serve with Nginx
sudo cp -r dist/simple-ecommerce/browser /var/www/ecommerce
sudo nano /etc/nginx/sites-available/ecommerce
```

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/ecommerce/browser;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🐳 Docker Deployment

### Docker Compose (Development)

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    volumes:
      - ./backend:/app
      - app-data:/data
    environment:
      - DB_PATH=/data/database.db
      - NODE_ENV=development
    depends_on:
      - db

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "4200:4200"
    volumes:
      - ./frontend:/app
      - node_modules:/app/node_modules
    environment:
      - API_URL=http://backend:8080

  db:
    image: sqlite:latest
    volumes:
      - app-data:/data
    ports:
      - "8081:8081"  # Adminer for database management

volumes:
  app-data:
```

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop
docker-compose -f docker-compose.dev.yml Production down
```

### Docker

```dockerfile
# backend/Dockerfile
FROM dlang/dmd:2.105-alpine AS builder

WORKDIR /app
COPY . .

RUN dub build --build=release --config=default

FROM alpine:latest
RUN apk add --no-cache libssl1.1

WORKDIR /app
COPY --from=builder /app/bin/simple_ecommerce /usr/local/bin/
COPY --from=builder /app/data /data

EXPOSE 8080

CMD ["simple_ecommerce"]
```

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:prod -- --configuration=production

FROM nginx:alpine
COPY --from=builder /app/dist/simple-ecommerce/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - DB_PATH=/data/database.db
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - backend-data:/data
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    restart: unless-stopped

volumes:
  backend-data:
```

```bash
# Build and run production
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale horizontally
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

---

## 🔧 Troubleshooting

### Common Issues

#### DLang: Import Errors
```bash
# Clean and rebuild
dub clean
dub fetch
dub build

# Check dub.json dependencies
cat dub.json | jq '.dependencies'
```

#### Angular: Module Not Found
```bash
# Clear cache
rm -rf node_modules/.cache
rm -rf dist

# Reinstall dependencies
npm ci

# TypeScript check
npx tsc --noEmit
```

#### Database: Locked
```bash
# Check for running processes
ps aux | grep sqlite

# Kill lingering processes
pkill -f sqlite

# Remove lock file (if safe)
rm backend/data/database.db-wal 2>/dev/null
rm backend/data/database.db-shm 2>/dev/null
```

#### Port Already in Use
```bash
# Find process using port
lsof -i :8080

# Kill process
kill -9 <PID>

# Or change port in .env
```

### Performance Issues

```bash
# Backend profiling
dub build --build=debug
./bin/simple_ecommerce --profile

# Frontend bundle analysis
npm run build:stats
npx webpack-bundle-analyzer dist/stats.json

# Database query analysis
sqlite3 backend/data/database.db
> .timer on
> SELECT * FROM products WHERE category = 'electronics';
```

---

## 📚 Next Steps

After setup, proceed to:
1. [API Reference](../reference/api/endpoints.md)
2. [Development Guide](../guides/development-setup.md)
3. [Testing Guide](../guides/testing-guide.md)
4. [Deployment Guide](../guides/deployment-guide.md)

---

**Document Version**: 1.0.0  
**Last Updated**: 2024-02-09  
**Stack**: DLang 2.1xx + Angular 17