# Frontend Architecture - Angular 17 Design Patterns

## 🎨 **Architectural Philosophy**

### **Why Angular 17 for E-commerce?**

**Enterprise-Ready Component System**
- **Standalone Components**: Zero boilerplate, tree-shakable, better performance
- **Dependency Injection**: Built-in service location and testability
- **TypeScript Safety**: End-to-end type checking from API to UI
- **Reactive Programming**: RxJS for complex state management scenarios
- **Material Design**: Enterprise UI components out-of-the-box

**Result**: Frontend that scales to 1000+ components while maintaining developer productivity.

## 🏗️ **Modern Angular Architecture**

```
┌─────────────────────────────────────────────────┐
│                Component Layer                │
│  Standalone Components → Templates → Styles    │
├─────────────────────────────────────────────────┤
│              Service Layer                   │
│  API Services → State Management → Cache     │
├─────────────────────────────────────────────────┤
│              Security Layer                  │
│  Route Guards → HTTP Interceptors → Auth    │
├─────────────────────────────────────────────────┤
│               Data Layer                    │
│  Type Definitions → Validation → Forms     │
├─────────────────────────────────────────────────┤
│            Presentation Layer               │
│  Material Design → Responsive → Themes      │
└─────────────────────────────────────────────────┘
```

## 🧩 **Standalone Components Strategy**

### **Component Architecture Pattern**
```typescript
// Modern Angular 17 Standalone Component
@Component({
  selector: 'app-product-card',
  standalone: true,                          // No NgModule boilerplate
  imports: [
    CommonModule,                             // Core directives
    MatCardModule,                           // Material components
    MatButtonModule,
    MatIconModule
  ],
  template: `/* Template */`,
  styles: [/* Component styles */],
  changeDetection: ChangeDetectionStrategy.OnPush  // Performance optimization
})
export class ProductCardComponent {
  @Input() product!: Product;               // Input with type safety
  @Output() addToCart = new EventEmitter<Product>(); // Output events
  
  constructor(
    private cartService: CartService,          // Service injection
    private cdr: ChangeDetectorRef            // Performance control
  ) {}
  
  onAddToCart(): void {
    this.cartService.addItem(this.product);      // Business logic delegation
    this.cdr.markForCheck();                  // Manual change detection
  }
}
```

### **Component Composition Strategy**
```typescript
// Feature component composition
@Component({
  selector: 'app-shop-list',
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule,
    ProductCardComponent,                      // Import standalone components
    LoadingSpinnerComponent,                    // Reusable components
    PaginationComponent
  ]
})
export class ShopListComponent {
  products$ = new BehaviorSubject<Product[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  pagination$ = new BehaviorSubject<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  
  constructor(private productService: ProductService) {
    this.loadProducts();
  }
  
  private loadProducts(): void {
    combineLatest([
      this.products$.pipe(debounceTime(300)),
      this.pagination$.pipe(distinctUntilChanged())
    ]).pipe(
      switchMap(([products, pagination]) => {
        this.loading$.next(true);
        return this.productService.getProducts({
          page: pagination.page,
          limit: pagination.limit,
          search: this.searchTerm
        });
      })
    ).subscribe({
      next: (response) => {
        this.products$.next(response.products);
        this.pagination$.next(response.pagination);
        this.loading$.next(false);
      },
      error: (error) => {
        this.loading$.next(false);
        this.handleError(error);
      }
    });
  }
}
```

## 🔧 **Service Layer Architecture**

### **Reactive Service Pattern**
```typescript
// Observable-based state management
@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>({
    items: [],
    totalItems: 0,
    totalPrice: 0
  });
  
  public cart$ = this.cartSubject.asObservable();  // Read-only stream
  
  constructor(private storageService: StorageService) {
    this.loadFromStorage();                       // Persistent state
  }
  
  // Command pattern for state modifications
  addItem(item: CartItem): void {
    const currentCart = this.cartSubject.value;
    const updatedCart = this.calculateUpdatedCart(currentCart, item);
    
    this.cartSubject.next(updatedCart);            // Immutability
    this.saveToStorage(updatedCart);              // Persistence
    this.notifyAnalytics('cart_item_added', item); // Side effects
  }
  
  // Query pattern for state reading
  getTotalPrice(): Observable<number> {
    return this.cart$.pipe(
      map(cart => cart.totalPrice),
      distinctUntilChanged()
    );
  }
  
  getItemQuantity(productId: number): Observable<number> {
    return this.cart$.pipe(
      map(cart => {
        const item = cart.items.find(i => i.id === productId);
        return item ? item.quantity : 0;
      }),
      distinctUntilChanged()
    );
  }
}
```

