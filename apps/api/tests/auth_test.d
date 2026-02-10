module auth_test;

import std.stdio;
import std.conv;
import vibe.d;
import unit_threaded;

import server;
import crypto.jwt_handler;

@("User registration creates new user")
{
    // TODO: Implement test
    // Test POST /api/auth/register creates user record
    // Verify password is hashed
    // Verify JWT is returned
}

@("User login returns valid JWT token")
{
    // TODO: Implement test
    // Test POST /api/auth/login
    // Verify credentials are validated
    // Verify JWT refresh token mechanism works
}

@("JWT token validation rejects invalid tokens")
{
    // TODO: Implement test
    // Test protected endpoints with invalid token
    // Verify 401 Unauthorized response
}

@("Profile endpoint returns user data")
{
    // TODO: Implement test
    // Test GET /api/auth/profile with valid token
    // Verify user data is returned without password
}

@("Password change updates hash")
{
    // TODO: Implement test
    // Test PUT /api/auth/change-password
    // Verify old password is validated
    // Verify new password hash is stored
}
