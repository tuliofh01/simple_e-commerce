# API Reference

## Base URL

**Development**: `http://localhost:8080/api`
**Production**: `https://yourdomain.com/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "user" // optional, default: "user"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "role": "user"
  },
  "expiresAt": "2024-02-10T18:00:00Z"
}
```

#### POST /auth/login
Login with username and password.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

#### POST /auth/refresh
Refresh JWT token.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

### Products

#### GET /products
Get all products with optional filtering.

**Query Parameters:**
- `category` - Filter by category
- `search` - Search in name and description
- `sort` - Sort field (default: created_at)
- `order` - Sort order (asc/desc)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

#### GET /products/:id
Get single product by ID.

#### GET /products/featured
Get featured products.

#### GET /products/search
Search products.

**Query Parameters:**
- `q` - Search query (required)
- `limit` - Max results (default: 20)

#### POST /products
Create new product (requires moderator+ role).

#### PUT /products/:id
Update product (requires moderator+ role).

#### DELETE /products/:id
Delete product (requires admin role).

## Error Response

All endpoints return errors in the following format:

```json
{
  "error": "Error message",
  "timestamp": "2024-02-09T18:00:00Z"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error