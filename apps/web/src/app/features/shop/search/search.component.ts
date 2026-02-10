import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { Product } from '../../../core/interfaces';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  template: `
    <div class="search-container">
      <h1>Search Results for "{{query}}"</h1>
      <p>{{products.length}} results found</p>
      <div class="products-grid">
        <app-product-card
          *ngFor="let product of products"
          [product]="product"
          (addToCart)="addToCart($event)">
        </app-product-card>
      </div>
      <div *ngIf="products.length === 0" class="no-results">
        <p>No products match your search.</p>
        <p>Try different keywords or browse our categories.</p>
      </div>
    </div>
  `,
  styles: [`
    .search-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    h1 { margin-bottom: 8px; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; margin-top: 24px; }
    .no-results { text-align: center; padding: 48px; color: #666; }
  `]
})
export class SearchComponent implements OnInit {
  query = '';
  products: Product[] = [];

  constructor(private route: ActivatedRoute, private productService: ProductService) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.query = params.get('q') || '';
      this.search();
    });
  }

  search(): void {
    if (this.query) {
      this.productService.search(this.query).subscribe({
        next: (products) => this.products = products
      });
    }
  }

  addToCart(product: Product): void {
    // TODO: Add to cart
  }
}
