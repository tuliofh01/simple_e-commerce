// Product Service Unit Tests
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { ProductService } from '../../../src/app/core/services/product.service';
import { ApiService } from '../../../src/app/core/services/api.service';

describe('ProductService', () => {
  let service: ProductService;
  let apiService: ApiService;
  let httpMock: HttpTestingController;

  const mockProduct = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 29.99,
    imageUrl: 'https://example.com/image.jpg',
    category: 'Electronics',
    stock: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockProducts = [mockProduct, { ...mockProduct, id: 2 }];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService, ApiService]
    });
    
    service = TestBed.inject(ProductService);
    apiService = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all products', () => {
    service.getAll().subscribe(response => {
      expect(response).toEqual(mockProducts);
    });

    const req = httpMock.expectOne(`${service.apiService.getBaseUrl()}/products`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });

  it('should get product by ID', () => {
    service.getById(1).subscribe(response => {
      expect(response).toEqual(mockProduct);
    });

    const req = httpMock.expectOne(`${service.apiService.getBaseUrl()}/products/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProduct);
  });

  it('should create product', () => {
    const newProduct = { 
      name: 'New Product',
      description: 'New Description',
      price: 19.99,
      imageUrl: 'https://example.com/new.jpg',
      category: 'Books',
      stock: 5
    };
    
    service.create(newProduct).subscribe(response => {
      expect(response).toEqual(mockProduct);
    });

    const req = httpMock.expectOne(`${service.apiService.getBaseUrl()}/products`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newProduct);
    req.flush(mockProduct);
  });

  it('should update product', () => {
    const updatedProduct = { 
      name: 'Updated Product',
      description: 'Updated Description',
      price: 39.99,
      imageUrl: 'https://example.com/updated.jpg',
      category: 'Electronics',
      stock: 8
    };
    
    service.update(1, updatedProduct).subscribe(response => {
      expect(response).toEqual(mockProduct);
    });

    const req = httpMock.expectOne(`${service.apiService.getBaseUrl()}/products/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedProduct);
    req.flush(mockProduct);
  });

  it('should delete product', () => {
    service.delete(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${service.apiService.getBaseUrl()}/products/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should search products', () => {
    const searchTerm = 'Test';
    
    service.search(searchTerm).subscribe(response => {
      expect(response).toEqual(mockProducts);
    });

    const req = httpMock.expectOne(`${service.apiService.getBaseUrl()}/products/search?q=${searchTerm}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });

  it('should filter products by category', () => {
    const category = 'Electronics';
    
    service.getByCategory(category).subscribe(response => {
      expect(response).toEqual(mockProducts);
    });

    const req = httpMock.expectOne(`${service.apiService.getBaseUrl()}/products?category=${category}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });

  it('should handle product errors', () => {
    const errorResponse = { error: { message: 'Product not found' }, status: 404 };
    
    service.getById(999).subscribe({
      next: () => {},
      error: error => {
        expect(error.status).toBe(404);
        expect(error.error.message).toBe('Product not found');
      }
    });

    const req = httpMock.expectOne(`${service.apiService.getBaseUrl()}/products/999`);
    req.flush(errorResponse.error, { status: 404, statusText: 'Not Found' });
  });

  it('should handle network errors', () => {
    service.getAll().subscribe({
      next: () => {},
      error: error => {
        expect(error.message).toContain('Network error');
      }
    });

    const req = httpMock.expectOne(`${service.apiService.getBaseUrl()}/products`);
    req.error(new ErrorEvent('Network error'));
  });

  it('should handle multiple concurrent product requests', () => {
    const firstRequest = service.getAll();
    const secondRequest = service.getById(1);
    
    const req1 = httpMock.expectOne(`${service.apiService.getBaseUrl()}/products`);
    const req2 = httpMock.expectOne(`${service.apiService.getBaseUrl()}/products/1`);
    
    expect(req1).toBeTruthy();
    expect(req2).toBeTruthy();
    
    req1.flush(mockProducts);
    req2.flush(mockProduct);
    
    firstRequest.subscribe(response => {
      expect(response).toEqual(mockProducts);
    });
    
    secondRequest.subscribe(response => {
      expect(response).toEqual(mockProduct);
    });
  });

  it('should handle pagination', () => {
    const page = 1;
    const limit = 10;
    
    service.getAll(page, limit).subscribe(response => {
      expect(response).toEqual(mockProducts);
    });

    const req = httpMock.expectOne(`${service.apiService.getBaseUrl()}/products?page=${page}&limit=${limit}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });

  it('should sort products', () => {
    const sort = 'price';
    const order = 'asc';
    
    service.getAll(1, 10, sort, order).subscribe(response => {
      expect(response).toEqual(mockProducts);
    });

    const req = httpMock.expectOne(`${service.apiService.getBaseUrl()}/products?page=1&limit=10&sort=${sort}&order=${order}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });
});