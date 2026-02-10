import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

export const CheckoutRoutes: Routes = [
  {
    path: 'cart',
    loadComponent: () => import('./cart/cart.component').then(m => m.CartComponent),
    title: 'Shopping Cart'
  },
  {
    path: '',
    loadComponent: () => import('./checkout/checkout.component').then(m => m.CheckoutComponent),
    title: 'Checkout',
    canActivate: [AuthGuard]
  },
  {
    path: 'confirmation',
    loadComponent: () => import('./order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent),
    title: 'Order Confirmed'
  }
];
