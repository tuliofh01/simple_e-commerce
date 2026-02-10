import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { BlogService } from '../../../core/services/blog.service';
import { BlogPost } from '../../../core/interfaces';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule],
  template: `
    <div class="blog-container">
      <h1>Blog</h1>
      <div class="blog-grid">
        <mat-card *ngFor="let post of posts" class="blog-card">
          <img mat-card-image [src]="post.imageUrl" [alt]="post.title">
          <mat-card-content>
            <div class="post-meta">
              <span class="category">{{post.category}}</span>
              <span class="date">{{post.createdAt | date}}</span>
            </div>
            <h2>{{post.title}}</h2>
            <p>{{post.excerpt}}</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" [routerLink]="['/blog', post.id]">Read More</button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .blog-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    h1 { margin-bottom: 24px; }
    .blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px; }
    .blog-card { cursor: pointer; }
    .blog-card img { height: 200px; object-fit: cover; }
    .post-meta { display: flex; gap: 16px; margin-bottom: 8px; font-size: 12px; color: #666; }
    .category { background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 4px; }
    h2 { margin: 8px 0; font-size: 20px; }
    p { color: #666; }
  `]
})
export class BlogListComponent implements OnInit {
  posts: BlogPost[] = [];

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.blogService.getPosts().subscribe({
      next: (posts) => this.posts = posts,
      error: () => { /* TODO: Handle error */ }
    });
  }
}
