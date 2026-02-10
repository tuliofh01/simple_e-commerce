// Home Page Component
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { Observable } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { BlogService } from '../../core/services/blog.service';
import { CartService } from '../../core/services/cart.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { BlogCardComponent } from '../../shared/components/blog-card/blog-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    ProductCardComponent,
    BlogCardComponent
  ],
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">Welcome to Our Store</h1>
          <p class="hero-subtitle">Discover amazing products at great prices</p>
          <button mat-raised-button color="primary" routerLink="/shop" class="cta-button">
            <mat-icon>shopping_cart</mat-icon>
            Shop Now
          </button>
        </div>
      </section>

      <!-- Featured Products -->
      <section class="featured-section">
        <h2 class="section-title">Featured Products</h2>
        <div class="products-grid" *ngIf="featuredProducts$ | async as products; else loadingProducts">
          <app-product-card 
            *ngFor="let product of products" 
            [product]="product"
            (addToCart)="onAddToCart($event)">
          </app-product-card>
        </div>
        <ng-template #loadingProducts>
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        </ng-template>
      </section>

      <!-- Latest Blog Posts -->
      <section class="blog-section">
        <h2 class="section-title">Latest from Our Blog</h2>
        <div class="blog-grid" *ngIf="latestPosts$ | async as posts; else loadingPosts">
          <app-blog-card 
            *ngFor="let post of posts" 
            [post]="post">
          </app-blog-card>
        </div>
        <ng-template #loadingPosts>
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading blog posts...</p>
          </div>
        </ng-template>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <div class="features-grid">
          <div class="feature-card">
            <mat-icon>local_shipping</mat-icon>
            <h3>Free Shipping</h3>
            <p>On orders over $50</p>
          </div>
          <div class="feature-card">
            <mat-icon>security</mat-icon>
            <h3>Secure Payment</h3>
            <p>100% secure transactions</p>
          </div>
          <div class="feature-card">
            <mat-icon>support_agent</mat-icon>
            <h3>24/7 Support</h3>
            <p>Dedicated customer service</p>
          </div>
          <div class="feature-card">
            <mat-icon>replay</mat-icon>
            <h3>Easy Returns</h3>
            <p>30-day return policy</p>
          </div>
        </div>
      </section>

      <!-- Newsletter Section -->
      <section class="newsletter-section">
        <h2>Subscribe to Our Newsletter</h2>
        <p>Get updates on new products and special offers</p>
        <form class="newsletter-form">
          <mat-form-field appearance="outline">
            <mat-label>Your email</mat-label>
            <input matInput placeholder="Enter your email">
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit">
            Subscribe
          </button>
        </form>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      padding: 0;
    }

    .hero-section {
      background: linear-gradient(135deg, #2196f3, #1976d2);
      color: white;
      padding: 4rem 2rem;
      text-align: center;
      margin-bottom: 3rem;
    }

    .hero-title {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 500;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .cta-button {
      font-size: 1.1rem;
      padding: 0.5rem 2rem;
    }

    .section-title {
      font-size: 1.75rem;
      font-weight: 500;
      margin-bottom: 1.5rem;
      text-align: center;
      color: #212121;
    }

    .featured-section,
    .blog-section {
      margin-bottom: 3rem;
    }

    .products-grid,
    .blog-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      padding: 0 1rem;
    }

    @media (min-width: 768px) {
      .products-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .blog-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 992px) {
      .products-grid {
        grid-template-columns: repeat(4, 1fr);
      }
      .blog-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .loading-container {
      text-align: center;
      padding: 3rem;
    }

    .features-section {
      background: #f5f5f5;
      padding: 3rem 1rem;
      margin-bottom: 3rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    @media (min-width: 768px) {
      .features-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 992px) {
      .features-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .feature-card {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;

      &:hover {
        transform: translateY(-4px);
      }

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #2196f3;
        margin-bottom: 1rem;
      }

      h3 {
        margin-bottom: 0.5rem;
        color: #212121;
      }

      p {
        color: #757575;
        margin: 0;
      }
    }

    .newsletter-section {
      text-align: center;
      padding: 3rem 1rem;
      background: linear-gradient(135deg, #ff9800, #f57c00);
      color: white;
      margin-bottom: 2rem;

      h2 {
        margin-bottom: 0.5rem;
        font-size: 1.75rem;
      }

      p {
        margin-bottom: 1.5rem;
        opacity: 0.9;
      }
    }

    .newsletter-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 400px;
      margin: 0 auto;

      @media (min-width: 768px) {
        flex-direction: row;
        max-width: 500px;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  featuredProducts$: Observable<any[]>;
  latestPosts$: Observable<any[]>;

  constructor(
    private productService: ProductService,
    private blogService: BlogService,
    private cartService: CartService
  ) {
    this.featuredProducts$ = this.productService.getFeaturedProducts();
    this.latestPosts$ = this.blogService.getLatestPosts();
  }

  ngOnInit(): void {
    // Load featured products and blog posts
  }

  onAddToCart(product: any): void {
    this.cartService.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
      stock: product.stock
    });
  }
}