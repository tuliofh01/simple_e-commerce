import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

export const AdminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Admin Dashboard',
    canActivate: [AuthGuard],
    data: { role: 'admin' }
  },
  {
    path: 'products',
    loadComponent: () => import('./product-management/product-management.component').then(m => m.ProductManagementComponent),
    title: 'Product Management',
    canActivate: [AuthGuard],
    data: { role: 'admin' }
  },
  {
    path: 'users',
    loadComponent: () => import('./user-management/user-management.component').then(m => m.UserManagementComponent),
    title: 'User Management',
    canActivate: [AuthGuard],
    data: { role: 'admin' }
  },
  {
    path: 'orders',
    loadComponent: () => import('./order-management/order-management.component').then(m => m.OrderManagementComponent),
    title: 'Order Management',
    canActivate: [AuthGuard],
    data: { role: 'admin' }
  }
];
