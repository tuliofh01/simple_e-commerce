module controllers.product_controller;

import vibe.d;
import models.product;
import templates.db_templates;
import database.db_connection;
import std.typecons;

/**
 * Product controller with CRUD operations
 * Handles all product-related API endpoints
 */
class ProductController {
    private Database db;
    private Repository!Product productRepo;
    
    this() {
        db = Database.getInstance();
        productRepo = new Repository!Product();
    }
    
    /**
     * Get all products with optional filtering
     * GET /api/products
     */
    void getProducts(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            // Parse query parameters
            string category = req.query.get("category", "");
            string search = req.query.get("search", "");
            string sortBy = req.query.get("sort", "created_at");
            string sortOrder = req.query.get("order", "desc");
            uint page = req.query.get("page", "1").to!uint;
            uint limit = req.query.get("limit", "20").to!uint;
            
            // Build where clause
            string whereClause = "";
            if (!category.empty) {
                whereClause = "category = '" ~ category ~ "'";
            }
            
            if (!search.empty) {
                if (!whereClause.empty) whereClause ~= " AND ";
                whereClause ~= "name LIKE '%" ~ search ~ "%' OR description LIKE '%" ~ search ~ "%'";
            }
            
            // Build order clause
            string orderClause = sortBy ~ " " ~ sortOrder;
            
            // Calculate offset
            uint offset = (page - 1) * limit;
            
            // Get products
            auto products = productRepo.findAll(whereClause, orderClause, limit);
            
            // Get total count for pagination
            auto totalCount = getTotalCount(whereClause);
            
            // Build response
            auto response = [
                "products": products,
                "pagination": [
                    "page": page,
                    "limit": limit,
                    "total": totalCount,
                    "totalPages": (totalCount + limit - 1) / limit
                ]
            ].toJSON();
            
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Failed to fetch products: " ~ e.msg, 500);
        }
    }
    
    /**
     * Get single product by ID
     * GET /api/products/:id
     */
    void getProduct(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto id = req.params["id"].to!ulong;
            auto product = productRepo.findById(id);
            
            if (product.isNull) {
                sendError(res, "Product not found", 404);
                return;
            }
            
            auto response = product.get.toJSON();
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Failed to fetch product: " ~ e.msg, 500);
        }
    }
    
    /**
     * Get product by slug
     * GET /api/products/slug/:slug
     */
    void getProductBySlug(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto slug = req.params["slug"];
            auto products = productRepo.findAll("slug = '" ~ slug ~ "'");
            
            if (products.empty) {
                sendError(res, "Product not found", 404);
                return;
            }
            
            auto response = products[0].toJSON();
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Failed to fetch product: " ~ e.msg, 500);
        }
    }
    
    /**
     * Create new product
     * POST /api/products
     */
    void createProduct(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto productData = req.jsonBody!Product;
            
            // Validate product data
            validateProduct(productData);
            
            // Create product
            auto created = productRepo.create(productData);
            
            res.statusCode = 201;
            auto response = created.toJSON();
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Failed to create product: " ~ e.msg, 500);
        }
    }
    
    /**
     * Update existing product
     * PUT /api/products/:id
     */
    void updateProduct(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto id = req.params["id"].to!ulong;
            auto productData = req.jsonBody!Product;
            
            // Ensure ID matches
            productData.id = id;
            
            // Validate product data
            validateProduct(productData);
            
            // Update product
            auto updated = productRepo.update(productData);
            
            auto response = updated.toJSON();
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Failed to update product: " ~ e.msg, 500);
        }
    }
    
    /**
     * Delete product
     * DELETE /api/products/:id
     */
    void deleteProduct(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto id = req.params["id"].to!ulong;
            
            // Check if product exists
            auto product = productRepo.findById(id);
            if (product.isNull) {
                sendError(res, "Product not found", 404);
                return;
            }
            
            // Delete product
            bool deleted = productRepo.deleteById(id);
            
            if (deleted) {
                res.statusCode = 204;
                res.writeVoid();
            } else {
                sendError(res, "Failed to delete product", 500);
            }
            
        } catch (Exception e) {
            sendError(res, "Failed to delete product: " ~ e.msg, 500);
        }
    }
    
    /**
     * Get featured products
     * GET /api/products/featured
     */
    void getFeaturedProducts(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            uint limit = req.query.get("limit", "8").to!uint;
            
            auto products = productRepo.findAll(
                "is_new = 1 OR is_sale = 1", 
                "created_at DESC", 
                limit
            );
            
            auto response = [
                "products": products,
                "count": products.length
            ].toJSON();
            
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Failed to fetch featured products: " ~ e.msg, 500);
        }
    }
    
    /**
     * Get products by category
     * GET /api/products/category/:category
     */
    void getProductsByCategory(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto category = req.params["category"];
            uint limit = req.query.get("limit", "20").to!uint;
            
            auto products = productRepo.findAll(
                "category = '" ~ category ~ "'", 
                "name ASC", 
                limit
            );
            
            auto response = [
                "category": category,
                "products": products,
                "count": products.length
            ].toJSON();
            
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Failed to fetch products by category: " ~ e.msg, 500);
        }
    }
    
    /**
     * Search products
     * GET /api/products/search
     */
    void searchProducts(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            string query = req.query.get("q", "");
            uint limit = req.query.get("limit", "20").to!uint;
            
            if (query.empty) {
                sendError(res, "Search query is required", 400);
                return;
            }
            
            auto products = productRepo.findAll(
                "name LIKE '%" ~ query ~ "%' OR description LIKE '%" ~ query ~ "%'", 
                "name ASC", 
                limit
            );
            
            auto response = [
                "query": query,
                "products": products,
                "count": products.length
            ].toJSON();
            
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Failed to search products: " ~ e.msg, 500);
        }
    }
    
    /**
     * Validate product data
     */
    private void validateProduct(Product product) {
        import std.exception;
        
        if (product.name.empty || product.name.strip().empty) {
            throw new Exception("Product name is required");
        }
        
        if (product.name.length > 255) {
            throw new Exception("Product name too long (max 255 characters)");
        }
        
        if (product.price < 0) {
            throw new Exception("Product price cannot be negative");
        }
        
        if (product.stock < 0) {
            throw new Exception("Product stock cannot be negative");
        }
        
        if (product.category.empty) {
            product.category = "uncategorized";
        }
        
        if (product.slug.empty) {
            // Generate slug from name
            import std.string;
            import std.ascii;
            import std.algorithm;
            
            product.slug = product.name.toLower();
            product.slug = product.slug.filter!(c => isAlphaNum(c) || c == ' ' || c == '-').array;
            product.slug = product.slug.splitter(" ").map!(s => s.strip()).filter!(s => !s.empty).join("-");
        }
    }
    
    /**
     * Get total count of products matching where clause
     */
    private ulong getTotalCount(string whereClause) {
        string sql = "SELECT COUNT(*) as count FROM products";
        if (!whereClause.empty) {
            sql ~= " WHERE " ~ whereClause;
        }
        
        auto result = db.query(sql);
        return result.front["count"].to!ulong;
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