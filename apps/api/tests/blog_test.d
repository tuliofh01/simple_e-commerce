module blog_test;

import std.stdio;
import unit_threaded;
import vibe.d;

import server;

@("List published blog posts")
{
    // TODO: Implement test
    // Test GET /api/blog/posts
    // Verify only published posts are returned
    // Verify pagination works
}

@("Get single blog post")
{
    // TODO: Implement test
    // Test GET /api/blog/posts/:id
    // Verify post content is returned
    // Verify comments are included
}

@("Create blog post as authenticated user")
{
    // TODO: Implement test
    // Test POST /api/blog/posts
    // Verify post is created with draft status
    // Verify author is set correctly
}

@("Publish blog post")
{
    // TODO: Implement test
    // Test PUT /api/blog/posts/:id/publish
    // Verify status changes to published
    // Verify publishedAt is set
}

@("Add comment to post")
{
    // TODO: Implement test
    // Test POST /api/blog/posts/:id/comments
    // Verify comment is created
    // Verify comment is linked to post
}

@("Admin can delete any post")
{
    // TODO: Implement test
    // Test DELETE /api/blog/posts/:id with admin token
    // Verify post and comments are deleted
}
