import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { Product } from '../../../core/interfaces';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  template: `
    <div class="category-container">
      <h1>{{categoryName}}</h1>
      <p>{{products.length}} products</p>
      <div class="products-grid">
        <app-product-card
          *ngFor="let product of products"
          [product]="product"
          (addToCart)="addToCart($event)">
        </app-product-card>
      </div>
      <div *ngIf="products.length === 0" class="no-products">
        <p>No products found in this category.</p>
      </div>
    </div>
  `,
  styles: [`
    .category-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    h1 { margin-bottom: 8px; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; margin-top: 24px; }
    .no-products { text-align: center; padding: 48px; color: #666; }
  `]
})
export class CategoryComponent implements OnInit {
  categoryName = '';
  products: Product[] = [];

  constructor(private route: ActivatedRoute, private productService: ProductService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.categoryName = params.get('category') || '';
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.productService.getByCategory(this.categoryName).subscribe({
      next: (products) => this.products = products
    });
  }

  addToCart(product: Product): void {
    // TODO: Add to cart
  }
}
