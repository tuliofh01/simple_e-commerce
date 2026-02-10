import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ProductService } from '../../../core/services/product.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { Product } from '../../../core/interfaces';

@Component({
  selector: 'app-shop-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ProductCardComponent
  ],
  template: `
    <div class="shop-container">
      <div class="filters">
        <mat-form-field>
          <mat-label>Search</mat-label>
          <input matInput (input)="onSearch($event)" placeholder="Search products...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Category</mat-label>
          <mat-select (selectionChange)="onCategoryChange($event.value)">
            <mat-option value="">All Categories</mat-option>
            <mat-option *ngFor="let cat of categories" [value]="cat">{{cat}}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Sort By</mat-label>
          <mat-select (selectionChange)="onSortChange($event.value)">
            <mat-option value="name">Name</mat-option>
            <mat-option value="price_asc">Price: Low to High</mat-option>
            <mat-option value="price_desc">Price: High to Low</mat-option>
            <mat-option value="newest">Newest</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="products-grid">
        <app-product-card
          *ngFor="let product of products"
          [product]="product"
          (addToCart)="addToCart($event)">
        </app-product-card>
      </div>

      <mat-paginator
        [length]="totalProducts"
        [pageSize]="pageSize"
        [pageIndex]="pageIndex"
        (page)="onPageChange($event)">
      </mat-paginator>
    </div>
  `,
  styles: [`
    .shop-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .filters { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
    .filters mat-form-field { min-width: 200px; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
  `]
})
export class ShopListComponent implements OnInit {
  products: Product[] = [];
  categories: string[] = [];
  totalProducts = 0;
  pageIndex = 0;
  pageSize = 12;
  searchQuery = '';
  selectedCategory = '';
  sortBy = 'name';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    // TODO: Load categories from API
    this.categories = ['Electronics', 'Clothing', 'Books', 'Home'];
  }

  loadProducts(): void {
    const params = {
      page: this.pageIndex + 1, // Backend pagination is typically 1-indexed
      limit: this.pageSize,
      category: this.selectedCategory,
      sort: this.sortBy,
      search: this.searchQuery
    };
    this.productService.getProducts(params).subscribe({
      next: (response: any) => {
        // Assuming API returns { data: Product[], total: number }
        this.products = response.products || response.data || [];
        this.totalProducts = response.pagination?.total || response.total || 0;
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        // TODO: Show snackbar error
      }
    });
  }

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.pageIndex = 0;
    this.loadProducts();
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.pageIndex = 0;
    this.loadProducts();
  }

  onSortChange(sort: string): void {
    this.sortBy = sort;
    this.loadProducts();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.loadProducts();
  }

  addToCart(product: Product): void {
    // TODO: Add to cart via CartService
  }
}
