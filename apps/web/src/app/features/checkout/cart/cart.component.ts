import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { CartService } from '../../../core/services/cart.service';
import { CartItem } from '../../../core/interfaces';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule],
  template: `
    <div class="cart-container">
      <h1>Shopping Cart</h1>

      <div *ngIf="items.length === 0" class="empty-cart">
        <mat-icon>shopping_cart</mat-icon>
        <h2>Your cart is empty</h2>
        <p>Continue shopping to add items to your cart.</p>
        <button mat-raised-button color="primary" routerLink="/shop">Browse Products</button>
      </div>

      <div *ngIf="items.length > 0" class="cart-content">
        <div class="cart-items">
          <div *ngFor="let item of items" class="cart-item">
            <img [src]="item.product.imageUrl" [alt]="item.product.name" class="item-image">
            <div class="item-details">
              <h3>{{item.product.name}}</h3>
              <p class="price">\${{item.product.price}}</p>
              <p class="subtotal">Subtotal: \${{item.product.price * item.quantity}}</p>
            </div>
            <div class="quantity-controls">
              <button mat-icon-button (click)="decreaseQuantity(item)" [disabled]="item.quantity <= 1">-</button>
              <span>{{item.quantity}}</span>
              <button mat-icon-button (click)="increaseQuantity(item)" [disabled]="item.quantity >= item.product.stock">+</button>
            </div>
            <button mat-icon-button color="warn" (click)="removeItem(item)">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </div>

        <mat-card class="order-summary">
          <mat-card-header>
            <mat-card-title>Order Summary</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="summary-row">
              <span>Subtotal</span>
              <span>\${{subtotal}}</span>
            </div>
            <div class="summary-row">
              <span>Shipping</span>
              <span>\${{shipping}}</span>
            </div>
            <div class="summary-row">
              <span>Tax</span>
              <span>\${{tax}}</span>
            </div>
            <mat-divider></mat-divider>
            <div class="summary-row total">
              <span>Total</span>
              <span>\${{total}}</span>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" routerLink="/checkout">
              Proceed to Checkout
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .cart-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .empty-cart { text-align: center; padding: 64px; }
    .empty-cart mat-icon { font-size: 64px; width: 64px; height: 64px; color: #ccc; }
    .cart-content { display: grid; grid-template-columns: 2fr 1fr; gap: 32px; }
    .cart-item { display: flex; align-items: center; gap: 16px; padding: 16px; border-bottom: 1px solid #eee; }
    .item-image { width: 80px; height: 80px; object-fit: cover; border-radius: 4px; }
    .item-details { flex: 1; }
    .item-details h3 { margin: 0 0 8px; }
    .item-details .price { color: #1976d2; font-weight: 500; }
    .item-details .subtotal { color: #666; font-size: 14px; }
    .quantity-controls { display: flex; align-items: center; gap: 8px; }
    .order-summary { padding: 16px; }
    .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .summary-row.total { font-weight: bold; font-size: 18px; margin-top: 8px; }
    mat-card-actions { padding: 16px 0 0; }
    button[mat-raised-button] { width: 100%; }
  `]
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];
  subtotal = 0;
  shipping = 0;
  tax = 0;
  total = 0;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.items$.subscribe(items => {
      this.items = items;
      this.calculateTotals();
    });
  }

  calculateTotals(): void {
    this.subtotal = this.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    this.shipping = this.subtotal > 100 ? 0 : 10;
    this.tax = this.subtotal * 0.08;
    this.total = this.subtotal + this.shipping + this.tax;
  }

  increaseQuantity(item: CartItem): void {
    if (item.quantity < item.product.stock) {
      this.cartService.updateQuantity(item.product.id, item.quantity + 1);
    }
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.product.id, item.quantity - 1);
    }
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item.product.id);
  }
}