### **API Service Pattern**
```typescript
// Type-safe HTTP client wrapper
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}
  
  // Generic typed HTTP methods
  get<T>(endpoint: string, params?: Record<string, any>): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpParams = this.buildParams(params);
    
    return this.http.get<T>(url, { params: httpParams }).pipe(
      catchError(this.handleError<T>('GET', endpoint))
    );
  }
  
  post<T>(endpoint: string, body: any): Observable<T> {
    const url = this.buildUrl(endpoint);
    
    return this.http.post<T>(url, body).pipe(
      catchError(this.handleError<T>('POST', endpoint))
    );
  }
  
  // Type-safe specialized methods
  getProducts(filters: ProductFilters): Observable<ProductListResponse> {
    return this.get<ProductListResponse>('products', {
      category: filters.category,
      search: filters.search,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort,
      order: filters.order
    });
  }
}
```

## 🔐 **Security Layer Architecture**

### **Route Guards Pattern**
```typescript
// Hierarchical authentication system
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // 1. Check authentication
    if (!this.authService.isAuthenticated()) {
      this.redirectToLogin(state.url);
      return false;
    }
    
    // 2. Check authorization (role-based)
    const requiredRole = route.data['role'] as string;
    if (requiredRole && !this.authService.hasRole(requiredRole)) {
      this.showAccessDenied();
      return false;
    }
    
    // 3. Check resource ownership
    const resourceId = route.params['id'];
    if (resourceId && !this.checkOwnership(resourceId)) {
      this.showAccessDenied();
      return false;
    }
    
    return true;
  }
  
  private redirectToLogin(returnUrl: string): void {
    this.authService.setRedirectUrl(returnUrl);
    this.router.navigate(['/auth/login']);
  }
}

// Specialized guards for different scenarios
@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  canActivate(): boolean {
    return this.authService.isAdmin();
  }
}

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  canActivate(): boolean {
    return !this.authService.isAuthenticated();
  }
}
```

### **HTTP Interceptor Pattern**
```typescript
// Automatic token management and error handling
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip for public endpoints
    if (this.isPublicEndpoint(req.url)) {
      return next.handle(req);
    }
    
    // Add authentication
    const authReq = this.addAuthentication(req);
    
    // Handle response with automatic token refresh
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handleTokenRefresh(req, next);
        }
        return throwError(error);
      })
    );
  }
  
  private addAuthentication(req: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.getToken();
    
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }
  
  private handleTokenRefresh(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.refreshToken().pipe(
      switchMap(newToken => {
        const retryReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`
          }
        });
        return next.handle(retryReq);
      }),
      catchError(error => {
        this.authService.logout();
        return throwError(error);
      })
    );
  }
}
```

## 📱 **Responsive Design Architecture**

### **Mobile-First Component Strategy**
```typescript
// Responsive directive for adaptive UI
@Directive({
  selector: '[appResponsive]'
})
export class ResponsiveDirective implements OnInit, OnDestroy {
  @Input() config: ResponsiveConfig = {};
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
    private breakpointObserver: BreakpointObserver
  ) {}
  
  ngOnInit(): void {
    this.breakpointObserver.observe([
      Breakpoints.XSmall,   // Mobile
      Breakpoints.Small,    // Tablet
      Breakpoints.Medium,   // Small desktop
      Breakpoints.Large,    // Desktop
      Breakpoints.XLarge    // Large desktop
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(result => {
      this.updateClasses(result.breakpoints);
    });
  }
  
  private updateClasses(breakpoints: { [key: string]: boolean }): void {
    const element = this.element.nativeElement;
    
    // Remove all responsive classes
    Object.keys(this.config).forEach(size => {
      this.renderer.removeClass(element, `responsive-${size}`);
    });
    
    // Add active responsive classes
    Object.entries(breakpoints).forEach(([size, isActive]) => {
      if (isActive && this.config[size]) {
        this.renderer.addClass(element, `responsive-${size}`);
        this.renderer.setStyle(element, this.config[size].property, this.config[size].value);
      }
    });
  }
}

// Usage in templates
<div [appResponsive]="{
  xs: { property: 'gridTemplateColumns', value: '1fr' },
  md: { property: 'gridTemplateColumns', value: 'repeat(2, 1fr)' },
  lg: { property: 'gridTemplateColumns', value: 'repeat(4, 1fr)' }
}">
  <!-- Content adapts to screen size -->
