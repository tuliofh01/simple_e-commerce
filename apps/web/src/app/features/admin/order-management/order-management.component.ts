import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatSelectModule],
  template: `
    <div class="orders-container">
      <div class="header">
        <h1>Order Management</h1>
      </div>

      <table mat-table [dataSource]="orders" class="orders-table">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>Order</th>
          <td mat-cell *matCellDef="let order">#{{order.id}}</td>
        </ng-container>

        <ng-container matColumnDef="customer">
          <th mat-header-cell *matHeaderCellDef>Customer</th>
          <td mat-cell *matCellDef="let order">{{order.customerName}}</td>
        </ng-container>

        <ng-container matColumnDef="items">
          <th mat-header-cell *matHeaderCellDef>Items</th>
          <td mat-cell *matCellDef="let order">{{order.itemCount}} items</td>
        </ng-container>

        <ng-container matColumnDef="total">
          <th mat-header-cell *matHeaderCellDef>Total</th>
          <td mat-cell *matCellDef="let order">\${{order.total}}</td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let order">
            <select (change)="updateStatus(order, $event)" [value]="order.status">
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </td>
        </ng-container>

        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Date</th>
          <td mat-cell *matCellDef="let order">{{order.createdAt | date}}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let order">
            <button mat-icon-button (click)="viewDetails(order)">
              <mat-icon>visibility</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `,
  styles: [`
    .orders-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header { margin-bottom: 24px; }
    .orders-table { width: 100%; }
    select { padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd; }
  `]
})
export class OrderManagementComponent {
  orders = [
    { id: 1001, customerName: 'John Doe', itemCount: 3, total: 149.99, status: 'pending', createdAt: new Date() },
    { id: 1002, customerName: 'Jane Smith', itemCount: 1, total: 89.50, status: 'processing', createdAt: new Date() },
    { id: 1003, customerName: 'Bob Johnson', itemCount: 5, total: 234.00, status: 'shipped', createdAt: new Date() }
  ];
  displayedColumns = ['id', 'customer', 'items', 'total', 'status', 'date', 'actions'];

  updateStatus(order: any, event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    // TODO: Update order status via API
  }

  viewDetails(order: any): void {
    // TODO: Open order details dialog
  }
}
