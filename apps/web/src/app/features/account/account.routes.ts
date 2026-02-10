import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

export const AccountRoutes: Routes = [
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
    title: 'Profile'
  },
  {
    path: 'orders',
    loadComponent: () => import('./orders/orders.component').then(m => m.OrdersComponent),
    title: 'My Orders'
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent),
    title: 'Settings'
  }
];
