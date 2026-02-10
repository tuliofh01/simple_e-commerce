// Blog Service
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  authorId: number;
  authorName: string;
  status: string;
  tags: string[];
  categories: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface BlogComment {
  id: number;
  postId: number;
  userId: number;
  userName: string;
  content: string;
  status: string;
  parentId?: number;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  constructor(private apiService: ApiService) {}

  getPosts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
  }): Observable<{ posts: BlogPost[]; pagination: any }> {
    return this.apiService.get<{ posts: BlogPost[]; pagination: any }>('blog/posts', params);
  }

  getPost(id: number): Observable<BlogPost> {
    return this.apiService.get<BlogPost>(`blog/posts/${id}`);
  }

  getPostBySlug(slug: string): Observable<BlogPost> {
    return this.apiService.get<BlogPost>(`blog/posts/slug/${slug}`);
  }

  getLatestPosts(limit?: number): Observable<BlogPost[]> {
    return this.apiService.get<BlogPost[]>('blog/posts', { limit, status: 'published' });
  }

  getComments(postId: number): Observable<BlogComment[]> {
    return this.apiService.get<BlogComment[]>(`blog/posts/${postId}/comments`);
  }

  createPost(post: Partial<BlogPost>): Observable<BlogPost> {
    return this.apiService.post<BlogPost>('blog/posts', post);
  }

  updatePost(id: number, post: Partial<BlogPost>): Observable<BlogPost> {
    return this.apiService.put<BlogPost>(`blog/posts/${id}`, post);
  }

  deletePost(id: number): Observable<void> {
    return this.apiService.delete<void>(`blog/posts/${id}`);
  }

  createComment(postId: number, comment: Partial<BlogComment>): Observable<BlogComment> {
    return this.apiService.post<BlogComment>(`blog/posts/${postId}/comments`, comment);
  }

  updateComment(id: number, comment: Partial<BlogComment>): Observable<BlogComment> {
    return this.apiService.put<BlogComment>(`blog/comments/${id}`, comment);
  }

  deleteComment(id: number): Observable<void> {
    return this.apiService.delete<void>(`blog/comments/${id}`);
  }
}