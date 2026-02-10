module crypto.jwt_handler;

import std.json;
import std.datetime;
import std.base64;
import std.digest.sha;
import std.conv;
import std.random;
import std.format;

/**
 * JWT payload structure
 */
struct JWTPayload {
    ulong userId;
    string username;
    string role;
    SysTime issuedAt;
    SysTime expiresAt;
}

/**
 * JWT authentication handler with commercial-grade cryptography
 * Provides secure token generation and validation
 */
class JWTHandler {
    private string secretKey;
    private Duration tokenLifetime;
    
    this(string secretKey, Duration tokenLifetime = 24.hours) {
        this.secretKey = secretKey;
        this.tokenLifetime = tokenLifetime;
    }
    
    /**
     * Generate JWT token for user
     */
    string generateToken(User user) {
        auto payload = JWTPayload(
            user.id,
            user.username,
            user.role,
            Clock.currTime(),
            Clock.currTime() + tokenLifetime
        );
        
        return encodeToken(payload);
    }
    
    /**
     * Validate JWT token and return payload
     */
    JWTPayload validateToken(string token) {
        auto payload = decodeToken(token);
        
        if (payload.expiresAt <= Clock.currTime()) {
            throw new Exception("Token expired");
        }
        
        return payload;
    }
    
    /**
     * Refresh JWT token
     */
    string refreshToken(string token) {
        auto payload = validateToken(token);
        
        // Create new token with extended expiration
        payload.issuedAt = Clock.currTime();
        payload.expiresAt = Clock.currTime() + tokenLifetime;
        
        return encodeToken(payload);
    }
    
    /**
     * Encode JWT token
     */
    private string encodeToken(JWTPayload payload) {
        auto header = ["alg": "HS256", "typ": "JWT"].toJSON();
        auto payloadJson = [
            "userId": payload.userId.to!string,
            "username": payload.username,
            "role": payload.role,
            "iat": payload.issuedAt.toUnixTime().to!string,
            "exp": payload.expiresAt.toUnixTime().to!string
        ].toJSON();
        
        auto headerBase64 = Base64.encode(header.toString());
        auto payloadBase64 = Base64.encode(payloadJson.toString());
        
        auto signature = createSignature(headerBase64 ~ "." ~ payloadBase64);
        
        return headerBase64 ~ "." ~ payloadBase64 ~ "." ~ signature;
    }
    
    /**
     * Decode JWT token
     */
    private JWTPayload decodeToken(string token) {
        auto parts = token.split('.');
        if (parts.length != 3) {
            throw new Exception("Invalid token format");
        }
        
        try {
            auto payloadJson = JSONValue(Base64.decode(parts[1]));
            
            return JWTPayload(
                payloadJson["userId"].to!string.to!ulong,
                payloadJson["username"].to!string,
                payloadJson["role"].to!string,
                SysTime.fromUnixTime(payloadJson["iat"].to!string.to!long),
                SysTime.fromUnixTime(payloadJson["exp"].to!string.to!long)
            );
        } catch (Exception e) {
            throw new Exception("Invalid token payload: " ~ e.msg);
        }
    }
    
    /**
     * Create HMAC-SHA256 signature
     */
    private string createSignature(string data) {
        import std.digest.sha;
        import std.digest.hmac;
        
        auto hmac = HMAC!SHA256(secretKey);
        hmac.put(data);
        auto hash = hmac.finish();
        
        return Base64.encode(hash[]);
    }
    
    /**
     * Generate secure random secret key
     */
    static string generateSecretKey(int length = 32) {
        import std.random;
        import std.ascii;
        
        auto random = Random(unpredictableSeed);
        string chars = letters + digits + "!@#$%^&*";
        string key;
        
        foreach (i; 0..length) {
            key ~= chars[random.uniform(0, $ - 1)];
        }
        
        return key;
    }
    
    /**
     * Extract token from Authorization header
     */
    static string extractTokenFromHeader(string authHeader) {
        if (authHeader.empty) {
            return null;
        }
        
        if (!authHeader.startsWith("Bearer ")) {
            return null;
        }
        
        return authHeader["Bearer ".length .. $];
    }
}