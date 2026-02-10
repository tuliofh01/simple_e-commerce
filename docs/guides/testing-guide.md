# Unit Testing Guide

Comprehensive guide for creating and running unit tests for both DLang backend and Angular frontend.

## 📋 Table of Contents

1. [DLang Backend Testing](#dlang-backend-testing)
2. [Angular Frontend Testing](#angular-frontend-testing)
3. [Test Organization](#test-organization)
4. [Best Practices](#best-practices)
5. [CI/CD Integration](#cicd-integration)

---

## 🦋 DLang Backend Testing

### Overview

DLang has built-in unit testing with the `unittest` block and `dub test` command.

### Test Structure

```
backend/
├── source/
│   └── controllers/
│       └── auth_controller.d
├── tests/
│   ├── unit/
│   │   ├── controllers/
│   │   │   └── auth_controller_tests.d
│   │   ├── models/
│   │   │   └── user_tests.d
│   │   └── services/
│   │       └── jwt_handler_tests.d
│   └── integration/
│       └── api_tests.d
└── dub.json
```

### Basic Unit Test Structure

```d
// tests/unit/models/user_tests.d
module tests.unit.models.user_tests;

import source.models.user;
import std.stdio;

// Unit tests for User model
unittest {
    writeln("Running User model tests...");
    
    // Test user creation with defaults
    {
        auto user = User.fresh("testuser", "test@example.com");
        assert(user.id == 0, "New user should have id 0");
        assert(user.username == "testuser");
        assert(user.email == "test@example.com");
        assert(user.role == "user", "Default role should be user");
        assert(!user.isAdmin(), "New user should not be admin");
        writeln("  ✅ User creation with defaults passed");
    }
    
    // Test admin role
    {
        auto admin = User.fresh("admin", "admin@example.com", "admin");
        assert(admin.role == "admin");
        assert(admin.isAdmin() == true);
        assert(admin.isModerator() == true);
        writeln("  ✅ Admin role tests passed");
    }
    
    // Test moderator role
    {
        auto mod = User.fresh("mod", "mod@example.com", "moderator");
        assert(mod.role == "moderator");
        assert(mod.isAdmin() == false);
        assert(mod.isModerator() == true);
        writeln("  ✅ Moderator role tests passed");
    }
}
```

### Controller Testing

```d
// tests/unit/controllers/auth_controller_tests.d
module tests.unit.controllers.auth_controller_tests;

import source.controllers.auth_controller;
import source.crypto.jwt_handler;
import source.database.db_connection;
import std.stdio;

unittest {
    writeln("Running AuthController tests...");
    
    // Test login validation
    {
        auto controller = new AuthController();
        assert(controller !is null);
        writeln("  ✅ AuthController instantiation passed");
    }
    
    // Test JWT token generation
    {
        auto jwt = new JWTHandler("test-secret");
        auto user = User.fresh("testuser", "test@example.com");
        user.id = 123;
        
        auto token = jwt.generateToken(user);
        assert(token !is null);
        assert(token.length > 0);
        
        // Verify token can be decoded
        auto payload = jwt.validateToken(token);
        assert(payload.userId == 123);
        assert(payload.username == "testuser");
        writeln("  ✅ JWT token tests passed");
    }
}
```

### Database Testing

```d
// tests/integration/database_tests.d
module tests.integration.database_tests;

import source.database.db_connection;
import source.models.product;
import std.stdio;

unittest {
    writeln("Running Database integration tests...");
    
    auto db = Database.getInstance();
    assert(db !is null);
    
    // Test database connection
    {
        auto result = db.query("SELECT 1 as test");
        assert(!result.empty);
        writeln("  ✅ Database connection test passed");
    }
    
    // Test product CRUD
    {
        // Create
        auto product = Product.fresh("Test Product", 99.99);
        auto created = db.execute(
            "INSERT INTO products (name, price) VALUES (?, ?)",
            product.name, product.price
        );
        
        auto productId = db.lastInsertRowid();
        assert(productId > 0);
        writeln("  ✅ Product create test passed");
        
        // Read
        auto result = db.query(
            "SELECT * FROM products WHERE id = ?",
            productId
        );
        assert(!result.empty);
        writeln("  ✅ Product read test passed");
        
        // Cleanup
        db.execute("DELETE FROM products WHERE id = ?", productId);
        writeln("  ✅ Product cleanup passed");
    }
}
```

### Running DLang Tests

```bash
# Run all tests
cd backend
dub test

# Run with coverage
dub test --coverage

# Run specific test module
dub test --config=test -- -v

# Generate coverage report
dub test --coverage
ls -la coverage_html/  # Open index.html

# Verbose output
dub test -v
```

### DLang Test Coverage Target

```bash
# dub.json configuration for coverage
{
    "buildTypes": {
        "unittest": {
            "buildOptions": ["unittestMode", "debugMode", "profile"]
        }
    },
    "preBuildCommands": ["rdmd --eval='module xref' source/app.d"]
}
```

---

## 🅰️ Angular Frontend Testing

### Overview

Angular uses Jasmine/Karma for unit testing and Cypress for E2E testing.

### Test Structure

```
frontend/
├── src/
│   └── app/
│       ├── core/
│       │   ├── services/
│       │   │   ├── auth.service.spec.ts
│       │   │   ├── cart.service.spec.ts
│       │   │   └── product.service.spec.ts
│       │   ├── guards/
│       │   │   └── auth.guard.spec.ts
│       │   └── interceptors/
│       │       └── auth.interceptor.spec.ts
│       ├── features/
│       │   └── home/
│       │       └── home.component.spec.ts
│       └── shared/
│           └── components/
│               └── product-card/
│                   └── product-card.component.spec.ts
├── karma.conf.js
└── tsconfig.spec.json
```

### Service Testing

```typescript
// src/app/core/services/auth.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { of, throwError } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let apiService: jasmine.SpyObj<ApiService>;
  let storageService: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['post', 'get']);
    const storageSpy = jasmine.createSpyObj('StorageService', ['get', 'set', 'remove']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: apiSpy },
        { provide: StorageService, useValue: storageSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should call API with correct credentials', () => {
      const mockResponse = {
        token: 'test-token',
        user: { id: 1, username: 'testuser', email: 'test@example.com' },
        expiresAt: new Date()
      };
      
      apiService.post.and.returnValue(of(mockResponse));
      storageService.set.and.returnValue();

      service.login({ username: 'testuser', password: 'password' })
        .subscribe(response => {
          expect(response.token).toBe('test-token');
          expect(response.user.username).toBe('testuser');
          expect(apiService.post).toHaveBeenCalledWith(
            'auth/login',
            { username: 'testuser', password: 'password' }
          );
        });
    });

    it('should store token on successful login', () => {
      const mockResponse = {
        token: 'test-token',
        user: { id: 1, username: 'testuser', email: 'test@example.com' },
        expiresAt: new Date()
      };
      
      apiService.post.and.returnValue(of(mockResponse));
      storageService.set.and.returnValue();

      service.login({ username: 'testuser', password: 'password' })
        .subscribe(() => {
          expect(storageService.set).toHaveBeenCalledWith('auth_token', 'test-token');
        });
    });

    it('should handle login error', () => {
      apiService.post.and.returnValue(throwError(() => new Error('Invalid credentials')));

      service.login({ username: 'invalid', password: 'wrong' })
        .subscribe({
          next: () => fail('should have thrown an error'),
          error: (error) => {
            expect(error.message).toBe('Invalid credentials');
          }
        });
    });
  });

  describe('logout', () => {
    it('should clear stored auth data', () => {
      storageService.remove.and.returnValue();

      service.logout();

      expect(storageService.remove).toHaveBeenCalledWith('auth_token');
      expect(storageService.remove).toHaveBeenCalledWith('auth_user');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      storageService.get.and.returnValue('some-token');

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when no token', () => {
      storageService.get.and.returnValue(null);

      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has role', () => {
      const mockUser = { id: 1, username: 'testuser', role: 'admin' };
      storageService.getJSON.and.returnValue(mockUser);

      expect(service.hasRole('admin')).toBe(true);
    });

    it('should return false when user lacks role', () => {
      const mockUser = { id: 1, username: 'testuser', role: 'user' };
      storageService.getJSON.and.returnValue(mockUser);

      expect(service.hasRole('admin')).toBe(false);
    });

    it('should return false when not authenticated', () => {
      storageService.getJSON.and.returnValue(null);

      expect(service.hasRole('user')).toBe(false);
    });
  });
});
```

### Component Testing

```typescript
// src/app/shared/components/product-card/product-card.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductCardComponent } from './product-card.component';
import { CartService } from '../../../core/services/cart.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';

describe('ProductCardComponent', () => {
  let component: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;
  let cartService: jasmine.SpyObj<CartService>;

  const mockProduct = {
    id: 1,
    name: 'Test Product',
    description: 'A test product description',
    price: 99.99,
    originalPrice: 129.99,
    stock: 10,
    imageUrl: 'test-image.jpg',
    category: 'electronics',
    slug: 'test-product',
    isNew: true,
    isSale: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    const cartSpy = jasmine.createSpyObj('CartService', ['addItem']);

    await TestBed.configureTestingModule({
      declarations: [ProductCardComponent],
      imports: [MatCardModule, MatButtonModule, MatIconModule],
      providers: [{ provide: CartService, useValue: cartSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
    component.product = mockProduct;
    cartService = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display product name', () => {
    const nameEl = fixture.debugElement.query(By.css('.product-title')).nativeElement;
    expect(nameEl.textContent).toContain('Test Product');
  });

  it('should display current price', () => {
    const priceEl = fixture.debugElement.query(By.css('.current-price')).nativeElement;
    expect(priceEl.textContent).toContain('99.99');
  });

  it('should display original price when on sale', () => {
    const originalPriceEl = fixture.debugElement.query(By.css('.original-price'));
    expect(originalPriceEl).toBeTruthy();
    expect(originalPriceEl.nativeElement.textContent).toContain('129.99');
  });

  it('should show in stock indicator', () => {
    const stockEl = fixture.debugElement.query(By.css('.in-stock'));
    expect(stockEl).toBeTruthy();
    expect(stockEl.nativeElement.textContent).toContain('In Stock');
  });

  it('should emit addToCart event when button clicked', () => {
    spyOn(component.addToCart, 'emit');
    
    const button = fixture.debugElement.query(By.css('button[mat-raised-button]'));
    button.triggerEventHandler('click', null);
    
    expect(component.addToCart.emit).toHaveBeenCalledWith(mockProduct);
  });

  it('should disable button when out of stock', () => {
    component.product = { ...mockProduct, stock: 0 };
    fixture.detectChanges();
    
    const button = fixture.debugElement.query(By.css('button[mat-raised-button]'));
    expect(button.nativeElement.disabled).toBe(true);
  });
});
```

### Guard Testing

```typescript
// src/app/core/guards/auth.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'hasRole']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  describe('canActivate', () => {
    it('should return true when authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);

      const result = guard.canActivate();

      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should redirect to login when not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);

      const result = guard.canActivate();

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should check required role when specified', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.hasRole.and.returnValue(true);

      const route = { data: { role: 'admin' } } as any;
      const result = guard.canActivate(route);

      expect(result).toBe(true);
      expect(authService.hasRole).toHaveBeenCalledWith('admin');
    });

    it('should deny access when user lacks required role', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.hasRole.and.returnValue(false);

      const route = { data: { role: 'admin' } } as any;
      const result = guard.canActivate(route);

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/unauthorized']);
    });
  });
});
```

### Running Angular Tests

```bash
# Run all tests
cd frontend
npm test

# Run with coverage
npm run test:ci

# Run specific test file
npm test -- --include=**/auth.service.spec.ts

# Run tests in watch mode (development)
npm test -- --watch=true

# Run with debugging
npm test -- --browsers=ChromeDebug

# Generate coverage report
npm test -- --code-coverage
ls -la coverage/  # Open index.html
```

### Test Configuration

```javascript
// karma.conf.js
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        random: true,
        stopOnSpecFailure: false
      },
      clearContext: false
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcov' }
      ],
      check: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80
        }
      }
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true
  });
};
```

---

## 📁 Test Organization

### Naming Conventions

| Type | Pattern | Example |
|------|----------|----------|
| Backend Unit | `*_tests.d` | `auth_controller_tests.d` |
| Backend Integration | `*_tests.d` | `api_tests.d` |
| Frontend Unit | `*.spec.ts` | `auth.service.spec.ts` |
| Frontend E2E | `*.e2e-spec.ts` | `checkout.e2e-spec.ts` |

### Test Categories

```
tests/
├── unit/                   # Fast, isolated tests
│   ├── models/
│   ├── controllers/
│   ├── services/
│   └── utils/
├── integration/             # Multiple units together
│   ├── api/
│   └── database/
├── e2e/                    # Full user journeys
│   ├── auth.spec.ts
│   ├── checkout.spec.ts
│   └── products.spec.ts
└── fixtures/              # Test data
    ├── users.json
    ├── products.json
    └── orders.json
```

---

## ✅ Best Practices

### DLang Testing

```d
// DO: Use descriptive test names
unittest {
    writeln("User authentication with valid credentials succeeds");
    {
        // Test implementation
    }
    
    writeln("User authentication with invalid password fails");
    {
        // Test implementation
    }
}

// DON'T: Vague test names
unittest {
    // Test 1
    {
        // Implementation
    }
    
    // Test 2
    {
        // Implementation
    }
}
```

### Angular Testing

```typescript
// DO: Use descriptive it() statements
it('should emit addToCart event with product data when add button is clicked', () => {
    // Test implementation
});

// DON'T: Vague descriptions
it('should work', () => {
    // Test implementation
});
```

### Test Isolation

```typescript
// DO: Use beforeEach to reset state
describe('CartService', () => {
  let service: CartService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CartService]
    });
    service = TestBed.inject(CartService);
  });
  
  beforeEach(() => {
    // Reset cart before each test
    service.clearCart();
  });
  
  it('should add item to cart', () => {
    // Test
  });
  
  it('should remove item from cart', () => {
    // Test
  });
});

// DON'T: Share state between tests
describe('CartService', () => {
  let service = new CartService(); // Shared state!
  
  it('test 1', () => {
    service.addItem(item1); // Mutates shared state
  });
  
  it('test 2', () => {
    // This test sees item1 from test 1!
  });
});
```

### Mocking External Dependencies

```typescript
// DO: Mock HTTP calls
const mockHttp = {
  get: jasmine.createSpy('get').and.returnValue(of(mockData)),
  post: jasmine.createSpy('post').and.returnValue(of(response))
};

// DON'T: Make real HTTP calls
it('should fetch user from real API', () => {
  const http = new HttpClient();
  http.get('/api/user/1').subscribe(); // Real API call - BAD!
});
```

### Test Coverage Goals

```yaml
coverage_targets:
  backend:
    statements: 80%
    branches: 80%
    functions: 80%
    lines: 80%
    
  frontend:
    statements: 80%
    branches: 80%
    functions: 80%
    lines: 80%
    
  critical_paths:
    authentication: 100%
    payment_checkout: 100%
    cart_operations: 100%
```

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/tests.yml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install DLang
        uses: dlang-community/setup-dlang@v1
        with:
          compiler: dmd
          
      - name: Install dependencies
        run: cd backend && dub fetch && dub install
        
      - name: Run tests
        run: cd backend && dub test --coverage
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: coverage/lcov.info

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: cd frontend && npm ci
        
      - name: Run tests
        run: cd frontend && npm run test:ci
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: coverage/lcov.info
```

### Quick Test Script

```bash
#!/bin/bash
# run-all-tests.sh

echo "======================================"
echo "  Running All Tests"
echo "======================================"

# Backend tests
echo ""
echo "🔧 Running Backend Tests..."
cd backend
dub test --coverage
echo "✅ Backend tests complete"

# Frontend tests
echo ""
echo "🅰️  Running Frontend Tests..."
cd ../frontend
npm test -- --browsers=ChromeHeadless --code-coverage
echo "✅ Frontend tests complete"

# Generate combined report
echo ""
echo "📊 Generating combined report..."
# Combine coverage reports here

echo ""
echo "======================================"
echo "  All Tests Complete"
echo "======================================"
```

---

## 📚 References

### DLang Testing
- [Dlang Official Testing](https://dlang.org/spec/unittest.html)
- [Dub Testing](https://dub.pm/package-format-json.html#configurations)

### Angular Testing
- [Angular Testing Guide](https://angular.io/guide/testing)
- [Jasmine Documentation](https://jasmine.github.io/)
- [Karma Runner](https://karma-runner.github.io/)

---

**Document Version**: 1.0.0  
**Last Updated**: 2024-02-09  
**Coverage Target**: 80%