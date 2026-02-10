module models.product;

import std.datetime;

/**
 * Product entity with database template support
 * Represents e-commerce products with full metadata
 */
struct Product {
    ulong id;
    string name;
    string description;
    double price;
    int stock;
    string imageUrl;
    string category;
    string slug;
    bool isNew;
    bool isSale;
    double originalPrice;
    DateTime createdAt;
    DateTime updatedAt;
    
    /**
     * Check if product is in stock
     */
    bool inStock() const {
        return stock > 0;
    }
    
    /**
     * Check if product is on sale
     */
    bool onSale() const {
        return isSale && originalPrice > price;
    }
    
    /**
     * Get discount percentage
     */
    double discountPercentage() const {
        if (!onSale()) return 0.0;
        return ((originalPrice - price) / originalPrice) * 100.0;
    }
    
    /**
     * Create fresh product with defaults
     */
    static Product fresh(string name, double price) {
        return Product(
            0, // New ID
            name,
            "", // Empty description
            price,
            0, // No stock
            "", // No image
            "uncategorized",
            generateSlug(name),
            true, // New
            false, // Not on sale
            price, // Original price same as current
            Clock.currTime(),
            Clock.currTime()
        );
    }
    
    /**
     * Generate URL-friendly slug from name
     */
    private static string generateSlug(string name) {
        import std.algorithm;
        import std.ascii;
        import std.string;
        
        string slug = name.toLower();
        slug = slug.filter!(c => isAlphaNum(c) || c == ' ').array;
        slug = slug.splitter(" ").map!(s => s.strip()).filter!(s => !s.empty).join("-");
        
        return slug;
    }
}