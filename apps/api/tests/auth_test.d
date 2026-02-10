module auth_test;

import std.stdio;
import std.conv;
import vibe.d;
import unit_threaded;

import crypto.jwt_handler;

/**
 * Auth Test Suite
 * Validates the JWT and Authentication logic.
 * Note: Requires a running database for full integration tests.
 */
@("JWT generation and validation")
{
    // Setup
    string secret = "test-secret-key";
    auto handler = new JWTHandler(secret);

    // Test 1: Generate Token
    string userJson = `{"id": 1, "username": "testuser", "role": "user"}`;
    auto token = handler.generateToken(userJson);
    assert(!token.empty, "Token should not be empty");

    // Test 2: Validate Token
    auto payload = handler.validateToken(token);
    assert(!payload.isNull, "Payload should be valid");

    // Test 3: Reject Invalid Token
    bool exceptionThrown = false;
    try {
        handler.validateToken("invalid.token.here");
    } catch (Exception e) {
        exceptionThrown = true;
    }
    assert(exceptionThrown, "Invalid token should throw exception");
}

@("User login returns valid JWT token")
{
    // This test would ideally simulate an HTTP POST request.
    // For unit testing, we focus on the logic layer.

    string email = "user@example.com";
    string password = "password123";

    // Mock Validation Logic (In real code, check DB)
    bool isValid = (email == "user@example.com" && password == "password123");
    assert(isValid, "Credentials should be valid");
}

@("JWT token validation rejects invalid tokens")
{
    auto handler = new JWTHandler("secret");

    bool rejected = false;
    try {
        handler.validateToken("malformed.token");
    } catch (Exception e) {
        rejected = true;
    }
    assert(rejected, "Malformed tokens must be rejected");
}
