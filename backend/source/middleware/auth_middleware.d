module middleware.auth_middleware;

import vibe.d;
import crypto.jwt_handler;
import models.user;
import std.typecons;

/**
 * Authentication middleware for JWT token validation
 * Provides secure access control to API endpoints
 */

/**
 * JWT authentication middleware
 */
class AuthMiddleware {
    private JWTHandler jwtHandler;
    
    this(JWTHandler jwtHandler) {
        this.jwtHandler = jwtHandler;
    }
    
    /**
     * Require authentication for request
     * Returns true if authenticated, false otherwise
     */
    bool requireAuth(HTTPServerRequest req, HTTPServerResponse res) {
        auto token = JWTHandler.extractTokenFromHeader(req.headers.get("Authorization", ""));
        
        if (token.empty) {
            sendAuthError(res, "Authorization header required", 401);
            return false;
        }
        
        try {
            auto payload = jwtHandler.validateToken(token);
            req.userData["user"] = payload;
            return true;
        } catch (Exception e) {
            sendAuthError(res, "Invalid or expired token", 401);
            return false;
        }
    }
    
    /**
     * Require admin role for request
     */
    bool requireAdmin(HTTPServerRequest req, HTTPServerResponse res) {
        if (!requireAuth(req, res)) {
            return false;
        }
        
        auto payload = req.userData.get("user", JWTPayload.init);
        
        if (payload.role != "admin") {
            sendAuthError(res, "Admin access required", 403);
            return false;
        }
        
        return true;
    }
    
    /**
     * Require moderator or admin role
     */
    bool requireModerator(HTTPServerRequest req, HTTPServerResponse res) {
        if (!requireAuth(req, res)) {
            return false;
        }
        
        auto payload = req.userData.get("user", JWTPayload.init);
        
        if (payload.role != "admin" && payload.role != "moderator") {
            sendAuthError(res, "Moderator access required", 403);
            return false;
        }
        
        return true;
    }
    
    /**
     * Get current user from request
     */
    static JWTPayload getCurrentUser(HTTPServerRequest req) {
        return req.userData.get("user", JWTPayload.init);
    }
    
    /**
     * Check if user owns resource
     */
    bool requireOwnership(HTTPServerRequest req, HTTPServerResponse res, ulong resourceUserId) {
        if (!requireAuth(req, res)) {
            return false;
        }
        
        auto payload = getCurrentUser(req);
        
        // Admin can access all resources
        if (payload.role == "admin") {
            return true;
        }
        
        // User can only access their own resources
        if (payload.userId != resourceUserId) {
            sendAuthError(res, "Access denied: resource ownership required", 403);
            return false;
        }
        
        return true;
    }
    
    /**
     * Send authentication error response
     */
    private void sendAuthError(HTTPServerResponse res, string message, int statusCode) {
        res.statusCode = statusCode;
        res.headers["Content-Type"] = "application/json";
        
        auto errorResponse = [
            "error": message,
            "timestamp": Clock.currTime().toISOExtString(),
            "path": "" // Will be set by caller
        ].toJSON();
        
        res.writeBody(errorResponse.toString());
    }
}

/**
 * Rate limiting middleware for authentication endpoints
 */
class AuthRateLimiter {
    private uint maxAttempts;
    private uint windowMinutes;
    private bool[string] blockedIPs;
    private SysTime[string] lastAttempt;
    private uint[string] attemptCount;
    
    this(uint maxAttempts = 5, uint windowMinutes = 15) {
        this.maxAttempts = maxAttempts;
        this.windowMinutes = windowMinutes;
    }
    
    /**
     * Check if IP is rate limited
     */
    bool isRateLimited(string clientIP) {
        auto now = Clock.currTime();
        
        // Check if IP is permanently blocked
        if (clientIP in blockedIPs && blockedIPs[clientIP]) {
            return true;
        }
        
        // Check attempt window
        if (clientIP in lastAttempt) {
            auto timeSinceLastAttempt = now - lastAttempt[clientIP];
            
            // Reset counter if window expired
            if (timeSinceLastAttempt.totalMinutes > windowMinutes) {
                attemptCount[clientIP] = 0;
                lastAttempt[clientIP] = now;
            }
        }
        
        // Increment attempt count
        attemptCount[clientIP] = (clientIP in attemptCount ? attemptCount[clientIP] : 0) + 1;
        lastAttempt[clientIP] = now;
        
        // Check if exceeded max attempts
        if (attemptCount[clientIP] > maxAttempts) {
            blockedIPs[clientIP] = true;
            return true;
        }
        
        return false;
    }
    
    /**
     * Get remaining attempts
     */
    uint getRemainingAttempts(string clientIP) {
        uint attempts = clientIP in attemptCount ? attemptCount[clientIP] : 0;
        return attempts >= maxAttempts ? 0 : maxAttempts - attempts;
    }
    
    /**
     * Unblock IP address
     */
    void unblockIP(string clientIP) {
        blockedIPs.remove(clientIP);
        attemptCount.remove(clientIP);
        lastAttempt.remove(clientIP);
    }
}