</div>
```

## 🎨 **Theme and UI Architecture**

### **Design System Implementation**
```typescript
// Centralized theme management
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private currentTheme$ = new BehaviorSubject<Theme>('light');
  
  private themes: Record<string, Theme> = {
    light: {
      primary: '#1976d2',
      accent: '#ff4081',
      warn: '#f44336',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#212121'
    },
    dark: {
      primary: '#90caf9',
      accent: '#ff4081',
      warn: '#f44336',
      background: '#121212',
      surface: '#1e1e1e',
      text: '#ffffff'
    }
  };
  
  constructor() {
    this.applyTheme(this.currentTheme$.value);
  }
  
  setTheme(themeName: string): void {
    const theme = this.themes[themeName];
    if (theme) {
      this.currentTheme$.next(theme);
      this.applyTheme(theme);
      this.saveThemePreference(themeName);
    }
  }
  
  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    
    Object.entries(theme).forEach(([property, value]) => {
      root.style.setProperty(`--theme-${property}`, value);
    });
    
    root.setAttribute('data-theme', theme === this.themes.dark ? 'dark' : 'light');
  }
}
```

## ⚡ **Performance Optimization**

### **Lazy Loading Strategy**
```typescript
// Feature module lazy loading
const routes: Routes = [
  {
    path: 'shop',
    loadChildren: () => import('./features/shop/shop.routes')
      .then(m => m.ShopRoutes)  // Code splitting
  },
  {
    path: 'admin',
    canLoad: [AdminGuard],  // Security + lazy loading
    loadChildren: () => import('./features/admin/admin.routes')
      .then(m => m.AdminRoutes)
  }
];

// Component-level lazy loading
@Component({
  selector: 'app-product-list',
  standalone: true,
  template: `
    <ng-container *ngIf="loaded$ | async; else loading">
      <app-product-card 
        *ngFor="let product of products$ | async" 
        [product]="product"
        (addToCart)="onAddToCart($event)">
      </app-product-card>
    </ng-container>
    
    <ng-template #loading>
      <app-loading-spinner></app-loading-spinner>
    </ng-template>
  `
})
export class ProductListComponent {
  products$ = new BehaviorSubject<Product[]>([]);
  loaded$ = new BehaviorSubject<boolean>(false);
  
  constructor(private productService: ProductService) {}
  
  ngOnInit(): void {
    this.productService.getProducts().pipe(
      delay(200),  // Prevent flickering
      finalize(() => this.loaded$.next(true))
    ).subscribe(products => {
      this.products$.next(products);
    });
  }
}
```

### **Change Detection Optimization**
```typescript
// OnPush strategy with immutable state
@Component({
  selector: 'app-cart-summary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartSummaryComponent {
  @Input() cart: Cart;
  
  // Derived properties with memoization
  get formattedTotal(): string {
    return this.cart.totalPrice.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  }
  
  get itemCount(): number {
    return this.cart.totalItems;
  }
  
  get canCheckout(): boolean {
    return this.itemCount > 0 && this.cart.totalPrice > 0;
  }
}
```

## 🔄 **State Management Architecture**

### **Service-Based State Pattern**
```typescript
// Centralized application state
@Injectable({ providedIn: 'root' })
export class AppStateService {
  private state$ = new BehaviorSubject<AppState>({
    user: null,
    cart: { items: [], totalItems: 0, totalPrice: 0 },
    products: [],
    loading: false,
    error: null
  });
  
  // Read-only selectors
  readonly user$ = this.state$.pipe(
    select(state => state.user),
    distinctUntilChanged()
  );
  
  readonly cart$ = this.state$.pipe(
    select(state => state.cart),
    distinctUntilKeyChanged(['totalItems', 'totalPrice'])
  );
  
  readonly isAuthenticated$ = this.user$.pipe(
    map(user => !!user),
    distinctUntilChanged()
  );
  
  // State actions
  updateUser(user: User | null): void {
    this.state$.next({
      ...this.state$.value,
      user
    });
  }
  
  addToCart(item: CartItem): void {
    const currentState = this.state$.value;
    const updatedCart = this.calculateCartUpdate(currentState.cart, item);
    
    this.state$.next({
      ...currentState,
      cart: updatedCart
    });
  }
}
```

## 📊 **Analytics and Monitoring**

### **Performance Monitoring**
```typescript
// Built-in performance tracking
@Injectable({ providedIn: 'root' })
export class PerformanceService {
  constructor(private router: Router) {
    this.trackNavigation();
    this.trackCoreWebVitals();
  }
  
  private trackNavigation(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Page load time tracking
      const loadTime = performance.now();
      this.trackEvent('page_view', {
        path: event.urlAfterRedirects,
        loadTime: Math.round(loadTime)
      });
    });
  }
  
  private trackCoreWebVitals(): void {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver(list => {
      list.forEach(entry => {
        if (entry.entryType === 'largest-contentful-paint') {
          this.trackEvent('lcp', {
            value: Math.round(entry.startTime),
            element: entry.element?.tagName
          });
        }
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // First Input Delay (FID)
    new PerformanceObserver(list => {
      list.forEach(entry => {
        if (entry.entryType === 'first-input') {
          this.trackEvent('fid', {
            value: Math.round(entry.processingStart - entry.startTime)
          });
        }
      });
    }).observe({ entryTypes: ['first-input'] });
  }
}
```

---

**This architecture delivers enterprise-grade performance, maintainability, and scalability while leveraging Angular 17's modern features for optimal developer experience.**