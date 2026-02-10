// Product Card Component
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../core/services/product.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card class="product-card" [class.sale]="product.isSale" [class.new]="product.isNew">
      <div class="image-container">
        <img [src]="product.imageUrl" [alt]="product.name" loading="lazy">
        <div class="badges">
          <span class="badge new" *ngIf="product.isNew">New</span>
          <span class="badge sale" *ngIf="product.isSale">Sale</span>
        </div>
      </div>
      
      <mat-card-content>
        <h3 class="product-title">{{ product.name }}</h3>
        <p class="product-description">{{ product.description | slice:0:100 }}{{ product.description.length > 100 ? '...' : '' }}</p>
        
        <div class="price-container">
          <span class="current-price">\${{ product.price | number:'1.2-2' }}</span>
          <span class="original-price" *ngIf="product.originalPrice && product.originalPrice > product.price">
            \${{ product.originalPrice | number:'1.2-2' }}
          </span>
        </div>
        
        <div class="stock-info" *ngIf="product.stock > 0">
          <span class="in-stock">In Stock ({{ product.stock }})</span>
        </div>
        <div class="stock-info out-of-stock" *ngIf="product.stock === 0">
          <span>Out of Stock</span>
        </div>
      </mat-card-content>
      
      <mat-card-actions>
        <button mat-raised-button color="primary" 
                [disabled]="product.stock === 0"
                (click)="addToCart.emit(product)">
          <mat-icon>add_shopping_cart</mat-icon>
          Add to Cart
        </button>
        <button mat-icon-button [routerLink]="['/shop', product.id]">
          <mat-icon>visibility</mat-icon>
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .product-card {
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
      height: 100%;
      display: flex;
      flex-direction: column;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      }

      &.new {
        border-top: 3px solid #4caf50;
      }

      &.sale {
        border-top: 3px solid #f44336;
      }
    }

    .image-container {
      position: relative;
      padding-top: 100%; // 1:1 aspect ratio
      overflow: hidden;

      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      &:hover img {
        transform: scale(1.05);
      }
    }

    .badges {
      position: absolute;
      top: 8px;
      left: 8px;
      display: flex;
      gap: 4px;
    }

    .badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;

      &.new {
        background: #4caf50;
        color: white;
      }

      &.sale {
        background: #f44336;
        color: white;
      }
    }

    mat-card-content {
      padding: 1rem;
      flex: 1;
    }

    .product-title {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #212121;
      line-height: 1.3;
    }

    .product-description {
      font-size: 0.875rem;
      color: #757575;
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .price-container {
      margin-bottom: 0.5rem;
    }

    .current-price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #2196f3;
    }

    .original-price {
      font-size: 0.875rem;
      color: #9e9e9e;
      text-decoration: line-through;
      margin-left: 0.5rem;
    }

    .stock-info {
      font-size: 0.75rem;
      color: #4caf50;
      
      &.out-of-stock {
        color: #f44336;
      }
    }

    mat-card-actions {
      padding: 0.5rem 1rem 1rem;
      display: flex;
      gap: 0.5rem;
      justify-content: space-between;

      button {
        flex: 1;
      }
    }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
}