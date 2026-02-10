module features.shop.shop_routes;

import { Routes } from '@angular/router';

export const ShopRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shop-list/shop-list.component').then(m => m.ShopListComponent),
    title: 'Shop'
  },
  {
    path: ':id',
    loadComponent: () => import('./product-detail/product-detail.component').then(m => m.ProductDetailComponent),
    title: 'Product Details'
  },
  {
    path: 'category/:category',
    loadComponent: () => import('./category/category.component').then(m => m.CategoryComponent),
    title: 'Category'
  },
  {
    path: 'search',
    loadComponent: () => import('./search/search.component').then(m => m.SearchComponent),
    title: 'Search Results'
  }
];