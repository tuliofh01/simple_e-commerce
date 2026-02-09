// Cart Service - Shopping Cart management
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StorageService } from './storage.service';

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

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>(this.getInitialCart());
  public cart$ = this.cartSubject.asObservable();
  
  private readonly CART_KEY = 'shopping_cart';

  constructor(private storageService: StorageService) {}

  // Get initial cart from storage
  private getInitialCart(): Cart {
    const storedCart = this.storageService.getJSON<Cart>(this.CART_KEY);
    if (storedCart) {
      return storedCart;
    }
    return {
      items: [],
      totalItems: 0,
      totalPrice: 0
    };
  }

  // Add item to cart
  addItem(item: CartItem): void {
    const currentCart = this.cartSubject.value;
    const existingItem = currentCart.items.find(i => i.id === item.id);
    
    if (existingItem) {
      // Update quantity if item exists
      existingItem.quantity += item.quantity;
    } else {
      // Add new item
      currentCart.items.push(item);
    }
    
    this.updateCart(currentCart);
  }

  // Remove item from cart
  removeItem(itemId: number): void {
    const currentCart = this.cartSubject.value;
    currentCart.items = currentCart.items.filter(item => item.id !== itemId);
    this.updateCart(currentCart);
  }

  // Update item quantity
  updateQuantity(itemId: number, quantity: number): void {
    const currentCart = this.cartSubject.value;
    const item = currentCart.items.find(i => i.id === itemId);
    
    if (item) {
      item.quantity = Math.max(0, Math.min(quantity, item.stock));
      
      if (item.quantity === 0) {
        this.removeItem(itemId);
        return;
      }
      
      this.updateCart(currentCart);
    }
  }

  // Increment quantity
  incrementQuantity(itemId: number): void {
    const currentCart = this.cartSubject.value;
    const item = currentCart.items.find(i => i.id === itemId);
    
    if (item && item.quantity < item.stock) {
      item.quantity++;
      this.updateCart(currentCart);
    }
  }

  // Decrement quantity
  decrementQuantity(itemId: number): void {
    const currentCart = this.cartSubject.value;
    const item = currentCart.items.find(i => i.id === itemId);
    
    if (item && item.quantity > 1) {
      item.quantity--;
      this.updateCart(currentCart);
    } else if (item && item.quantity === 1) {
      this.removeItem(itemId);
    }
  }

  // Clear cart
  clearCart(): void {
    const emptyCart: Cart = {
      items: [],
      totalItems: 0,
      totalPrice: 0
    };
    this.updateCart(emptyCart);
  }

  // Get cart total
  getTotal(): number {
    return this.cartSubject.value.totalPrice;
  }

  // Get item count
  getItemCount(): number {
    return this.cartSubject.value.totalItems;
  }

  // Get all items
  getItems(): CartItem[] {
    return this.cartSubject.value.items;
  }

  // Check if cart is empty
  isEmpty(): boolean {
    return this.cartSubject.value.items.length === 0;
  }

  // Update cart state
  private updateCart(cart: Cart): void {
    // Recalculate totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Save to storage
    this.storageService.setJSON(this.CART_KEY, cart);
    
    // Update subject
    this.cartSubject.next(cart);
  }

  // Apply promo code (stub)
  applyPromoCode(code: string): Observable<{ discount: number; message: string }> {
    // In real implementation, this would call the API
    return new BehaviorSubject({
      discount: 0,
      message: 'Invalid promo code'
    }).asObservable();
  }

  // Get cart for checkout
  getCartForCheckout(): any {
    const cart = this.cartSubject.value;
    return {
      items: cart.items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      total: cart.totalPrice
    };
  }
}