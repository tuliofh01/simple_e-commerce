// Auth Service Unit Tests
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthService } from '../../../src/app/core/services/auth.service';
import { ApiService } from '../../../src/app/core/services/api.service';
import { StorageService } from '../../../src/app/core/services/storage.service';

describe('AuthService', () => {
  let service: AuthService;
  let apiService: ApiService;
  let storageService: StorageService;
  let httpMock: HttpTestingController;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    token: 'test-token'
  };

  const mockLoginResponse = {
    user: mockUser,
    token: 'test-token'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService, ApiService, StorageService]
    });
    
    service = TestBed.inject(AuthService);
    apiService = TestBed.inject(ApiService);
    storageService = TestBed.inject(StorageService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear storage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login user', () => {
    const credentials = { email: 'test@example.com', password: 'password' };
    
    service.login(credentials).subscribe(response => {
      expect(response).toEqual(mockLoginResponse);
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.getCurrentUser()).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${service.apiService.getBaseUrl()}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    req.flush(mockLoginResponse);
  });

  it('should register user', () => {
    const userData = { 
      email: 'test@example.com', 
      password: 'password',
      name: 'Test User'
    };
    
    service.register(userData).subscribe(response => {
      expect(response).toEqual(mockLoginResponse);
      expect(service.isAuthenticated()).toBeTrue();
    });

    const req = httpMock.expectOne(`${service.apiService.getBaseUrl()}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(userData);
    req.flush(mockLoginResponse);
  });

  it('should logout user', () => {
    // Mock authenticated state
    service.setToken('test-token');
    service.setCurrentUser(mockUser);
    
    service.logout();
    
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.getToken()).toBeNull();
    expect(service.getCurrentUser()).toBeNull();
  });

  it('should check authentication status', () => {
    expect(service.isAuthenticated()).toBeFalse();
    
    service.setToken('test-token');
    expect(service.isAuthenticated()).toBeTrue();
    
    service.setToken(null);
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should get current user', () => {
    expect(service.getCurrentUser()).toBeNull();
    
    service.setCurrentUser(mockUser);
    expect(service.getCurrentUser()).toEqual(mockUser);
    
    service.setCurrentUser(null);
    expect(service.getCurrentUser()).toBeNull();
  });

  it('should handle login errors', () => {
    const credentials = { email: 'test@example.com', password: 'password' };
    const errorResponse = { error: { message: 'Invalid credentials' }, status: 401 };
    
    service.login(credentials).subscribe({
      next: () => {},
      error: error => {
        expect(error.status).toBe(401);
        expect(error.error.message).toBe('Invalid credentials');
      }
    });

    const req = httpMock.expectOne(`${service.apiService.getBaseUrl()}/auth/login`);
    req.flush(errorResponse.error, { status: 401, statusText: 'Unauthorized' });
  });

  it('should handle registration errors', () => {
    const userData = { 
      email: 'test@example.com', 
      password: 'password',
      name: 'Test User'
    };
    const errorResponse = { error: { message: 'Email already exists' }, status: 409 };
    
    service.register(userData).subscribe({
      next: () => {},
      error: error => {
        expect(error.status).toBe(409);
        expect(error.error.message).toBe('Email already exists');
      }
    });

    const req = httpMock.expectOne(`${service.apiService.getBaseUrl()}/auth/register`);
    req.flush(errorResponse.error, { status: 409, statusText: 'Conflict' });
  });

  it('should emit authentication status changes', (done) => {
    service.authStatus$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        expect(isAuthenticated).toBeTrue();
        done();
      }
    });
    
    service.setToken('test-token');
  });

  it('should handle token expiration', () => {
    service.setToken('test-token');
    expect(service.isAuthenticated()).toBeTrue();
    
    service.setToken(null);
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should handle multiple concurrent authentication requests', () => {
    const credentials = { email: 'test@example.com', password: 'password' };
    
    const firstLogin = service.login(credentials);
    const secondLogin = service.login(credentials);
    
    const req1 = httpMock.expectOne(`${service.apiService.getBaseUrl()}/auth/login`);
    const req2 = httpMock.expectOne(`${service.apiService.getBaseUrl()}/auth/login`);
    
    expect(req1).toBeTruthy();
    expect(req2).toBeTruthy();
    
    req1.flush(mockLoginResponse);
    req2.flush(mockLoginResponse);
    
    firstLogin.subscribe(response => {
      expect(response).toEqual(mockLoginResponse);
    });
    
    secondLogin.subscribe(response => {
      expect(response).toEqual(mockLoginResponse);
    });
  });

  it('should handle network errors during login', () => {
    const credentials = { email: 'test@example.com', password: 'password' };
    
    service.login(credentials).subscribe({
      next: () => {},
      error: error => {
        expect(error.message).toContain('Network error');
      }
    });

    const req = httpMock.expectOne(`${service.apiService.getBaseUrl()}/auth/login`);
    req.error(new ErrorEvent('Network error'));
  });
});