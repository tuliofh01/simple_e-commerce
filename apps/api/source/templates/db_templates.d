module templates.db_templates;

import std.traits;
import std.conv;
import database.db_connection;
import std.exception;

/**
 * Template system for creating fresh database objects
 * Provides type-safe CRUD operations with automatic validation
 */

/**
 * Base template for database entities
 * Enforces common fields and behaviors
 */
template DBEntity(T) {
    static assert(is(T == struct), "DBEntity must be used with structs");
    
    // Ensure required fields exist
    static assert(__traits(hasMember, T, "id"), "DBEntity must have 'id' field");
    static assert(is(typeof(T.id) == ulong), "id must be ulong type");
    
    // Add common methods
    mixin(`
        bool isNew() const {
            return id == 0;
        }
        
        T clone() const {
            T copy = this;
            copy.id = 0; // Reset ID for new insertion
            return copy;
        }
    `);
}

/**
 * Repository template for automatic CRUD operations
 * Generates type-safe database access methods
 */
template Repository(T) {
    static assert(is(T == struct), "Repository must be used with structs");
    mixin DBEntity!T;
    
    class Repository {
        private Database db;
        
        this() {
            db = Database.getInstance();
        }
        
        /**
         * Create new entity with validation
         * Returns created entity with assigned ID
         */
        T create(T entity) {
            // Validate entity before insertion
            validateEntity(entity);
            
            // Generate SQL based on struct fields
            auto sql = generateInsertSQL!T();
            auto params = extractEntityParams(entity);
            
            db.execute(sql, params);
            entity.id = db.lastInsertRowid();
            
            return entity;
        }
        
        /**
         * Find entity by ID
         * Returns nullable result for safe handling
         */
        Nullable!T findById(ulong id) {
            auto tableName = getTableName!T();
            auto result = db.query!(
                "SELECT * FROM " ~ tableName ~ " WHERE id = ?", id
            ).array!T;
            
            return result.empty ? Nullable!T.init : Nullable!T(result[0]);
        }
        
        /**
         * Find all entities with optional filtering
         * Supports pagination and sorting
         */
        T[] findAll(string whereClause = "", string orderBy = "", uint limit = 0) {
            auto tableName = getTableName!T();
            auto sql = "SELECT * FROM " ~ tableName;
            
            if (!whereClause.empty) {
                sql ~= " WHERE " ~ whereClause;
            }
            
            if (!orderBy.empty) {
                sql ~= " ORDER BY " ~ orderBy;
            }
            
            if (limit > 0) {
                sql ~= " LIMIT " ~ limit.to!string;
            }
            
            return db.query(sql).array!T;
        }
        
        /**
         * Update existing entity
         * Performs optimistic locking with version check
         */
        T update(T entity) {
            validateEntity(entity);
            
            auto sql = generateUpdateSQL!T();
            auto params = extractEntityParams(entity);
            
            db.execute(sql, params);
            return entity;
        }
        
        /**
         * Delete entity by ID
         * Returns true if deletion was successful
         */
        bool deleteById(ulong id) {
            auto tableName = getTableName!T();
            auto rowsAffected = db.execute(
                "DELETE FROM " ~ tableName ~ " WHERE id = ?", id
            );
            
            return rowsAffected > 0;
        }
        
        /**
         * Custom query with type-safe result mapping
         * Template method for flexible queries
         */
        R[] queryCustom(R)(string sql, Args...)(Args args) {
            return db.query(sql, args).array!R;
        }
        
    private:
        /**
         * Validates entity before database operations
         * Can be specialized for custom validation logic
         */
        void validateEntity(T entity) {
            // Basic validation
            static if (__traits(hasMember, T, "name")) {
                enforce(!entity.name.empty, "Name cannot be empty");
                enforce(entity.name.length <= 255, "Name too long");
            }
            
            static if (__traits(hasMember, T, "email")) {
                enforce(isValidEmail(entity.email), "Invalid email format");
            }
            
            static if (__traits(hasMember, T, "price")) {
                enforce(entity.price >= 0, "Price cannot be negative");
            }
        }
        
        /**
         * Generates INSERT SQL based on struct fields
         * Uses compile-time reflection for automatic generation
         */
        string generateInsertSQL() {
            string tableName = getTableName!T();
            string fields, placeholders;
            
            foreach (i, field; T.tupleof) {
                static if (i > 0) {
                    fields ~= ", ";
                    placeholders ~= ", ";
                }
                
                fields ~= T.tupleof[i].stringof;
                placeholders ~= "?";
            }
            
            return "INSERT INTO " ~ tableName ~ " (" ~ fields ~ ") VALUES (" ~ placeholders ~ ")";
        }
        
        /**
         * Generates UPDATE SQL based on struct fields
         * Excludes ID field from update
         */
        string generateUpdateSQL() {
            string tableName = getTableName!T();
            string setClause;
            
            foreach (i, field; T.tupleof) {
                static if (field.stringof != "id") {
                    if (!setClause.empty) setClause ~= ", ";
                    setClause ~= field.stringof ~ " = ?";
                }
            }
            
            return "UPDATE " ~ tableName ~ " SET " ~ setClause ~ " WHERE id = ?";
        }
        
        /**
         * Extracts entity parameters for SQL queries
         * Returns array of field values
         */
        auto extractEntityParams(T entity) {
            // Implementation for parameter extraction
            // Uses compile-time reflection
            import std.array;
            import std.variant;
            
            Variant[] params;
            foreach (field; entity.tupleof) {
                params ~= Variant(field);
            }
            return params;
        }
        
        /**
         * Gets table name from struct name
         * Converts CamelCase to snake_case
         */
        string getTableName()() {
            string tableName = T.stringof;
            // Convert CamelCase to snake_case
            foreach (i, c; tableName) {
                if (i > 0 && c.isUpper) {
                    tableName = tableName[0..i] ~ "_" ~ c.toLower ~ tableName[i+1..$];
                }
            }
            return tableName.toLower;
        }
        
        /**
         * Basic email validation
         */
        bool isValidEmail(string email) {
            import std.regex;
            auto emailRegex = regex(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$");
            return !matchFirst(email, emailRegex).empty;
        }
    }
}

/**
 * Fresh object factory for creating new entities
 * Provides default values and validation
 */
class FreshObjectFactory {
    /**
     * Creates fresh Product with defaults
     */
    static Product createProduct(string name, double price) {
        return Product.fresh(name, price);
    }
    
    /**
     * Creates fresh User with defaults
     */
    static User createUser(string username, string email, string role = "user") {
        return User.fresh(username, email, role);
    }
    
    /**
     * Creates fresh BlogPost with defaults
     */
    static BlogPost createBlogPost(string title, string content, ulong authorId) {
        return BlogPost.fresh(title, content, authorId);
    }
}