module utils.sql_sanitizer;

import std.string;
import std.ascii;
import std.algorithm;

/**
 * Basic SQL Injection Sanitizer
 * WARNING: This is a "Defense in Depth" measure.
 * The real solution is parameterized queries (Prepared Statements).
 * However, for this MVP, we restrict inputs to safe characters.
 */
string sanitizeString(string input) {
    if (input is null) return "";

    // Remove potentially dangerous SQL keywords (simple check)
    string upper = input.toUpper();
    if (upper.canFind("DROP ", "DELETE ", "UPDATE ", "INSERT ", "ALTER ", "TRUNCATE ")) {
        return ""; // Block the input
    }

    // Allow only alphanumeric, spaces, hyphens, and underscores
    return input.filter!(c => isAlphaNum(c) || c == ' ' || c == '-' || c == '_').array.to!string;
}

/**
 * Sanitize category (alphanumeric and dashes)
 */
string sanitizeCategory(string input) {
    if (input is null) return "";
    return input.toLower().filter!(c => isAlphaNum(c) || c == '-').array.to!string;
}

/**
 * Sanitize sort field (whitelist allowed fields to prevent injection)
 */
string sanitizeSortField(string field) {
    string[] allowed = ["created_at", "updated_at", "name", "price", "stock", "category"];
    if (allowed.canFind(field.toLower())) {
        return field;
    }
    return "created_at"; // Default safe fallback
}
