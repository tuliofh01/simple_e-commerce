module middleware.license_middleware;

import vibe.d;
import config.app_config;
import std.stdio;
import std.file;
import std.conv;
import std.string;
import std.digest.sha;
import std.base64;

/**
 * Hardware-Deterministic License Middleware
 * Ensures the API only runs on authorized machines.
 */
class LicenseMiddleware {
    private ConfigManager configManager;

    this() {
        configManager = ConfigManager.load();
    }

    /**
     * Check if the license is valid for the current machine.
     * Returns true if valid, false otherwise.
     */
    bool isLicenseValid() {
        auto config = configManager.load();
        if (config.licenseKey.empty) {
            writeln("[LICENSE] No license key found.");
            return false;
        }

        string machineId = getMachineId();
        string expectedKey = generateLicenseKey(machineId, config.projectSalt);

        if (expectedKey == config.licenseKey) {
            writeln("[LICENSE] Valid license for machine: ", machineId);
            return true;
        } else {
            writeln("[LICENSE] Invalid license key. Expected: ", expectedKey, " Got: ", config.licenseKey);
            return false;
        }
    }

    /**
     * Interceptor function for Vibe.d routes.
     * Blocks requests if the license is invalid.
     */
    void requireLicense(HTTPServerRequest req, HTTPServerResponse res) {
        if (!isLicenseValid()) {
            res.statusCode = 403; // Forbidden
            res.headers["Content-Type"] = "application/json";
            auto errorResponse = [
                "error": "Invalid or missing license key.",
                "message": "Please run 'tools/bin/project-checkpoint --generate' to generate a valid key."
            ].toJSON();
            res.writeBody(errorResponse.toString());
            res.sendClose = true;
        }
    }

    /**
     * Get the unique machine ID.
     * Tries /etc/machine-id first, falls back to SHA256 of hostname.
     */
    private string getMachineId() {
        try {
            if (exists("/etc/machine-id")) {
                return readText("/etc/machine-id").strip();
            }
        } catch (Exception e) {
            // Fallback
        }

        import std.process;
        auto hostname = environment.get("HOSTNAME", "unknown");
        return toHexString(sha256Of(hostname));
    }

    /**
     * Generate a deterministic license key.
     * Logic: SHA256(MachineID + ProjectSalt)
     */
    private string generateLicenseKey(string machineId, string salt) {
        string combined = machineId ~ salt;
        auto hash = sha256Of(combined);
        string hexHash = toHexString(hash);

        // Format as XXXX-XXXX-XXXX-XXXX
        return format("%s-%s-%s-%s",
            hexHash[0..4],
            hexHash[4..8],
            hexHash[8..12],
            hexHash[12..16]
        );
    }
}
