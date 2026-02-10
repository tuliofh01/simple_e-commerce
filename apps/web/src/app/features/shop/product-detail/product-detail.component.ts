import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/interfaces';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule
  ],
  template: `
    <div class="product-detail-container" *ngIf="product">
      <div class="product-images">
        <img [src]="product.imageUrl" [alt]="product.name" class="main-image">
        <div class="thumbnail-grid" *ngIf="product.images?.length">
          <img *ngFor="let img of product.images" [src]="img" class="thumbnail">
        </div>
      </div>

      <div class="product-info">
        <h1>{{product.name}}</h1>
        <p class="price">\${{product.price}}</p>
        <p class="description">{{product.description}}</p>

        <div class="stock-status" [class.in-stock]="product.stock > 0" [class.out-of-stock]="product.stock === 0">
          {{product.stock > 0 ? 'In Stock (' + product.stock + ')' : 'Out of Stock'}}
        </div>

        <div class="quantity-selector">
          <button mat-icon-button (click)="decreaseQuantity()" [disabled]="quantity <= 1">-</button>
          <mat-form-field>
            <input matInput type="number" [(ngModel)]="quantity" min="1" [max]="product.stock">
          </mat-form-field>
          <button mat-icon-button (click)="increaseQuantity()" [disabled]="quantity >= product.stock">+</button>
        </div>

        <button mat-raised-button color="primary" (click)="addToCart()" [disabled]="product.stock === 0">
          <mat-icon>shopping_cart</mat-icon>
          Add to Cart
        </button>

        <mat-tab-group>
          <mat-tab label="Description">
            <div class="tab-content">{{product.longDescription}}</div>
          </mat-tab>
          <mat-tab label="Specifications" *ngIf="product.specifications">
            <div class="tab-content">
              <div *ngFor="let spec of product.specifications | keyvalue">
                <strong>{{spec.key}}:</strong> {{spec.value}}
              </div>
            </div>
          </mat-tab>
          <mat-tab label="Reviews" *ngIf="product.reviews">
            <div class="tab-content">
              <!-- TODO: Reviews list -->
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .product-detail-container { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; padding: 24px; max-width: 1200px; margin: 0 auto; }
    .main-image { width: 100%; height: 400px; object-fit: cover; border-radius: 8px; }
    .thumbnail-grid { display: flex; gap: 8px; margin-top: 16px; }
    .thumbnail { width: 80px; height: 80px; object-fit: cover; cursor: pointer; border-radius: 4px; }
    .product-info h1 { margin-bottom: 8px; }
    .price { font-size: 24px; font-weight: bold; color: #1976d2; }
    .description { color: #666; margin: 16px 0; }
    .stock-status { font-weight: 500; margin: 16px 0; }
    .stock-status.in-stock { color: green; }
    .stock-status.out-of-stock { color: red; }
    .quantity-selector { display: flex; align-items: center; gap: 8px; margin: 16px 0; }
    .quantity-selector mat-form-field { width: 80px; }
    button[mat-raised-button] { width: 100%; height: 48px; margin-bottom: 24px; }
    .tab-content { padding: 16px 0; }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  quantity = 1;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProduct(id).subscribe({
        next: (product) => this.product = product,
        error: () => { /* TODO: Handle error */ }
      });
    }
  }

  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.stock) this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) this.quantity--;
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addItem(this.product, this.quantity);
    }
  }
}
