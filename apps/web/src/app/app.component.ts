import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="app-container">
      <!-- Header -->
      <header class="app-header">
        <mat-toolbar color="primary">
          <button mat-icon-button routerLink="/">
            <mat-icon>store</mat-icon>
            <span class="brand-name">Simple E-Commerce</span>
          </button>
          
          <span class="spacer"></span>
          
          <nav class="nav-menu">
            <a mat-button routerLink="/shop">Shop</a>
            <a mat-button routerLink="/blog">Blog</a>
          </nav>
          
          <span class="spacer"></span>
          
          <div class="user-actions">
            <button mat-icon-button routerLink="/cart">
              <mat-icon>shopping_cart</mat-icon>
            </button>
            <button mat-icon-button routerLink="/auth/login">
              <mat-icon>account_circle</mat-icon>
            </button>
          </div>
        </mat-toolbar>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="app-footer">
        <p>&copy; 2024 Simple E-Commerce Platform. All rights reserved.</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .app-header {
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .brand-name {
      margin-left: 8px;
      font-size: 1.2rem;
      font-weight: 500;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .nav-menu {
      display: flex;
      gap: 16px;
    }

    .user-actions {
      display: flex;
      gap: 8px;
    }

    .main-content {
      flex: 1;
      min-height: calc(100vh - 128px);
    }

    .app-footer {
      background: #f5f5f5;
      padding: 16px;
      text-align: center;
      border-top: 1px solid #e0e0e0;
    }

    @media (max-width: 768px) {
      .nav-menu {
        display: none;
      }
      
      .brand-name {
        display: none;
      }
    }
  `]
})
export class AppComponent {
  title = 'simple-ecommerce';
}