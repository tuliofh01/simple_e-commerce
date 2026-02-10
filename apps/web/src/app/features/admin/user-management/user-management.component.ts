import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatSelectModule],
  template: `
    <div class="users-container">
      <div class="header">
        <h1>User Management</h1>
      </div>

      <table mat-table [dataSource]="users" class="users-table">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>ID</th>
          <td mat-cell *matCellDef="let user">{{user.id}}</td>
        </ng-container>

        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let user">{{user.name}}</td>
        </ng-container>

        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Email</th>
          <td mat-cell *matCellDef="let user">{{user.email}}</td>
        </ng-container>

        <ng-container matColumnDef="role">
          <th mat-header-cell *matHeaderCellDef>Role</th>
          <td mat-cell *matCellDef="let user">
            <select (change)="changeRole(user, $event)" [value]="user.role">
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let user">
            <span [class.active]="user.active" [class.inactive]="!user.active">
              {{user.active ? 'Active' : 'Inactive'}}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let user">
            <button mat-icon-button (click)="toggleStatus(user)">
              <mat-icon>{{user.active ? 'block' : 'check_circle'}}</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `,
  styles: [`
    .users-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header { margin-bottom: 24px; }
    .users-table { width: 100%; }
    select { padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd; }
    span.active { color: green; }
    span.inactive { color: red; }
  `]
})
export class UserManagementComponent {
  users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'customer', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', active: true },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'customer', active: false }
  ];
  displayedColumns = ['id', 'name', 'email', 'role', 'status', 'actions'];

  changeRole(user: any, event: Event): void {
    const role = (event.target as HTMLSelectElement).value;
    // TODO: Update user role via API
  }

  toggleStatus(user: any): void {
    user.active = !user.active;
    // TODO: Update user status via API
  }
}
