module source.server;

import vibe.d;
import controllers.product_controller;
import controllers.auth_controller;
import controllers.blog_controller;
import controllers.order_controller;
import middleware.cors_middleware;
import middleware.auth_middleware;
import middleware.license_middleware; // Import License Middleware
import crypto.jwt_handler;
import config.app_config;
import std.stdio;
import std.typecons;

/**
 * Main server application
 * Initializes all components and starts the web server
 */
void main() {
    writeln("🚀 Starting Simple E-Commerce Backend Server...");
    
    try {
        // Load configuration
        auto config = ConfigManager.load();

        // Initialize License Middleware and Check Hardware Lock
        auto licenseMiddleware = new LicenseMiddleware();
        if (!licenseMiddleware.isLicenseValid()) {
            writeln("❌ FATAL: Invalid or missing license key.");
            writeln("ℹ️  HINT: Run 'dub run tools:checkpoint -- --generate' to generate a valid key.");
            writeln("🛑 Server cannot start without a valid license.");
            return; // Halt startup
        }

        // Validate configuration
        if (!ConfigManager.validateConfig(config)) {
            writeln("❌ Invalid configuration. Please check your .env file.");
            return;
        }
        
        // Initialize JWT handler
        auto jwtHandler = new JWTHandler(config.jwtSecret);
        
        // Initialize middleware
        auto authMiddleware = new AuthMiddleware(jwtHandler);
        
        // Setup HTTP server
        auto settings = new HTTPServerSettings;
        settings.port = config.serverPort;
        settings.bindAddresses = ["127.0.0.1"];
        
        // Create URL router
        auto router = new URLRouter;
        
        // Add CORS middleware to all routes
        router.registerMiddleware(&addCorsHeaders);
        
        // Initialize controllers
        auto productController = new ProductController();
        auto authController = new AuthController();
        auto blogController = new BlogController();
        auto orderController = new OrderController();
        
        // Health check endpoint
        router.get("/api/health", (HTTPServerRequest req, HTTPServerResponse res) {
            auto response = [
                "status": "healthy",
                "timestamp": Clock.currTime().toISOExtString(),
                "version": "1.0.0",
                "environment": "development"
            ].toJSON();
            
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
        });
        
        // Authentication routes
        router.post("/api/auth/register", &authController.register);
        router.post("/api/auth/login", &authController.login);
        router.post("/api/auth/refresh", &authController.refreshToken);
        router.get("/api/auth/profile", (HTTPServerRequest req, HTTPServerResponse res) {
            if (authMiddleware.requireAuth(req, res)) {
                authController.getProfile(req, res);
            }
        });
        router.put("/api/auth/profile", (HTTPServerRequest req, HTTPServerResponse res) {
            if (authMiddleware.requireAuth(req, res)) {
                authController.updateProfile(req, res);
            }
        });
        router.post("/api/auth/change-password", (HTTPServerRequest req, HTTPServerResponse res) {
            if (authMiddleware.requireAuth(req, res)) {
                authController.changePassword(req, res);
            }
        });
        router.post("/api/auth/logout", &authController.logout);
        
        // Product routes
        router.get("/api/products", &productController.getProducts);
        router.get("/api/products/featured", &productController.getFeaturedProducts);
        router.get("/api/products/search", &productController.searchProducts);
        router.get("/api/products/category/:category", &productController.getProductsByCategory);
        router.get("/api/products/slug/:slug", &productController.getProductBySlug);
        router.get("/api/products/:id", &productController.getProduct);
        
        // Protected product routes (require authentication AND license)
        router.post("/api/products", (HTTPServerRequest req, HTTPServerResponse res) {
            licenseMiddleware.requireLicense(req, res); // Check License First
            if (authMiddleware.requireModerator(req, res)) {
                productController.createProduct(req, res);
            }
        });
        router.put("/api/products/:id", (HTTPServerRequest req, HTTPServerResponse res) {
            if (authMiddleware.requireModerator(req, res)) {
                productController.updateProduct(req, res);
            }
        });
        router.delete("/api/products/:id", (HTTPServerRequest req, HTTPServerResponse res) {
            if (authMiddleware.requireAdmin(req, res)) {
                productController.deleteProduct(req, res);
            }
        });
        
        // Blog routes
        router.get("/api/blog/posts", &blogController.getPosts);
        router.get("/api/blog/posts/latest", &blogController.getLatestPosts);
        router.get("/api/blog/posts/:id", &blogController.getPost);
        router.get("/api/blog/posts/slug/:slug", &blogController.getPostBySlug);
        router.get("/api/blog/posts/:id/comments", &blogController.getComments);
        router.post("/api/blog/posts/:id/comments", &blogController.createComment);
        router.post("/api/blog/posts", &blogController.createPost);
        router.put("/api/blog/posts/:id", &blogController.updatePost);
        router.delete("/api/blog/posts/:id", &blogController.deletePost);
        
        // Order routes
        router.post("/api/orders", &orderController.createOrder);
        router.get("/api/orders", &orderController.getOrders);
        router.get("/api/orders/:id", &orderController.getOrder);
        router.put("/api/orders/:id/status", &orderController.updateOrderStatus);
        router.post("/api/orders/:id/cancel", &orderController.cancelOrder);
        router.get("/api/orders/stats", &orderController.getOrderStats);
        
        // Start the server
        writeln("✅ Server initialized successfully");
        writeln("🌐 Server running on http://localhost:", settings.port);
        writeln("📊 Health check: http://localhost:", settings.port, "/api/health");
        writeln("🔧 API Documentation: http://localhost:", settings.port, "/api/docs");
        writeln("⏰ Started at: ", Clock.currTime().toISOExtString());
        writeln("🎯 Press Ctrl+C to stop the server");
        writeln();
        
        listenHTTP(settings, router);
        
    } catch (Exception e) {
        writeln("❌ Failed to start server: ", e.msg);
        writeln("📍 Stack trace: ", e.info);
    }
}