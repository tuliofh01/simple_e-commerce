module controllers.order_controller;

import vibe.d;
import models.order;
import models.product;
import database.db_connection;
import middleware.auth_middleware;
import std.typecons;
import std.datetime;
import std.array;

/**
 * Order controller with CRUD operations
 * Handles all order-related API endpoints
 */
class OrderController {
    private Database db;
    
    this() {
        db = Database.getInstance();
    }
    
    /**
     * Create new order
     * POST /api/orders
     */
    void createOrder(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto orderData = req.jsonBody!CreateOrderRequest;
            auto payload = AuthMiddleware.getCurrentUser(req);
            
            // Validate order data
            validateOrderData(orderData);
            
            // Calculate total
            double total = 0.0;
            foreach (item; orderData.items) {
                total += item.price * item.quantity;
            }
            
            // Create order
            db.execute(`
                INSERT INTO orders (user_id, total, status, customer_email, shipping_address, created_at, updated_at)
                VALUES (?, ?, 'pending', ?, ?, ?, ?)
            `, payload.userId, total, orderData.customerEmail, orderData.shippingAddress,
               Clock.currTime(), Clock.currTime());
            
            auto orderId = db.lastInsertRowid();
            
            // Insert order items
            foreach (item; orderData.items) {
                db.execute(`
                    INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, orderId, item.productId, item.productName, item.productImage,
                   item.quantity, item.price, Clock.currTime());
                
                // Update product stock
                db.execute(`
                    UPDATE products 
                    SET stock = stock - ? 
                    WHERE id = ? AND stock >= ?
                `, item.quantity, item.productId, item.quantity);
            }
            
            // Get created order
            auto order = getOrderById(orderId);
            
            res.statusCode = 201;
            auto response = order.toJSON();
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Failed to create order: " ~ e.msg, 500);
        }
    }
    
    /**
     * Get user's orders
     * GET /api/orders
     */
    void getOrders(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto payload = AuthMiddleware.getCurrentUser(req);
            uint page = req.query.get("page", "1").to!uint;
            uint limit = req.query.get("limit", "20").to!uint;
            string status = req.query.get("status", "");
            
            // Build where clause
            string whereClause = "user_id = " ~ payload.userId.to!string;
            if (!status.empty) {
                whereClause ~= " AND status = '" ~ status ~ "'";
            }
            
            // Calculate offset
            uint offset = (page - 1) * limit;
            
            // Get orders
            auto orders = db.query(`
                SELECT id, user_id, total, status, stripe_payment_id, customer_email, 
                       shipping_address, created_at, updated_at
                FROM orders 
                WHERE ` ~ whereClause ~ `
                ORDER BY created_at DESC
                LIMIT ` ~ limit.to!string ~ ` OFFSET ` ~ offset.to!string
            `).array!Order;
            
            // Get order items for each order
            foreach (ref order; orders) {
                order.items = db.query(`
                    SELECT id, order_id, product_id, product_name, product_image, quantity, price, created_at
                    FROM order_items 
                    WHERE order_id = ?
                    ORDER BY created_at ASC
                `, order.id).array!OrderItem;
            }
            
            // Get total count
            auto totalCount = db.query(`
                SELECT COUNT(*) as count FROM orders WHERE ` ~ whereClause
            ).front["count"].to!ulong;
            
            // Build response
            auto response = [
                "orders": orders,
                "pagination": [
                    "page": page,
                    "limit": limit,
                    "total": totalCount,
                    "totalPages": (totalCount + limit - 1) / limit,
                    "hasNext": offset + limit < totalCount,
                    "hasPrev": page > 1
                ]
            ].toJSON();
            
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Failed to fetch orders: " ~ e.msg, 500);
        }
    }
    
