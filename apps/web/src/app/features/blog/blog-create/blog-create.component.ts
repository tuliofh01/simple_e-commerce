import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BlogService } from '../../../core/services/blog.service';

@Component({
  selector: 'app-blog-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatSlideToggleModule],
  template: `
    <div class="create-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Create New Post</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="postForm" (ngSubmit)="createPost()">
            <mat-form-field>
              <mat-label>Title</mat-label>
              <input matInput formControlName="title" placeholder="Enter post title">
            </mat-form-field>

            <mat-form-field>
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                <mat-option *ngFor="let cat of categories" [value]="cat">{{cat}}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Excerpt</mat-label>
              <textarea matInput formControlName="excerpt" rows="3" placeholder="Brief description..."></textarea>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Content</mat-label>
              <textarea matInput formControlName="content" rows="15" placeholder="Write your post content (Markdown supported)..."></textarea>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Image URL</mat-label>
              <input matInput formControlName="imageUrl" placeholder="https://...">
            </mat-form-field>

            <div class="form-actions">
              <mat-slide-toggle formControlName="published">Publish immediately</mat-slide-toggle>
              <div class="buttons">
                <button mat-button type="button" routerLink="/blog">Cancel</button>
                <button mat-stroked-button type="button" (click)="saveDraft()">Save Draft</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="postForm.invalid || publishing">
                  {{publishing ? 'Publishing...' : 'Publish'}}
                </button>
              </div>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .create-container { padding: 24px; max-width: 800px; margin: 0 auto; }
    form { display: flex; flex-direction: column; gap: 16px; }
    mat-form-field { width: 100%; }
    textarea[matInput] { font-family: monospace; }
    .form-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; }
    .buttons { display: flex; gap: 8px; }
  `]
})
export class BlogCreateComponent {
  postForm: FormGroup;
  publishing = false;
  categories = ['Technology', 'Lifestyle', 'Business', 'Tutorial', 'News'];

  constructor(private fb: FormBuilder, private blogService: BlogService) {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      excerpt: ['', Validators.required],
      content: ['', Validators.required],
      imageUrl: [''],
      published: [false]
    });
  }

  createPost(): void {
    if (this.postForm.invalid) return;
    this.publishing = true;
    this.blogService.createPost(this.postForm.value).subscribe({
      next: () => { this.publishing = false; /* TODO: Navigate */ },
      error: () => this.publishing = false
    });
  }

  saveDraft(): void {
    const draft = { ...this.postForm.value, published: false };
    this.blogService.createPost(draft).subscribe({
      next: () => { /* TODO: Show success */ },
      error: () => { /* TODO: Handle error */ }
    });
  }
}
