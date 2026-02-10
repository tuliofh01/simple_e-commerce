export interface ApiResponse<T> {
  data?: T;
  message?: string;
  status?: number;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  imageUrl: string;
  category: string;
  slug: string;
  isNew: boolean;
  isSale: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  authorId: number;
  authorName: string;
  status: string;
  tags: string[];
  categories: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  imageUrl?: string;
  readingTime?: number;
}

export interface Order {
  id: number;
  userId: number;
  total: number;
  status: string;
  stripePaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  createdAt: Date;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stock: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface Comment {
  id: number;
  postId: number;
  userId?: number;
  userName: string;
  userEmail: string;
  content: string;
  status: string;
  parentId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaFile {
  id: number;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  postId?: number;
  productId?: number;
  createdAt: Date;
}

// Request/Response Interfaces
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresAt: Date;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  stripeToken?: string;
  customerEmail: string;
  shippingAddress: string;
}

// Configuration Interfaces
export interface AppConfig {
  apiUrl: string;
  stripePublishableKey: string;
  version: string;
  environment: string;
}

// Error Interfaces
export interface ApiError {
  error: string;
  timestamp: string;
  path?: string;
  details?: any;
}

// Filter and Search Interfaces
export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isNew?: boolean;
  isSale?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Admin Interfaces
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: Order[];
  topProducts: Product[];
}

export interface UserManagement {
  users: User[];
  total: number;
  page: number;
  limit: number;
}