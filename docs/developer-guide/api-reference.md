# API Reference

## Authentication

### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:** 201 Created
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

### POST /api/auth/login
Authenticate user and get tokens.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### POST /api/auth/refresh
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbG..."
}
```

### GET /api/auth/profile
Get current user profile. Requires authentication.

---

## Products

### GET /api/products
List all products with pagination.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 12)
- `category` (optional)
- `sort` (name, price_asc, price_desc, newest)
- `search` (optional)

### GET /api/products/:id
Get single product details.

### POST /api/products
Create product (admin only).

### PUT /api/products/:id
Update product (admin only).

### DELETE /api/products/:id
Delete product (admin only).

---

## Orders

### POST /api/orders
Create new order from cart.

### GET /api/orders
List user's orders.

### GET /api/orders/:id
Get order details.

### PUT /api/orders/:id/status
Update order status (admin only).

---

## Blog

### GET /api/blog/posts
List published posts.

### GET /api/blog/posts/:id
Get single post with comments.

### POST /api/blog/posts
Create post.

### DELETE /api/blog/posts/:id
Delete post.
