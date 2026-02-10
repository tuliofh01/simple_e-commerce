import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BlogService } from '../../../core/services/blog.service';
import { BlogPost, Comment } from '../../../core/interfaces';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="post-container" *ngIf="post">
      <mat-card>
        <img mat-card-image [src]="post.imageUrl" [alt]="post.title">
        <mat-card-content>
          <div class="post-meta">
            <span class="category">{{post.category}}</span>
            <span class="author">By {{post.authorName}}</span>
            <span class="date">{{post.createdAt | date}}</span>
          </div>
          <h1>{{post.title}}</h1>
          <div class="post-content" [innerHTML]="post.content"></div>
        </mat-card-content>
      </mat-card>

      <mat-card class="comments-section">
        <mat-card-header>
          <mat-card-title>Comments ({{comments.length}})</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div *ngFor="let comment of comments" class="comment">
            <div class="comment-header">
              <strong>{{comment.authorName}}</strong>
              <span>{{comment.createdAt | date}}</span>
            </div>
            <p>{{comment.content}}</p>
          </div>

          <div class="comment-form">
            <h4>Leave a Comment</h4>
            <textarea placeholder="Write your comment..."></textarea>
            <button mat-raised-button color="primary">Post Comment</button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .post-container { padding: 24px; max-width: 800px; margin: 0 auto; }
    mat-card img { width: 100%; height: 400px; object-fit: cover; }
    .post-meta { display: flex; gap: 16px; margin-bottom: 16px; font-size: 14px; color: #666; }
    .category { background: #e3f2fd; color: #1565c0; padding: 4px 12px; border-radius: 16px; }
    h1 { margin: 16px 0; font-size: 32px; }
    .post-content { line-height: 1.8; font-size: 16px; }
    .comments-section { margin-top: 24px; }
    .comment { padding: 16px 0; border-bottom: 1px solid #eee; }
    .comment-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .comment-form { margin-top: 24px; }
    .comment-form textarea { width: 100%; min-height: 100px; padding: 12px; margin-bottom: 12px; border: 1px solid #ddd; border-radius: 4px; }
  `]
})
export class BlogPostComponent implements OnInit {
  post: BlogPost | null = null;
  comments: Comment[] = [];

  constructor(private route: ActivatedRoute, private blogService: BlogService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.blogService.getPost(id).subscribe({
        next: (post) => this.post = post,
        error: () => { /* TODO: Handle error */ }
      });
      this.blogService.getComments(id).subscribe({
        next: (comments) => this.comments = comments
      });
    }
  }
}
