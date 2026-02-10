// Blog Card Component
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BlogPost } from '../../../core/services/blog.service';

@Component({
  selector: 'app-blog-card',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card class="blog-card" [routerLink]="['/blog', post.id]">
      <div class="card-image" *ngIf="post.imageUrl">
        <img [src]="post.imageUrl" [alt]="post.title" loading="lazy">
      </div>
      
      <mat-card-content>
        <div class="meta-info">
          <span class="category" *ngIf="post.categories?.length">{{ post.categories[0] }}</span>
          <span class="date">{{ post.createdAt | date:'mediumDate' }}</span>
        </div>
        
        <h3 class="post-title">{{ post.title }}</h3>
        <p class="post-excerpt">{{ post.excerpt }}</p>
        
        <div class="tags" *ngIf="post.tags?.length">
          <span class="tag" *ngFor="let tag of post.tags.slice(0, 3)">#{{ tag }}</span>
        </div>
        
        <div class="author-info">
          <mat-icon>person</mat-icon>
          <span>{{ post.authorName || 'Admin' }}</span>
        </div>
      </mat-card-content>
      
      <mat-card-actions>
        <button mat-button color="primary">
          <mat-icon>read_more</mat-icon>
          Read More
        </button>
        <span class="reading-time">{{ post.readingTime || 5 }} min read</span>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .blog-card {
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: pointer;
      height: 100%;
      display: flex;
      flex-direction: column;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      }
    }

    .card-image {
      position: relative;
      padding-top: 56.25%; // 16:9 aspect ratio
      overflow: hidden;

      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      &:hover img {
        transform: scale(1.05);
      }
    }

    mat-card-content {
      padding: 1rem;
      flex: 1;
    }

    .meta-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      font-size: 0.75rem;
    }

    .category {
      background: #e3f2fd;
      color: #1976d2;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 500;
    }

    .date {
      color: #9e9e9e;
    }

    .post-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #212121;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .post-excerpt {
      font-size: 0.875rem;
      color: #757575;
      line-height: 1.6;
      margin-bottom: 1rem;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: 0.75rem;
    }

    .tag {
      font-size: 0.75rem;
      color: #2196f3;
    }

    .author-info {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.875rem;
      color: #757575;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    mat-card-actions {
      padding: 0.5rem 1rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .reading-time {
      font-size: 0.75rem;
      color: #9e9e9e;
    }
  `]
})
export class BlogCardComponent {
  @Input() post!: BlogPost;
}