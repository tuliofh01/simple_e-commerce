module controllers.blog_controller;

import vibe.d;
import models.blog;
import database.db_connection;
import middleware.auth_middleware;
import std.typecons;
import std.datetime;
import std.algorithm;
import std.array;

/**
 * Blog controller with CRUD operations
 * Handles all blog-related API endpoints
 */
class BlogController {
    private Database db;
    
    this() {
        db = Database.getInstance();
    }
    
    /**
     * Get all blog posts with pagination and filtering
     * GET /api/blog/posts
     */
    void getPosts(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            // Parse query parameters
            string status = req.query.get("status", "published");
            string category = req.query.get("category", "");
            string tag = req.query.get("tag", "");
            uint page = req.query.get("page", "1").to!uint;
            uint limit = req.query.get("limit", "10").to!uint;
            string sortBy = req.query.get("sort", "created_at");
            string sortOrder = req.query.get("order", "desc");
            
            // Build where clause
            string whereClause = "status = '" ~ status ~ "'";
            if (!category.empty) {
                whereClause ~= " AND categories LIKE '%\"" ~ category ~ "\"%'";
            }
            if (!tag.empty) {
                whereClause ~= " AND tags LIKE '%\"" ~ tag ~ "\"%'";
            }
            
            // Build order clause
            string orderClause = sortBy ~ " " ~ sortOrder;
            
            // Calculate offset
            uint offset = (page - 1) * limit;
            
            // Get posts
            auto posts = db.query(`
                SELECT id, title, content, excerpt, slug, author_id, author_name, 
                       status, tags, categories, published_at, created_at, updated_at
                FROM blog_posts 
                WHERE ` ~ whereClause ~ `
                ORDER BY ` ~ orderClause ~ `
                LIMIT ` ~ limit.to!string ~ ` OFFSET ` ~ offset.to!string
            `).array!BlogPost;
            
            // Get total count
            auto totalCount = db.query(`
                SELECT COUNT(*) as count FROM blog_posts WHERE ` ~ whereClause
            ).front["count"].to!ulong;
            
            // Build response
            auto response = [
                "posts": posts,
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
            sendError(res, "Failed to fetch blog posts: " ~ e.msg, 500);
        }
    }
    
    /**
     * Get single blog post by ID
     * GET /api/blog/posts/:id
     */
    void getPost(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto id = req.params["id"].to!ulong;
            
            auto result = db.query(`
                SELECT id, title, content, excerpt, slug, author_id, author_name, 
                       status, tags, categories, published_at, created_at, updated_at
                FROM blog_posts 
                WHERE id = ?
            `, id).array!BlogPost;
            
            if (result.empty) {
                sendError(res, "Blog post not found", 404);
                return;
            }
            
            auto response = result[0].toJSON();
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Failed to fetch blog post: " ~ e.msg, 500);
        }
    }
    
    /**
     * Get blog post by slug
     * GET /api/blog/posts/slug/:slug
     */
    void getPostBySlug(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto slug = req.params["slug"];
            
            auto result = db.query(`
                SELECT id, title, content, excerpt, slug, author_id, author_name, 
                       status, tags, categories, published_at, created_at, updated_at
                FROM blog_posts 
                WHERE slug = ? AND status = 'published'
            `, slug).array!BlogPost;
            
            if (result.empty) {
                sendError(res, "Blog post not found", 404);
                return;
            }
            
            auto response = result[0].toJSON();
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Failed to fetch blog post: " ~ e.msg, 500);
        }
    }
    
    /**
     * Create new blog post
     * POST /api/blog/posts
     */
    void createPost(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto postData = req.jsonBody!BlogPost;
            
            // Validate blog post data
            validateBlogPost(postData);
            
            // Insert blog post
            db.execute(`
                INSERT INTO blog_posts (title, content, excerpt, slug, author_id, author_name, 
                                     status, tags, categories, published_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, postData.title, postData.content, postData.excerpt, postData.slug,
               postData.authorId, postData.authorName, postData.status,
               postData.tags.toJSON(), postData.categories.toJSON(), postData.publishedAt,
               postData.createdAt, postData.updatedAt);
            
            // Get created post ID
            postData.id = db.lastInsertRowid();
            
            res.statusCode = 201;
            auto response = postData.toJSON();
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Failed to create blog post: " ~ e.msg, 500);
        }
    }
    
