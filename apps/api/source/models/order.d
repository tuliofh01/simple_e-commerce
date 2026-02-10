module models.order;

import std.datetime;
import models.product;

/**
 * Order entity representing customer purchases
 */
struct Order {
    ulong id;
    ulong userId;
    double total;
    string status;
    string stripePaymentId;
    DateTime createdAt;
    DateTime updatedAt;
    OrderItem[] items;
    
    /**
     * Check if order is paid
     */
    bool isPaid() const {
        return status == "paid" || status == "completed";
    }
    
    /**
     * Check if order is pending
     */
    bool isPending() const {
        return status == "pending";
    }
    
    /**
     * Check if order is cancelled
     */
    bool isCancelled() const {
        return status == "cancelled";
    }
    
    /**
     * Get total item count
     */
    int totalItems() const {
        int count = 0;
        foreach (item; items) {
            count += item.quantity;
        }
        return count;
    }
}

/**
 * Order item representing products in an order
 */
struct OrderItem {
    ulong id;
    ulong orderId;
    ulong productId;
    string productName;
    string productImage;
    int quantity;
    double price;
    DateTime createdAt;
}

/**
 * Create order request structure
 */
struct CreateOrderRequest {
    OrderItem[] items;
    string stripeToken;
    string customerEmail;
    string shippingAddress;
}