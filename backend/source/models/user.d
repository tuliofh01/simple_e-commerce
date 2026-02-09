module models.user;

import std.datetime;

/**
 * User entity with authentication support
 * Represents system users with roles and permissions
 */
struct User {
    ulong id;
    string username;
    string email;
    string role;
    DateTime createdAt;
    DateTime lastLogin;
    
    /**
     * Check if user is admin
     */
    bool isAdmin() const {
        return role == "admin";
    }
    
    /**
     * Check if user is moderator
     */
    bool isModerator() const {
        return role == "moderator" || isAdmin();
    }
    
    /**
     * Create fresh user with defaults
     */
    static User fresh(string username, string email, string role = "user") {
        return User(
            0, // New ID
            username,
            email,
            role,
            Clock.currTime(),
            SysTime.init // No last login yet
        );
    }
}

/**
 * Login request structure
 */
struct LoginRequest {
    string username;
    string password;
}

/**
 * Authentication response structure
 */
struct AuthResponse {
    string token;
    User user;
    DateTime expiresAt;
}