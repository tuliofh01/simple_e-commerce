// Cart Service Unit Tests
import { TestBed } from '@angular/core/testing';
import { CartService, CartItem, Cart } from '../../../src/app/core/services/cart.service';
import { StorageService } from '../../../src/app/core/services/storage.service';

describe('CartService', () => {
  let service: CartService;
  let storageService: StorageService;

  const mockCartItem: CartItem = {
    id: 1,
    name: 'Test Product',
    price: 29.99,
    imageUrl: 'https://example.com/image.jpg',
    quantity: 1,
    stock: 10
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CartService, StorageService]
    });
    
    service = TestBed.inject(CartService);
    storageService = TestBed.inject(StorageService);
    
    // Clear cart before each test
    service.clearCart();
  });

  afterEach(() => {
    service.clearCart();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add item to cart', () => {
    service.addItem(mockCartItem);
    
    const items = service.getItems();
    expect(items.length).toBe(1);
    expect(items[0].name).toBe('Test Product');
  });

  it('should increment quantity when adding existing item', () => {
    service.addItem(mockCartItem);
    service.addItem(mockCartItem);
    
    const items = service.getItems();
    expect(items.length).toBe(1);
    expect(items[0].quantity).toBe(2);
  });

  it('should remove item from cart', () => {
    service.addItem(mockCartItem);
    service.removeItem(1);
    
    expect(service.isEmpty()).toBeTrue();
  });

  it('should update quantity', () => {
    service.addItem(mockCartItem);
    service.updateQuantity(1, 5);
    
    const items = service.getItems();
    expect(items[0].quantity).toBe(5);
  });

  it('should not exceed stock limit', () => {
    service.addItem({ ...mockCartItem, quantity: 15 }); // More than stock
    service.updateQuantity(1, 15);
    
    const items = service.getItems();
    expect(items[0].quantity).toBeLessThanOrEqual(mockCartItem.stock);
  });

  it('should calculate correct total', () => {
    const item1: CartItem = { ...mockCartItem, id: 1, price: 10, quantity: 2 };
    const item2: CartItem = { ...mockCartItem, id: 2, price: 20, quantity: 1 };
    
    service.addItem(item1);
    service.addItem(item2);
    
    expect(service.getTotal()).toBe(40); // (10 * 2) + (20 * 1)
  });

  it('should return correct item count', () => {
    const item1: CartItem = { ...mockCartItem, id: 1, quantity: 2 };
    const item2: CartItem = { ...mockCartItem, id: 2, quantity: 3 };
    
    service.addItem(item1);
    service.addItem(item2);
    
    expect(service.getItemCount()).toBe(5);
  });

  it('should clear cart', () => {
    service.addItem(mockCartItem);
    service.clearCart();
    
    expect(service.isEmpty()).toBeTrue();
  });

  it('should emit cart updates', (done) => {
    service.cart$.subscribe(cart => {
      if (cart.items.length === 0) return;
      
      expect(cart.items.length).toBe(1);
      done();
    });
    
    service.addItem(mockCartItem);
  });

  it('should get cart for checkout', () => {
    service.addItem(mockCartItem);
    const checkoutData = service.getCartForCheckout();
    
    expect(checkoutData.items.length).toBe(1);
    expect(checkoutData.total).toBe(mockCartItem.price);
  });
});