    /**
     * Update existing blog post
     * PUT /api/blog/posts/:id
     */
    void updatePost(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto id = req.params["id"].to!ulong;
            auto postData = req.jsonBody!BlogPost;
            
            // Ensure ID matches
            postData.id = id;
            
            // Validate blog post data
            validateBlogPost(postData);
            
            // Update blog post
            db.execute(`
                UPDATE blog_posts 
                SET title = ?, content = ?, excerpt = ?, slug = ?, author_name = ?, 
                    status = ?, tags = ?, categories = ?, published_at = ?, updated_at = ?
                WHERE id = ?
            `, postData.title, postData.content, postData.excerpt, postData.slug,
               postData.authorName, postData.status, postData.tags.toJSON(), 
               postData.categories.toJSON(), postData.publishedAt, postData.updatedAt, id);
            
            auto response = postData.toJSON();
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Failed to update blog post: " ~ e.msg, 500);
        }
    }
    
    /**
     * Delete blog post
     * DELETE /api/blog/posts/:id
     */
    void deletePost(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto id = req.params["id"].to!ulong;
            
            // Check if post exists
            auto result = db.query("SELECT id FROM blog_posts WHERE id = ?", id);
            if (result.empty) {
                sendError(res, "Blog post not found", 404);
                return;
            }
            
            // Delete blog post
            db.execute("DELETE FROM blog_posts WHERE id = ?", id);
            
            res.statusCode = 204;
            res.writeVoid();
            
        } catch (Exception e) {
            sendError(res, "Failed to delete blog post: " ~ e.msg, 500);
        }
    }
    
    /**
     * Get latest published posts
     * GET /api/blog/posts/latest
     */
    void getLatestPosts(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            uint limit = req.query.get("limit", "5").to!uint;
            
            auto posts = db.query(`
                SELECT id, title, content, excerpt, slug, author_id, author_name, 
                       status, tags, categories, published_at, created_at, updated_at
                FROM blog_posts 
                WHERE status = 'published'
                ORDER BY published_at DESC
                LIMIT ?
            `, limit).array!BlogPost;
            
            auto response = posts.toJSON();
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Failed to fetch latest posts: " ~ e.msg, 500);
        }
    }
    
    /**
     * Get comments for a blog post
     * GET /api/blog/posts/:id/comments
     */
    void getComments(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto postId = req.params["id"].to!ulong;
            
            auto comments = db.query(`
                SELECT id, post_id, user_id, user_name, user_email, content, status, parent_id, created_at, updated_at
                FROM comments 
                WHERE post_id = ? AND status = 'approved'
                ORDER BY created_at ASC
            `, postId).array!Comment;
            
            auto response = comments.toJSON();
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Failed to fetch comments: " ~ e.msg, 500);
        }
    }
    
    /**
     * Create comment for a blog post
     * POST /api/blog/posts/:id/comments
     */
    void createComment(HTTPServerRequest req, HTTPServerResponse res) {
        try {
            auto postId = req.params["id"].to!ulong;
            auto commentData = req.jsonBody!Comment;
            
            // Validate comment data
            validateComment(commentData);
            
            // Insert comment
            db.execute(`
                INSERT INTO comments (post_id, user_id, user_name, user_email, content, status, parent_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, postId, commentData.userId, commentData.userName, commentData.userEmail,
               commentData.content, commentData.status, commentData.parentId,
               commentData.createdAt, commentData.updatedAt);
            
            // Get created comment ID
            commentData.id = db.lastInsertRowid();
            commentData.postId = postId;
            
            res.statusCode = 201;
            auto response = commentData.toJSON();
            res.headers["Content-Type"] = "application/json";
            res.writeBody(response.toString());
            
        } catch (Exception e) {
            sendError(res, "Failed to create comment: " ~ e.msg, 500);
        }
    }
    
    /**
     * Validate blog post data
     */
    private void validateBlogPost(BlogPost post) {
        import std.exception;
        
        if (post.title.empty || post.title.strip().empty) {
            throw new Exception("Blog post title is required");
        }
        
        if (post.title.length > 255) {
            throw new Exception("Blog post title too long (max 255 characters)");
        }
        
        if (post.content.empty || post.content.strip().empty) {
            throw new Exception("Blog post content is required");
        }
        
        if (post.slug.empty) {
            // Generate slug from title
            post.slug = generateSlug(post.title);
        }
        
        if (post.excerpt.empty) {
            // Generate excerpt from content
            post.excerpt = post.content.length > 150 ? post.content[0..150] ~ "..." : post.content;
        }
        
        if (post.status.empty) {
            post.status = "draft";
        }
    }
    
    /**
     * Validate comment data
     */
    private void validateComment(Comment comment) {
        import std.exception;
        
        if (comment.userName.empty || comment.userName.strip().empty) {
            throw new Exception("Comment author name is required");
        }
        
        if (comment.userEmail.empty || !isValidEmail(comment.userEmail)) {
            throw new Exception("Valid email is required");
        }
        
        if (comment.content.empty || comment.content.strip().empty) {
            throw new Exception("Comment content is required");
        }
        
        if (comment.content.length > 1000) {
            throw new Exception("Comment too long (max 1000 characters)");
        }
        
        if (comment.status.empty) {
            comment.status = "pending";
        }
    }
    
    /**
     * Generate URL-friendly slug from title
     */
    private string generateSlug(string title) {
        import std.string;
        import std.ascii;
        import std.algorithm;
        
        string slug = title.toLower();
        slug = slug.filter!(c => isAlphaNum(c) || c == ' ' || c == '-').array;
        slug = slug.splitter(" ").map!(s => s.strip()).filter!(s => !s.empty).join("-");
        
        return slug;
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