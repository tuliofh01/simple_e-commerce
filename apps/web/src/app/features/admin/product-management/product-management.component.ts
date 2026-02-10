import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/interfaces';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule],
  template: `
    <div class="products-container">
      <div class="header">
        <h1>Product Management</h1>
        <button mat-raised-button color="primary">
          <mat-icon>add</mat-icon>
          Add Product
        </button>
      </div>

      <mat-form-field class="search-field">
        <mat-label>Search products</mat-label>
        <input matInput (input)="onSearch($event)" placeholder="Search...">
      </mat-form-field>

      <table mat-table [dataSource]="products" class="products-table">
        <ng-container matColumnDef="image">
          <th mat-header-cell *matHeaderCellDef>Image</th>
          <td mat-cell *matCellDef="let product">
            <img [src]="product.imageUrl" class="product-thumb">
          </td>
        </ng-container>

        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let product">{{product.name}}</td>
        </ng-container>

        <ng-container matColumnDef="price">
          <th mat-header-cell *matHeaderCellDef>Price</th>
          <td mat-cell *matCellDef="let product">\${{product.price}}</td>
        </ng-container>

        <ng-container matColumnDef="stock">
          <th mat-header-cell *matHeaderCellDef>Stock</th>
          <td mat-cell *matCellDef="let product">{{product.stock}}</td>
        </ng-container>

        <ng-container matColumnDef="category">
          <th mat-header-cell *matHeaderCellDef>Category</th>
          <td mat-cell *matCellDef="let product">{{product.category}}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let product">
            <button mat-icon-button (click)="editProduct(product)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deleteProduct(product)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `,
  styles: [`
    .products-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .search-field { width: 300px; margin-bottom: 16px; }
    .products-table { width: 100%; }
    .product-thumb { width: 50px; height: 50px; object-fit: cover; border-radius: 4px; }
  `]
})
export class ProductManagementComponent implements OnInit {
  products: Product[] = [];
  displayedColumns = ['image', 'name', 'price', 'stock', 'category', 'actions'];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts({}).subscribe({
      next: (response) => this.products = response.data,
      error: () => { /* TODO: Handle error */ }
    });
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    // TODO: Implement search
  }

  editProduct(product: Product): void {
    // TODO: Open edit dialog
  }

  deleteProduct(product: Product): void {
    if (confirm('Delete this product?')) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => this.loadProducts()
      });
    }
  }
}
