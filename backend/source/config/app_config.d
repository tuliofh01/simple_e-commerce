module config.app_config;

import std.json;
import std.file;
import std.path;
import std.string;
import std.conv;

/**
 * Application configuration structure
 */
struct AppConfig {
    string jwtSecret;
    string dbPath;
    string uploadDir;
    uint serverPort;
    string stripeSecretKey;
    string stripePublishableKey;
    string smtpHost;
    uint smtpPort;
    string smtpUser;
    string smtpPassword;
    string hcaptchaSecret;
}

/**
 * Configuration manager for environment variables
 */
class ConfigManager {
    private static AppConfig config;
    private static string configPath = ".env";
    
    /**
     * Load configuration from environment file
     */
    static AppConfig load() {
        if (config == AppConfig.init) {
            config = parseConfigFile();
        }
        return config;
    }
    
    /**
     * Parse configuration file
     */
    private static AppConfig parseConfigFile() {
        auto appConfig = AppConfig(
            "default-jwt-secret-change-me-in-production",
            "data/database.db",
            "uploads/",
            8080,
            "", // Stripe secret
            "", // Stripe publishable
            "", // SMTP host
            587, // SMTP port
            "", // SMTP user
            "", // SMTP password
            ""  // hCaptcha secret
        );
        
        if (exists(configPath)) {
            auto content = read(configPath);
            foreach (line; content.split('\n')) {
                line = line.strip();
                if (line.empty || line.startsWith('#')) continue;
                
                auto parts = line.split('=');
                if (parts.length == 2) {
                    auto key = parts[0].strip();
                    auto value = parts[1].strip();
                    
                    switch (key) {
                        case "JWT_SECRET": appConfig.jwtSecret = value; break;
                        case "DB_PATH": appConfig.dbPath = value; break;
                        case "UPLOAD_DIR": appConfig.uploadDir = value; break;
                        case "SERVER_PORT": appConfig.serverPort = value.to!uint; break;
                        case "STRIPE_SECRET_KEY": appConfig.stripeSecretKey = value; break;
                        case "STRIPE_PUBLISHABLE_KEY": appConfig.stripePublishableKey = value; break;
                        case "SMTP_HOST": appConfig.smtpHost = value; break;
                        case "SMTP_PORT": appConfig.smtpPort = value.to!uint; break;
                        case "SMTP_USER": appConfig.smtpUser = value; break;
                        case "SMTP_PASSWORD": appConfig.smtpPassword = value; break;
                        case "HCAPTCHA_SECRET": appConfig.hcaptchaSecret = value; break;
                        default: break;
                    }
                }
            }
        }
        
        return appConfig;
    }
    
    /**
     * Save configuration to file
     */
    static void saveConfig(AppConfig newConfig) {
        auto content = `
# Simple E-Commerce Backend Configuration
JWT_SECRET=${newConfig.jwtSecret}
DB_PATH=${newConfig.dbPath}
UPLOAD_DIR=${newConfig.uploadDir}
SERVER_PORT=${newConfig.serverPort}
STRIPE_SECRET_KEY=${newConfig.stripeSecretKey}
STRIPE_PUBLISHABLE_KEY=${newConfig.stripePublishableKey}
SMTP_HOST=${newConfig.smtpHost}
SMTP_PORT=${newConfig.smtpPort}
SMTP_USER=${newConfig.smtpUser}
SMTP_PASSWORD=${newConfig.smtpPassword}
HCAPTCHA_SECRET=${newConfig.hcaptchaSecret}
`;
        
        write(configPath, content.strip());
        config = newConfig;
    }
    
    /**
     * Get environment variable or default
     */
    static string getEnv(string key, string defaultValue = "") {
        import std.process;
        auto envValue = environment.get(key);
        return envValue.empty ? defaultValue : envValue;
    }
    
    /**
     * Check if configuration is valid
     */
    static bool validateConfig(AppConfig config) {
        // Check required fields
        if (config.jwtSecret == "default-jwt-secret-change-me-in-production") {
            return false;
        }
        
        if (config.serverPort == 0) {
            return false;
        }
        
        return true;
    }
}