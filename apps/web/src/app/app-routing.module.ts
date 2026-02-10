import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/auth.guard';

// Components
import { HomeComponent } from './features/home/home.component';

const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent,
    title: 'Home - Simple E-Commerce'
  },
  { 
    path: 'auth', 
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AuthRoutes),
    canActivate: [GuestGuard]
  },
  { 
    path: 'shop', 
    loadChildren: () => import('./features/shop/shop.routes').then(m => m.ShopRoutes),
    title: 'Shop'
  },
  { 
    path: 'blog', 
    loadChildren: () => import('./features/blog/blog.routes').then(m => m.BlogRoutes),
    title: 'Blog'
  },
  { 
    path: 'account', 
    loadChildren: () => import('./features/account/account.routes').then(m => m.AccountRoutes),
    canActivate: [AuthGuard],
    title: 'My Account'
  },
  { 
    path: 'admin', 
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.AdminRoutes),
    canActivate: [AuthGuard],
    data: { role: 'admin' },
    title: 'Admin Dashboard'
  },
  { 
    path: 'checkout', 
    loadChildren: () => import('./features/checkout/checkout.routes').then(m => m.CheckoutRoutes),
    canActivate: [AuthGuard],
    title: 'Checkout'
  },
  { 
    path: '**', 
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }