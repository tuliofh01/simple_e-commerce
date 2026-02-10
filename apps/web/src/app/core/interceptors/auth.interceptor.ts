// Auth Interceptor - JWT token injection
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip auth for public endpoints
    const publicEndpoints = ['auth/login', 'auth/register', 'auth/forgot-password'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      request.url.includes(endpoint)
    );

    if (isPublicEndpoint) {
      return next.handle(request);
    }

    // Get token
    const token = this.authService.getToken();

    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expired, try to refresh
          return this.authService.refreshToken().pipe(
            switchMap(response => {
              // Retry request with new token
              request = this.addToken(request, response.token);
              return next.handle(request);
            }),
            catchError(refreshError => {
              // Refresh failed, logout user
              this.authService.logout();
              return throwError(() => refreshError);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}