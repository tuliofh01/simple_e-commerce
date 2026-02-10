import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatTableModule],
  template: `
    <div class="dashboard-container">
      <h1>Admin Dashboard</h1>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon>shopping_cart</mat-icon>
            <div class="stat-value">{{stats.orders}}</div>
            <div class="stat-label">Total Orders</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon>attach_money</mat-icon>
            <div class="stat-value">\${{stats.revenue}}</div>
            <div class="stat-label">Total Revenue</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon>inventory_2</mat-icon>
            <div class="stat-value">{{stats.products}}</div>
            <div class="stat-label">Products</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon>people</mat-icon>
            <div class="stat-value">{{stats.users}}</div>
            <div class="stat-label">Users</div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="dashboard-grid">
        <mat-card class="recent-orders">
          <mat-card-header>
            <mat-card-title>Recent Orders</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="recentOrders">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>Order</th>
                <td mat-cell *matCellDef="let order">#{{order.id}}</td>
              </ng-container>
              <ng-container matColumnDef="customer">
                <th mat-header-cell *matHeaderCellDef>Customer</th>
                <td mat-cell *matCellDef="let order">{{order.customerName}}</td>
              </ng-container>
              <ng-container matColumnDef="total">
                <th mat-header-cell *matHeaderCellDef>Total</th>
                <td mat-cell *matCellDef="let order">\${{order.total}}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let order">
                  <span class="status-badge" [class]="order.status">{{order.status}}</span>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>

        <mat-card class="quick-actions">
          <mat-card-header>
            <mat-card-title>Quick Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <button mat-stroked-button routerLink="/admin/products">Manage Products</button>
            <button mat-stroked-button routerLink="/admin/users">Manage Users</button>
            <button mat-stroked-button routerLink="/admin/orders">View All Orders</button>
            <button mat-stroked-button routerLink="/blog/create">Create Blog Post</button>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    h1 { margin-bottom: 24px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card mat-icon { font-size: 48px; width: 48px; height: 48px; color: #1976d2; }
    .stat-value { font-size: 32px; font-weight: bold; margin: 8px 0; }
    .stat-label { color: #666; }
    .dashboard-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
    .quick-actions button { width: 100%; margin-bottom: 8px; text-align: left; }
    .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .status-badge.pending { background: #fff3e0; }
    .status-badge.processing { background: #e3f2fd; }
    .status-badge.completed { background: #e8f5e9; }
  `]
})
export class DashboardComponent implements OnInit {
  stats = { orders: 0, revenue: 0, products: 0, users: 0 };
  recentOrders: any[] = [];
  displayedColumns = ['id', 'customer', 'total', 'status'];

  ngOnInit(): void {
    // TODO: Load dashboard stats from API
    this.stats = { orders: 156, revenue: 12543, products: 48, users: 234 };
    this.recentOrders = [
      { id: '1001', customerName: 'John Doe', total: 149.99, status: 'pending' },
      { id: '1002', customerName: 'Jane Smith', total: 89.50, status: 'processing' },
      { id: '1003', customerName: 'Bob Johnson', total: 234.00, status: 'completed' }
    ];
  }
}
