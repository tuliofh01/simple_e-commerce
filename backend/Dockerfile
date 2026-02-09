# Backend Dockerfile
FROM dlang/dmd:alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache sqlite-dev openssl-dev

# Copy dependency files
COPY dub.json dub.selections.json ./
COPY source/ ./source/

# Build the application
RUN dub build --build=release

# Create data directory
RUN mkdir -p data uploads

# Copy configuration template
COPY .env.example .env

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Run the application
CMD ["./bin/simple_ecommerce"]