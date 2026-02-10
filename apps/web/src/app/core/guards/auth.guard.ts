// Auth Guard - Route protection
import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.checkAuth(route, state);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.checkAuth(childRoute, state);
  }

  private checkAuth(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Check if user is authenticated
    if (this.authService.isAuthenticated()) {
      // Check if route requires specific role
      const requiredRole = route.data['role'] as string | undefined;
      
      if (requiredRole && !this.authService.hasRole(requiredRole)) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
      
      return true;
    }

    // Store attempted URL for redirecting after login
    sessionStorage.setItem('redirectUrl', state.url);

    // Navigate to login page
    this.router.navigate(['/auth/login']);
    return false;
  }
}

// Admin Guard - Requires admin role
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAdmin()) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}

// Guest Guard - Only for non-authenticated users
@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (!this.authService.isAuthenticated()) {
      return true;
    }

    // User is already logged in, redirect to home
    this.router.navigate(['/']);
    return false;
  }
}