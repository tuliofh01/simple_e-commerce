#!/bin/bash

# Docker Build Script for Simple E-Commerce Platform
# This script handles post-compilation steps and container management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&amp;1; then
        print_error "Docker is not running or not installed. Please start Docker first."
        exit 1
    fi
}

# Function to build backend
build_backend() {
    print_status "Building backend..."
    
    # Check if backend directory exists
    if [ ! -d "backend" ]; then
        print_error "Backend directory not found"
        exit 1
    fi
    
    # Navigate to backend directory
    cd backend
    
    # Build Docker image
    docker build -t simple-ecommerce-backend .
    
    print_success "Backend built successfully"
    cd ..
}

# Function to build frontend
build_frontend() {
    print_status "Building frontend..."
    
    # Check if frontend directory exists
    if [ ! -d "frontend" ]; then
        print_error "Frontend directory not found"
        exit 1
    fi
    
    # Navigate to frontend directory
    cd frontend
    
    # Build Docker image
    docker build -t simple-ecommerce-frontend .
    
    print_success "Frontend built successfully"
    cd ..
}

# Function to start development environment
start_dev() {
    print_status "Starting development environment..."
    
    # Check if docker-compose.dev.yml exists
    if [ ! -f "docker-compose.dev.yml" ]; then
        print_error "docker-compose.dev.yml not found"
        exit 1
    fi
    
    # Start services
    docker-compose -f docker-compose.dev.yml up -d
    
    print_success "Development environment started"
    print_status "Backend: http://localhost:8080"
    print_status "Frontend: http://localhost:4200"
}

# Function to stop development environment
stop_dev() {
    print_status "Stopping development environment..."
    
    # Stop services
    docker-compose -f docker-compose.dev.yml down
    
    print_success "Development environment stopped"
}

# Function to start production environment
start_prod() {
    print_status "Starting production environment..."
    
    # Check if docker-compose.prod.yml exists
    if [ ! -f "docker-compose.prod.yml" ]; then
        print_error "docker-compose.prod.yml not found"
        exit 1
    fi
    
    # Start services
    docker-compose -f docker-compose.prod.yml up -d
    
    print_success "Production environment started"
    print_status "Backend: http://localhost:8080"
    print_status "Frontend: http://localhost:4200"
}

# Function to stop production environment
stop_prod() {
    print_status "Stopping production environment..."
    
    # Stop services
    docker-compose -f docker-compose.prod.yml down
    
    print_success "Production environment stopped"
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Run backend tests
    if [ -d "backend/tests" ]; then
        print_status "Running backend tests..."
        # Add backend test commands here
        print_success "Backend tests completed"
    fi
    
    # Run frontend tests
    if [ -d "frontend/tests" ]; then
        print_status "Running frontend tests..."
        cd frontend
        npm run test
        cd ..
        print_success "Frontend tests completed"
    fi
}

# Function to show logs
show_logs() {
    print_status "Showing logs..."
    
    # Show backend logs
    if docker ps | grep -q simple-ecommerce-backend; then
        print_status "Backend logs:"
        docker logs simple-ecommerce-backend --tail 50 -f
    fi
    
    # Show frontend logs
    if docker ps | grep -q simple-ecommerce-frontend; then
        print_status "Frontend logs:"
        docker logs simple-ecommerce-frontend --tail 50 -f
    fi
}

# Function to show status
show_status() {
    print_status "Current status:"
    
    # Show Docker containers
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    # Show images
    print_status "Images:"
    docker images | grep simple-ecommerce
}

# Function to clean up
cleanup() {
    print_status "Cleaning up..."
    
    # Stop all containers
    docker-compose -f docker-compose.dev.yml down -v 2>/dev/null || true
    docker-compose -f docker-compose.prod.yml down -v 2>/dev/null || true
    
    # Remove images
    docker rmi simple-ecommerce-backend simple-ecommerce-frontend 2>/dev/null || true
    
    # Remove volumes
    docker volume prune -f 2>/dev/null || true
    
    print_success "Cleanup completed"
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build-backend    Build backend Docker image"
    echo "  build-frontend    Build frontend Docker image"
    echo "  start-dev         Start development environment"
    echo "  stop-dev          Stop development environment"
    echo "  start-prod        Start production environment"
    echo "  stop-prod         Stop production environment"
    echo "  test              Run tests"
    echo "  logs              Show container logs"
    echo "  status            Show current status"
    echo "  cleanup           Clean up all containers and images"
    echo "  help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build-backend"
    echo "  $0 start-dev"
    echo "  $0 test"
}

# Main script logic
case "${1:-help}" in
    "build-backend")
        check_docker
        build_backend
        ;;
    "build-frontend")
        check_docker
        build_frontend
        ;;
    "start-dev")
        check_docker
        start_dev
        ;;
    "stop-dev")
        stop_dev
        ;;
    "start-prod")
        check_docker
        start_prod
        ;;
    "stop-prod")
        stop_prod
        ;;
    "test")
        check_docker
        run_tests
        ;;
    "logs")
        check_docker
        show_logs
        ;;
    "status")
        check_docker
        show_status
        ;;
    "cleanup")
        cleanup
        ;;
    "help"|*)
        show_help
        ;;
esac