module middleware.cors_middleware;

import vibe.d;

/**
 * CORS middleware for cross-origin requests
 * Enables proper headers for frontend-backend communication
 */

/**
 * Add CORS headers to response
 */
void addCorsHeaders(HTTPServerRequest req, HTTPServerResponse res) {
    // Allow all origins (configure for production)
    res.headers["Access-Control-Allow-Origin"] = "*";
    
    // Allowed methods
    res.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
    
    // Allowed headers
    res.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With";
    
    // Allow credentials
    res.headers["Access-Control-Allow-Credentials"] = "true";
    
    // Expose headers
    res.headers["Access-Control-Expose-Headers"] = "X-Total-Count, X-Page-Count";
    
    // Max age for preflight requests
    res.headers["Access-Control-Max-Age"] = "86400"; // 24 hours
    
    // Handle preflight requests
    if (req.method == HTTPMethod.OPTIONS) {
        res.statusCode = 200;
        res.writeVoid();
    }
}

/**
 * CORS configuration for different environments
 */
struct CORSConfig {
    string allowedOrigin;
    string[] allowedMethods;
    string[] allowedHeaders;
    bool allowCredentials;
    uint maxAge;
}

/**
 * Get CORS configuration for environment
 */
CORSConfig getCORSConfig(string environment = "development") {
    if (environment == "production") {
        return CORSConfig(
            "https://yourdomain.com", // Configure your domain
            ["GET", "POST", "PUT", "DELETE"],
            ["Content-Type", "Authorization", "X-Requested-With"],
            true,
            86400
        );
    } else {
        return CORSConfig(
            "*",
            ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            ["Content-Type", "Authorization", "X-Requested-With"],
            true,
            86400
        );
    }
}