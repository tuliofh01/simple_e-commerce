import { Routes } from '@angular/router';

export const BlogRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./blog-list/blog-list.component').then(m => m.BlogListComponent),
    title: 'Blog'
  },
  {
    path: 'create',
    loadComponent: () => import('./blog-create/blog-create.component').then(m => m.BlogCreateComponent),
    title: 'Create Post'
  },
  {
    path: ':id',
    loadComponent: () => import('./blog-post/blog-post.component').then(m => m.BlogPostComponent),
    title: 'Blog Post'
  }
];
