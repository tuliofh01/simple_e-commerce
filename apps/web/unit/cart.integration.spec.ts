// Cart Service Integration Tests
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CartService, CartItem, Cart } from '../../../src/app/core/services/cart.service';
import { StorageService } from '../../../src/app/core/services/storage.service';
import { ApiService } from '../../../src/app/core/services/api.service';

describe('CartService Integration', () => {
  let service: CartService;
  let storageService: StorageService;
  let apiService: ApiService;
  let httpMock: HttpTestingController;

  const mockCartItem: CartItem = {
    id: 1,
    name: 'Test Product',
    price: 29.99,
    imageUrl: 'https://example.com/image.jpg',
    quantity: 1,
    stock: 10
  };

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [CartService, StorageService, ApiService]
    });
    
    service = TestBed.inject(CartService);
    storageService = TestBed.inject(StorageService);
    apiService = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear cart and storage before each test
    service.clearCart();
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    service.clearCart();
    localStorage.clear();
  });

  it('should persist cart to localStorage', () => {
    service.addItem(mockCartItem);
    
    const storedCart = localStorage.getItem('cart');
    expect(storedCart).toBeTruthy();
    
    const parsedCart = JSON.parse(storedCart || '{}');
    expect(parsedCart.items.length).toBe(1);
    expect(parsedCart.items[0].id).toBe(1);
  });

  it('should restore cart from localStorage', () => {
    // Manually set cart in localStorage
    const cartData = {
      items: [mockCartItem],
      total: 29.99
    };
    localStorage.setItem('cart', JSON.stringify(cartData));
    
    // Create new service instance to test restoration
    const newService = new CartService(storageService, apiService);
    
    const items = newService.getItems();
    expect(items.length).toBe(1);
    expect(items[0].name).toBe('Test Product');
  });

  it('should sync cart with backend on checkout', () => {
    service.addItem(mockCartItem);
    
    service.checkout({ email: 'test@example.com', address: 'Test Address' }).subscribe(response => {
      expect(response).toBeTruthy();
      expect(service.isEmpty()).toBeTrue();
    });

    const req = httpMock.expectOne(`${service.apiService.getBaseUrl()}/orders`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.email).toBe('test@example.com');
    expect(req.request.body.address).toBe('Test Address');
    expect(req.request.body.items.length).toBe(1);
    
    req.flush({ orderId: 1, message: 'Order created successfully' });
  });

  it('should handle checkout errors', () => {
    service.addItem(mockCartItem);
    
    const errorResponse = { error: { message: 'Payment failed' }, status: 402 };
    
    service.checkout({ email: 'test@example.com', address: 'Test Address' }).subscribe({
      next: () => {},
      error: error => {
        expect(error.status).toBe(402);
        expect(error.error.message).toBe('Payment failed');
        expect(service.isEmpty()).toBeFalse(); // Cart should remain
      }
    });

    const req = httpMock.expectOne(`${service.apiService.getBaseUrl()}/orders`);
    req.flush(errorResponse.error, { status: 402, statusText: 'Payment Required' });
  });

  it('should validate stock before checkout', () => {
    // Add item with quantity exceeding stock
    service.addItem({ ...mockCartItem, quantity: 15 });
    
    service.checkout({ email: 'test@example.com', address: 'Test Address' }).subscribe({
      next: () => {},
      error: error => {
        expect(error.message).toContain('stock');
      }
    });

    // No request should be made if validation fails
    httpMock.expectNone(`${service.apiService.getBaseUrl()}/orders`);
  });

  it('should handle multiple concurrent checkout attempts', () => {
    service.addItem(mockCartItem);
    
    const firstCheckout = service.checkout({ email: 'test1@example.com', address: 'Address 1' });
    const secondCheckout = service.checkout({ email: 'test2@example.com', address: 'Address 2' });
    
    const req1 = httpMock.expectOne(`${service.apiService.getBaseUrl()}/orders`);
    const req2 = httpMock.expectOne(`${service.apiService.getBaseUrl()}/orders`);
    
    expect(req1).toBeTruthy();
    expect(req2).toBeTruthy();
    
    req1.flush({ orderId: 1, message: 'Order 1 created' });
    req2.flush({ orderId: 2, message: 'Order 2 created' });
    
    firstCheckout.subscribe(response => {
      expect(response.orderId).toBe(1);
    });
    
    secondCheckout.subscribe(response => {
      expect(response.orderId).toBe(2);
    });
  });

  it('should clear cart after successful checkout', () => {
    service.addItem(mockCartItem);
    
    service.checkout({ email: 'test@example.com', address: 'Test Address' }).subscribe(() => {
      expect(service.isEmpty()).toBeTrue();
      expect(localStorage.getItem('cart')).toBeNull();
    });

    const req = httpMock.expectOne(`${service.apiService.getBaseUrl()}/orders`);
    req.flush({ orderId: 1, message: 'Order created successfully' });
  });

  it('should handle network errors during checkout', () => {
    service.addItem(mockCartItem);
    
    service.checkout({ email: 'test@example.com', address: 'Test Address' }).subscribe({
      next: () => {},
      error: error => {
        expect(error.message).toContain('Network error');
        expect(service.isEmpty()).toBeFalse(); // Cart should remain
      }
    });

    const req = httpMock.expectOne(`${service.apiService.getBaseUrl()}/orders`);
    req.error(new ErrorEvent('Network error'));
  });

  it('should handle empty cart checkout', () => {
    service.checkout({ email: 'test@example.com', address: 'Test Address' }).subscribe({
      next: () => {},
      error: error => {
        expect(error.message).toContain('empty');
      }
    });

    // No request should be made for empty cart
    httpMock.expectNone(`${service.apiService.getBaseUrl()}/orders`);
  });
});