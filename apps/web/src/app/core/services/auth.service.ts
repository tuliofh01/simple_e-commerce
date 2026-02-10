// Auth Service - JWT Authentication
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresAt: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  constructor(
    private apiService: ApiService,
    private storageService: StorageService
  ) {
    this.loadStoredAuth();
  }

  // Load stored authentication on initialization
  private loadStoredAuth(): void {
    const token = this.storageService.get(this.TOKEN_KEY);
    const user = this.storageService.getJSON<User>(this.USER_KEY);
    
    if (token && user) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  // Login
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('auth/login', credentials).pipe(
      tap(response => {
        this.handleAuthResponse(response);
      })
    );
  }

  // Register
  register(data: RegisterRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('auth/register', data).pipe(
      tap(response => {
        this.handleAuthResponse(response);
      })
    );
  }

  // Logout
  logout(): void {
    this.storageService.remove(this.TOKEN_KEY);
    this.storageService.remove(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  // Refresh token
  refreshToken(): Observable<{ token: string; expiresAt: Date }> {
    const token = this.storageService.get(this.TOKEN_KEY);
    
    return this.apiService.postAuth<{ token: string; expiresAt: Date }>(
      'auth/refresh',
      token,
      {}
    ).pipe(
      tap(response => {
        this.storageService.set(this.TOKEN_KEY, response.token);
      })
    );
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Get token
  getToken(): string | null {
    return this.storageService.get(this.TOKEN_KEY);
  }

  // Check if user has role
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Handle authentication response
  private handleAuthResponse(response: LoginResponse): void {
    this.storageService.set(this.TOKEN_KEY, response.token);
    this.storageService.setJSON(this.USER_KEY, response.user);
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  // Update user profile
  updateProfile(data: Partial<User>): Observable<User> {
    const token = this.getToken();
    return this.apiService.putAuth<User>('auth/profile', token!, data).pipe(
      tap(user => {
        this.storageService.setJSON(this.USER_KEY, user);
        this.currentUserSubject.next(user);
      })
    );
  }

  // Change password
  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    const token = this.getToken();
    return this.apiService.postAuth<{ message: string }>(
      'auth/change-password',
      token!,
      { currentPassword, newPassword, confirmPassword: newPassword }
    );
  }

  // Forgot password (stub)
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.apiService.post<{ message: string }>('auth/forgot-password', { email });
  }

  // Reset password (stub)
  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.apiService.post<{ message: string }>('auth/reset-password', { token, newPassword });
  }
}