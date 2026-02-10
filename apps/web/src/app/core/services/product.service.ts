// Product Service
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

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

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private apiService: ApiService) {}

  getProducts(params?: {
    category?: string;
    search?: string;
    sort?: string;
    order?: string;
    page?: number;
    limit?: number;
  }): Observable<ProductListResponse> {
    return this.apiService.get<ProductListResponse>('products', params);
  }

  getProduct(id: number): Observable<Product> {
    return this.apiService.get<Product>(`products/${id}`);
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.apiService.get<Product>(`products/slug/${slug}`);
  }

  getFeaturedProducts(limit?: number): Observable<Product[]> {
    return this.apiService.get<Product[]>('products/featured', { limit });
  }

  searchProducts(query: string, limit?: number): Observable<Product[]> {
    return this.apiService.get<Product[]>('products/search', { q: query, limit });
  }

  getProductsByCategory(category: string, limit?: number): Observable<Product[]> {
    return this.apiService.get<Product[]>(`products/category/${category}`, { limit });
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.apiService.post<Product>('products', product);
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.apiService.put<Product>(`products/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.apiService.delete<void>(`products/${id}`);
  }
}