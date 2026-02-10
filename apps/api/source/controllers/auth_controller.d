module controllers.auth_controller;

import vibe.d;
import models.user;
import crypto.jwt_handler;
import database.db_connection;
import middleware.auth_middleware;
import std.typecons;
import std.digest.sha;
import std.random;
import std.ascii;

/**
 * Authentication controller with JWT support
 * Handles user registration, login, and token management
 */
class AuthController {
    private Database db;
    private JWTHandler jwtHandler;
    private AuthRateLimiter rateLimiter;
    
    this() {
        db = Database.getInstance();
        auto config = ConfigManager.load();
        jwtHandler = new JWTHandler(config.jwtSecret);
        rateLimiter = new AuthRateLimiter();
    }
    
    /**
     * User registration
     * POST /api/auth/register
     */
    void register(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto clientIP = req.remoteAddress;
            
            // Check rate limiting
            if (rateLimiter.isRateLimited(clientIP)) {
                sendError(res, "Too many registration attempts. Please try again later.", 429);
                return;
            }
            
            auto registerData = req.jsonBody!RegisterRequest;
            
            // Validate registration data
            validateRegistrationData(registerData);
            
            // Check if username already exists
            if (userExistsByUsername(registerData.username)) {
                sendError(res, "Username already exists", 409);
                return;
            }
            
            // Check if email already exists
            if (userExistsByEmail(registerData.email)) {
                sendError(res, "Email already exists", 409);
                return;
            }
            
            // Hash password
            string passwordHash = hashPassword(registerData.password);
            
            // Create user
            auto user = User.fresh(registerData.username, registerData.email, registerData.role);
            
            // Insert user into database
            db.execute(`
                INSERT INTO users (username, email, password_hash, role) 
                VALUES (?, ?, ?, ?)
            `, user.username, user.email, passwordHash, user.role);
            
            // Get created user ID
            user.id = db.lastInsertRowid();
            
            // Generate JWT token
            auto token = jwtHandler.generateToken(user);
            
            // Build response
            auto authResponse = AuthResponse(
                token,
                user,
                Clock.currTime() + 24.hours
            );
            
            res.statusCode = 201;
            auto response = authResponse.toJSON();
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Registration failed: " ~ e.msg, 500);
        }
    }
    
    /**
     * User login
     * POST /api/auth/login
     */
    void login(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto clientIP = req.remoteAddress;
            
            // Check rate limiting
            if (rateLimiter.isRateLimited(clientIP)) {
                sendError(res, "Too many login attempts. Please try again later.", 429);
                return;
            }
            
            auto loginData = req.jsonBody!LoginRequest;
            
            // Validate login data
            validateLoginData(loginData);
            
            // Find user by username
            auto user = findUserByUsername(loginData.username);
            if (user.isNull) {
                sendError(res, "Invalid username or password", 401);
                return;
            }
            
            // Verify password
            if (!verifyPassword(loginData.password, user.get.passwordHash)) {
                sendError(res, "Invalid username or password", 401);
                return;
            }
            
            // Update last login
            updateLastLogin(user.get.id);
            
            // Generate JWT token
            auto token = jwtHandler.generateToken(user.get);
            
            // Build response
            auto authResponse = AuthResponse(
                token,
                user.get,
                Clock.currTime() + 24.hours
            );
            
            auto response = authResponse.toJSON();
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Login failed: " ~ e.msg, 500);
        }
    }
    
    /**
     * Refresh JWT token
     * POST /api/auth/refresh
     */
    void refreshToken(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto token = JWTHandler.extractTokenFromHeader(req.headers.get("Authorization", ""));
            
            if (token.empty) {
                sendError(res, "Token required", 401);
                return;
            }
            
            // Validate and refresh token
            auto newToken = jwtHandler.refreshToken(token);
            
            auto response = [
                "token": newToken,
                "expiresAt": (Clock.currTime() + 24.hours).toISOExtString()
            ].toJSON();
            
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Token refresh failed: " ~ e.msg, 401);
        }
    }
    
    /**
     * Get current user profile
     * GET /api/auth/profile
     */
    void getProfile(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto payload = AuthMiddleware.getCurrentUser(req);
            auto user = findUserById(payload.userId);
            
            if (user.isNull) {
                sendError(res, "User not found", 404);
                return;
            }
            
            // Remove sensitive data
            auto userProfile = User(
                user.get.id,
                user.get.username,
                user.get.email,
                user.get.role,
                user.get.createdAt,
                user.get.lastLogin
            );
            
            auto response = userProfile.toJSON();
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Failed to get profile: " ~ e.msg, 500);
        }
    }
    
    /**
     * Update user profile
     * PUT /api/auth/profile
     */
    void updateProfile(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto payload = AuthMiddleware.getCurrentUser(req);
            auto updateData = req.jsonBody!UpdateProfileRequest;
            
            // Validate update data
            validateUpdateData(updateData);
            
            // Check if email is being changed and if it already exists
            if (!updateData.email.empty && updateData.email != getCurrentEmail(payload.userId)) {
                if (userExistsByEmail(updateData.email)) {
                    sendError(res, "Email already exists", 409);
                    return;
                }
            }
            
            // Update user
            string sql = "UPDATE users SET ";
            if (!updateData.email.empty) sql ~= "email = ?, ";
            if (!updateData.username.empty) sql ~= "username = ?, ";
            sql = sql[0..$-2] ~ " WHERE id = ?";
            
            // Build parameters
            string[] params;
            if (!updateData.email.empty) params ~= updateData.email;
            if (!updateData.username.empty) params ~= updateData.username;
            params ~= payload.userId.to!string;
            
            db.execute(sql, params);
            
            // Get updated user
            auto user = findUserById(payload.userId);
            
            auto response = user.get.toJSON();
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Failed to update profile: " ~ e.msg, 500);
        }
    }
    
    /**
     * Change password
     * POST /api/auth/change-password
     */
    void changePassword(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto payload = AuthMiddleware.getCurrentUser(req);
            auto changeData = req.jsonBody!ChangePasswordRequest;
            
            // Validate change password data
            validateChangePasswordData(changeData);
            
            // Get current user
            auto user = findUserById(payload.userId);
            if (user.isNull) {
                sendError(res, "User not found", 404);
                return;
            }
            
            // Verify current password
            if (!verifyPassword(changeData.currentPassword, user.get.passwordHash)) {
                sendError(res, "Current password is incorrect", 401);
                return;
            }
            
            // Hash new password
            string newPasswordHash = hashPassword(changeData.newPassword);
            
            // Update password
            db.execute("UPDATE users SET password_hash = ? WHERE id = ?", 
                      newPasswordHash, payload.userId);
            
            auto response = [
                "message": "Password changed successfully"
            ].toJSON();
            
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Failed to change password: " ~ e.msg, 500);
        }
    }
    
    /**
     * Logout (client-side token invalidation)
     * POST /api/auth/logout
     */
    void logout(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            // In a stateless JWT system, logout is handled client-side
            // by simply removing the token from storage
            auto response = [
                "message": "Logout successful"
            ].toJSON();
            
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Logout failed: " ~ e.msg, 500);
        }
    }
    
    /**
     * Hash password using SHA-256 with salt
     */
    private string hashPassword(string password) {
        import std.digest.sha;
        import std.digest.hmac;
        import std.random;
        import std.base64;
        import std.format;
        
        // Generate random salt
        auto random = Random(unpredictableSeed);
        string salt;
        foreach (i; 0..16) {
            salt ~= letters[random.uniform(0, $ - 1)];
        }
        
        // Hash password with salt
        auto hmac = HMAC!SHA256(salt);
        hmac.put(password);
        auto hash = hmac.finish();
        
        // Return salt + hash (base64 encoded)
        return Base64.encode(salt ~ hash[]);
    }
    
    /**
     * Verify password against hash
     */
    private bool verifyPassword(string password, string hashedPassword) {
        import std.digest.sha;
        import std.digest.hmac;
        import std.base64;
        
        try {
            // Decode salt + hash
            auto decoded = Base64.decode(hashedPassword);
            if (decoded.length < 16) return false;
            
            string salt = cast(string) decoded[0..16];
            auto storedHash = decoded[16..$];
            
            // Hash password with extracted salt
            auto hmac = HMAC!SHA256(salt);
            hmac.put(password);
            auto computedHash = hmac.finish();
            
            // Compare hashes
            return computedHash[] == storedHash;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Check if user exists by username
     */
    private bool userExistsByUsername(string username) {
        auto result = db.query("SELECT id FROM users WHERE username = ?", username);
        return !result.empty;
    }
    
    /**
     * Check if user exists by email
     */
    private bool userExistsByEmail(string email) {
        auto result = db.query("SELECT id FROM users WHERE email = ?", email);
        return !result.empty;
    }
    
    /**
     * Find user by username
     */
    private Nullable!User findUserByUsername(string username) {
        auto result = db.query(`
            SELECT id, username, email, role, created_at, last_login 
            FROM users WHERE username = ?
        `, username).array!User;
        
        return result.empty ? Nullable!User.init : Nullable!User(result[0]);
    }
    
    /**
     * Find user by ID
     */
    private Nullable!User findUserById(ulong userId) {
        auto result = db.query(`
            SELECT id, username, email, role, created_at, last_login 
            FROM users WHERE id = ?
        `, userId).array!User;
        
        return result.empty ? Nullable!User.init : Nullable!User(result[0]);
    }
    
    /**
     * Get current email for user
     */
    private string getCurrentEmail(ulong userId) {
        auto result = db.query("SELECT email FROM users WHERE id = ?", userId);
        return result.empty ? "" : result.front["email"].to!string;
    }
    
    /**
     * Update last login timestamp
     */
    private void updateLastLogin(ulong userId) {
        db.execute("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", userId);
    }
    
    /**
     * Validate registration data
     */
    private void validateRegistrationData(RegisterRequest data) {
        import std.exception;
        
        if (data.username.empty || data.username.strip().empty) {
            throw new Exception("Username is required");
        }
        
        if (data.username.length < 3) {
            throw new Exception("Username must be at least 3 characters");
        }
        
        if (data.username.length > 50) {
            throw new Exception("Username too long (max 50 characters)");
        }
        
        if (data.email.empty || !isValidEmail(data.email)) {
            throw new Exception("Valid email is required");
        }
        
        if (data.password.empty || data.password.length < 8) {
            throw new Exception("Password must be at least 8 characters");
        }
        
        if (data.role.empty) {
            data.role = "user";
        }
    }
    
    /**
     * Validate login data
     */
    private void validateLoginData(LoginRequest data) {
        import std.exception;
        
        if (data.username.empty || data.password.empty) {
            throw new Exception("Username and password are required");
        }
    }
    
    /**
     * Validate update data
     */
    private void validateUpdateData(UpdateProfileRequest data) {
        import std.exception;
        
        if (!data.email.empty && !isValidEmail(data.email)) {
            throw new Exception("Valid email is required");
        }
        
        if (!data.username.empty && data.username.length < 3) {
            throw new Exception("Username must be at least 3 characters");
        }
    }
    
    /**
     * Validate change password data
     */
    private void validateChangePasswordData(ChangePasswordRequest data) {
        import std.exception;
        
        if (data.currentPassword.empty || data.newPassword.empty) {
            throw new Exception("Current and new passwords are required");
        }
        
        if (data.newPassword.length < 8) {
            throw new Exception("New password must be at least 8 characters");
        }
        
        if (data.newPassword != data.confirmPassword) {
            throw new Exception("New passwords do not match");
        }
    }
    
    /**
     * Basic email validation
     */
    private bool isValidEmail(string email) {
        import std.regex;
        auto emailRegex = regex(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$");
        return !matchFirst(email, emailRegex).empty;
    }
    
    /**
     * Send error response
     */
    private void sendError(HTTPServerResponse res, string message, int statusCode) {
        res.statusCode = statusCode;
        res.headers["Content-Type"] = "application/json";
        
        auto errorResponse = [
            "error": message,
            "timestamp": Clock.currTime().toISOExtString()
        ].toJSON();
        
        res.writeBody(errorResponse.toString());
    }
}

/**
 * Registration request structure
 */
struct RegisterRequest {
    string username;
    string email;
    string password;
    string role = "user";
}

/**
 * Update profile request structure
 */
struct UpdateProfileRequest {
    string username;
    string email;
}

/**
 * Change password request structure
 */
struct ChangePasswordRequest {
    string currentPassword;
    string newPassword;
    string confirmPassword;
}