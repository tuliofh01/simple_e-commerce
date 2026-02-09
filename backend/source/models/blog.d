module models.blog;

import std.datetime;

/**
 * Blog post entity for content management
 */
struct BlogPost {
    ulong id;
    string title;
    string content;
    string excerpt;
    string slug;
    ulong authorId;
    string authorName;
    string status;
    string[] tags;
    string[] categories;
    DateTime createdAt;
    DateTime updatedAt;
    DateTime publishedAt;
    
    /**
     * Check if post is published
     */
    bool isPublished() const {
        return status == "published";
    }
    
    /**
     * Check if post is draft
     */
    bool isDraft() const {
        return status == "draft";
    }
    
    /**
     * Get reading time estimate (minutes)
     */
    int readingTime() const {
        // Average reading speed: 200 words per minute
        import std.string;
        int wordCount = content.splitter(" ").filter!(s => !s.empty).array.length;
        return (wordCount / 200) + 1; // At least 1 minute
    }
    
    /**
     * Create fresh blog post with defaults
     */
    static BlogPost fresh(string title, string content, ulong authorId) {
        import std.string;
        import std.algorithm;
        
        // Generate excerpt from first 150 characters
        string excerpt = content.length > 150 ? content[0..150] ~ "..." : content;
        
        return BlogPost(
            0, // New ID
            title,
            content,
            excerpt,
            generateSlug(title),
            authorId,
            "", // Author name to be filled
            "draft", // Start as draft
            [], // No tags
            [], // No categories
            Clock.currTime(),
            Clock.currTime(),
            SysTime.init // Not published yet
        );
    }
    
    /**
     * Generate URL-friendly slug from title
     */
    private static string generateSlug(string title) {
        import std.algorithm;
        import std.ascii;
        import std.string;
        
        string slug = title.toLower();
        slug = slug.filter!(c => isAlphaNum(c) || c == ' ' || c == '-').array;
        slug = slug.splitter(" ").map!(s => s.strip()).filter!(s => !s.empty).join("-");
        
        return slug;
    }
}

/**
 * Comment entity for blog posts
 */
struct Comment {
    ulong id;
    ulong postId;
    ulong userId;
    string userName;
    string userEmail;
    string content;
    string status;
    ulong parentId; // For nested comments
    DateTime createdAt;
    DateTime updatedAt;
    
    /**
     * Check if comment is approved
     */
    bool isApproved() const {
        return status == "approved";
    }
    
    /**
     * Check if comment is pending
     */
    bool isPending() const {
        return status == "pending";
    }
    
    /**
     * Check if comment is spam
     */
    bool isSpam() const {
        return status == "spam";
    }
}