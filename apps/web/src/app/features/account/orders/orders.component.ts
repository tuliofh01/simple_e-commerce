import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/interfaces';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatTableModule],
  template: `
    <div class="orders-container">
      <h1>My Orders</h1>

      <div *ngIf="orders.length === 0" class="no-orders">
        <p>You haven't placed any orders yet.</p>
        <button mat-raised-button color="primary" routerLink="/shop">Start Shopping</button>
      </div>

      <div class="orders-list">
        <mat-card *ngFor="let order of orders" class="order-card">
          <mat-card-header>
            <mat-card-title>Order #{{order.id}}</mat-card-title>
            <mat-card-subtitle>{{order.createdAt | date}}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="order-status" [class]="order.status">{{order.status}}</div>
            <div class="order-total">Total: \${{order.total}}</div>
            <div class="order-items">
              <span *ngFor="let item of order.items">{{item.productName}} x {{item.quantity}}</span>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" [routerLink]="['/account/orders', order.id]">View Details</button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .orders-container { padding: 24px; max-width: 800px; margin: 0 auto; }
    h1 { margin-bottom: 24px; }
    .no-orders { text-align: center; padding: 48px; color: #666; }
    .orders-list { display: flex; flex-direction: column; gap: 16px; }
    .order-card { padding: 16px; }
    .order-status { display: inline-block; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; text-transform: uppercase; }
    .order-status.pending { background: #fff3e0; color: #e65100; }
    .order-status.processing { background: #e3f2fd; color: #1565c0; }
    .order-status.shipped { background: #e8f5e9; color: #2e7d32; }
    .order-status.delivered { background: #e8f5e9; color: #2e7d32; }
    .order-status.cancelled { background: #ffebee; color: #c62828; }
    .order-total { font-weight: bold; margin: 16px 0; }
    .order-items { color: #666; font-size: 14px; }
    .order-items span { display: inline-block; margin-right: 16px; }
  `]
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getUserOrders().subscribe({
      next: (orders) => this.orders = orders,
      error: () => { /* TODO: Handle error */ }
    });
  }
}