    /**
     * Get single order by ID
     * GET /api/orders/:id
     */
    void getOrder(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto payload = AuthMiddleware.getCurrentUser(req);
            auto orderId = req.params["id"].to!ulong;
            
            auto order = getOrderById(orderId);
            if (order.isNull) {
                sendError(res, "Order not found", 404);
                return;
            }
            
            // Check if user owns the order or is admin
            if (order.get.userId != payload.userId && payload.role != "admin") {
                sendError(res, "Access denied", 403);
                return;
            }
            
            auto response = order.get.toJSON();
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Failed to fetch order: " ~ e.msg, 500);
        }
    }
    
    /**
     * Update order status (admin only)
     * PUT /api/orders/:id/status
     */
    void updateOrderStatus(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto payload = AuthMiddleware.getCurrentUser(req);
            if (payload.role != "admin") {
                sendError(res, "Admin access required", 403);
                return;
            }
            
            auto orderId = req.params["id"].to!ulong;
            auto statusData = req.jsonBody!string;
            
            // Validate status
            if (!isValidStatus(statusData)) {
                sendError(res, "Invalid order status", 400);
                return;
            }
            
            // Update order status
            db.execute(`
                UPDATE orders 
                SET status = ?, updated_at = ?
                WHERE id = ?
            `, statusData, Clock.currTime(), orderId);
            
            // Get updated order
            auto order = getOrderById(orderId);
            
            auto response = order.get.toJSON();
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Failed to update order status: " ~ e.msg, 500);
        }
    }
    
    /**
     * Cancel order
     * POST /api/orders/:id/cancel
     */
    void cancelOrder(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto payload = AuthMiddleware.getCurrentUser(req);
            auto orderId = req.params["id"].to!ulong;
            
            auto order = getOrderById(orderId);
            if (order.isNull) {
                sendError(res, "Order not found", 404);
                return;
            }
            
            // Check if user owns the order or is admin
            if (order.get.userId != payload.userId && payload.role != "admin") {
                sendError(res, "Access denied", 403);
                return;
            }
            
            // Check if order can be cancelled
            if (order.get.status != "pending") {
                sendError(res, "Order cannot be cancelled", 400);
                return;
            }
            
            // Update order status
            db.execute(`
                UPDATE orders 
                SET status = 'cancelled', updated_at = ?
                WHERE id = ?
            `, Clock.currTime(), orderId);
            
            // Restore product stock
            foreach (item; order.get.items) {
                db.execute(`
                    UPDATE products 
                    SET stock = stock + ? 
                    WHERE id = ?
                `, item.quantity, item.productId);
            }
            
            auto response = [
                "message": "Order cancelled successfully",
                "orderId": orderId
            ].toJSON();
            
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Failed to cancel order: " ~ e.msg, 500);
        }
    }
    
    /**
     * Get order statistics (admin only)
     * GET /api/orders/stats
     */
    void getOrderStats(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto payload = AuthMiddleware.getCurrentUser(req);
            if (payload.role != "admin") {
                sendError(res, "Admin access required", 403);
                return;
            }
            
            // Get order statistics
            auto totalOrders = db.query("SELECT COUNT(*) as count FROM orders").front["count"].to!ulong;
            auto totalRevenue = db.query("SELECT SUM(total) as sum FROM orders WHERE status = 'completed'").front["sum"].to!double;
            auto pendingOrders = db.query("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").front["count"].to!ulong;
            auto completedOrders = db.query("SELECT COUNT(*) as count FROM orders WHERE status = 'completed'").front["count"].to!ulong;
            
            // Get recent orders
            auto recentOrders = db.query(`
                SELECT id, user_id, total, status, created_at
                FROM orders 
                ORDER BY created_at DESC
                LIMIT 5
            `).array!Order;
            
            auto response = [
                "statistics": [
                    "totalOrders": totalOrders,
                    "totalRevenue": totalRevenue,
                    "pendingOrders": pendingOrders,
                    "completedOrders": completedOrders
                ],
                "recentOrders": recentOrders
            ].toJSON();
            
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Failed to fetch order statistics: " ~ e.msg, 500);
        }
    }
    
    /**
     * Get order by ID with items
     */
    private Nullable!Order getOrderById(ulong orderId) {
        auto result = db.query(`
            SELECT id, user_id, total, status, stripe_payment_id, customer_email, 
                   shipping_address, created_at, updated_at
            FROM orders 
            WHERE id = ?
        `, orderId).array!Order;
        
        if (result.empty) {
            return Nullable!Order.init;
        }
        
        auto order = result[0];
        
        // Get order items
        order.items = db.query(`
            SELECT id, order_id, product_id, product_name, product_image, quantity, price, created_at
            FROM order_items 
            WHERE order_id = ?
            ORDER BY created_at ASC
        `, orderId).array!OrderItem;
        
        return Nullable!Order(order);
    }
    
    /**
     * Validate order data
     */
    private void validateOrderData(CreateOrderRequest orderData) {
        import std.exception;
        
        if (orderData.items.empty) {
            throw new Exception("Order must have at least one item");
        }
        
        if (orderData.customerEmail.empty || !isValidEmail(orderData.customerEmail)) {
            throw new Exception("Valid customer email is required");
        }
        
        if (orderData.shippingAddress.empty || orderData.shippingAddress.strip().empty) {
            throw new Exception("Shipping address is required");
        }
        
        foreach (item; orderData.items) {
            if (item.quantity <= 0) {
                throw new Exception("Item quantity must be greater than 0");
            }
            
            if (item.price < 0) {
                throw new Exception("Item price cannot be negative");
            }
        }
    }
    
    /**
     * Validate order status
     */
    private bool isValidStatus(string status) {
        return status == "pending" || 
               status == "paid" || 
               status == "processing" || 
               status == "shipped" || 
               status == "delivered" || 
               status == "cancelled";
    }
    
    /**
     * Basic email validation
     */
    private bool isValidEmail(string email) {
        import std.regex;
        auto emailRegex = regex(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$");
        return !matchFirst(email, emailRegex).empty;
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