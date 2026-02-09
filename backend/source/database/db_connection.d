module database.db_connection;

import sqlite;
import std.exception;
import std.path;
import std.file;
import config.app_config;

/**
 * Database connection manager with SQLite
 * Provides singleton pattern for database access
 */
class Database {
    private static Database instance;
    private sqlite.Database db;
    private AppConfig config;
    
    private this() {
        config = ConfigManager.load();
        initializeDatabase();
    }
    
    /**
     * Get singleton instance
     */
    static Database getInstance() {
        if (instance is null) {
            instance = new Database();
        }
        return instance;
    }
    
    /**
     * Initialize database and create tables
     */
    private void initializeDatabase() {
        // Ensure data directory exists
        string dataDir = dirName(config.dbPath);
        if (!exists(dataDir)) {
            mkdirRecurse(dataDir);
        }
        
        // Open database connection
        db = sqlite.Database(config.dbPath);
        
        // Enable foreign keys
        db.execute("PRAGMA foreign_keys = ON");
        
        // Create tables
        createTables();
    }
    
    /**
     * Create all database tables
     */
    private void createTables() {
        // Users table
        db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME
            )
        `);
        
        // Products table
        db.execute(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                stock INTEGER DEFAULT 0,
                image_url TEXT,
                category TEXT DEFAULT 'uncategorized',
                slug TEXT UNIQUE NOT NULL,
                is_new BOOLEAN DEFAULT 0,
                is_sale BOOLEAN DEFAULT 0,
                original_price REAL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Orders table
        db.execute(`
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                total REAL NOT NULL,
                status TEXT DEFAULT 'pending',
                stripe_payment_id TEXT,
                customer_email TEXT,
                shipping_address TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        
        // Order items table
        db.execute(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                product_name TEXT NOT NULL,
                product_image TEXT,
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);
        
        // Blog posts table
        db.execute(`
            CREATE TABLE IF NOT EXISTS blog_posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                excerpt TEXT,
                slug TEXT UNIQUE NOT NULL,
                author_id INTEGER,
                author_name TEXT,
                status TEXT DEFAULT 'draft',
                tags TEXT, -- JSON array
                categories TEXT, -- JSON array
                published_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (author_id) REFERENCES users(id)
            )
        `);
        
        // Comments table
        db.execute(`
            CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id INTEGER NOT NULL,
                user_id INTEGER,
                user_name TEXT NOT NULL,
                user_email TEXT NOT NULL,
                content TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                parent_id INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (parent_id) REFERENCES comments(id)
            )
        `);
        
        // Media files table
        db.execute(`
            CREATE TABLE IF NOT EXISTS media_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_name TEXT NOT NULL,
                original_name TEXT NOT NULL,
                file_path TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                mime_type TEXT NOT NULL,
                post_id INTEGER,
                product_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES blog_posts(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);
        
        // Expenses table
        db.execute(`
            CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                description TEXT NOT NULL,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                user_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        
        // Create indexes for performance
        createIndexes();
    }
    
    /**
     * Create database indexes
     */
    private void createIndexes() {
        // Product indexes
        db.execute("CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)");
        db.execute("CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug)");
        db.execute("CREATE INDEX IF NOT EXISTS idx_products_status ON products(is_new, is_sale)");
        
        // Order indexes
        db.execute("CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)");
        db.execute("CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)");
        db.execute("CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)");
        
        // Blog indexes
        db.execute("CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)");
        db.execute("CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status)");
        db.execute("CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id)");
        
        // Comment indexes
        db.execute("CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)");
        db.execute("CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status)");
        db.execute("CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id)");
    }
    
    /**
     * Execute query with parameters
     */
    auto query(T...)(string sql, T args) {
        return db.query(sql, args);
    }
    
    /**
     * Execute non-query statement
     */
    void execute(T...)(string sql, T args) {
        db.execute(sql, args);
    }
    
    /**
     * Get last insert row ID
     */
    ulong lastInsertRowid() {
        return db.lastInsertRowid();
    }
    
    /**
     * Begin transaction
     */
    void beginTransaction() {
        db.execute("BEGIN TRANSACTION");
    }
    
    /**
     * Commit transaction
     */
    void commitTransaction() {
        db.execute("COMMIT");
    }
    
    /**
     * Rollback transaction
     */
    void rollbackTransaction() {
        db.execute("ROLLBACK");
    }
    
    /**
     * Close database connection
     */
    void close() {
        db.close();
    }
}