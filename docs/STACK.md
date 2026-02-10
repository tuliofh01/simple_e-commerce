# STACK.md - DLang + Angular Technology Stack Guide

## Overview

This document provides comprehensive guidance on the DLang + Angular technology stack used in this project. It covers challenges, use cases, tips, performance measures, and best practices specific to this technology combination.

## 🎯 Why This Stack?

### DLang Backend Benefits

| Feature | Benefit | Trade-off |
|---------|---------|-----------|
| **Native Performance** | 10x faster than Node.js | Longer compile times |
| **Type Safety** | Compile-time error detection | Learning curve |
| **Memory Safety** | Garbage collection + manual control | Memory overhead vs C++ |
| **Template Metaprogramming** | Zero-cost abstractions | Compile-time complexity |
| **vibe.d Framework** | Async-first, production-ready | Smaller ecosystem than Go |
| **SQLite Integration** | Zero-config, ACID-compliant | Single-writer limitation |

### Angular 17 Benefits

| Feature | Benefit | Trade-off |
|---------|---------|-----------|
| **Standalone Components** | No NgModules, tree-shakable | New patterns to learn |
| **TypeScript** | End-to-end type safety | Verbose at times |
| **RxJS** | Reactive programming patterns | Steep learning curve |
| **Material Design** | Professional UI out-of-box | Bundle size considerations |
| **Dependency Injection** | Testable, modular code | Complex dependency graphs |

### Why This Combination?

```
Performance + Productivity = DLang + Angular

DLang provides:
├── Native code performance (C-level speed)
├── Memory safety (garbage collection)
├── Compile-time type checking
└── Concurrency (async/await built-in)

Angular provides:
├── Enterprise-grade architecture
├── Reactive state management
├── Component-based UI
└── Comprehensive tooling
```

---

## 🔧 DLang Specific Challenges

### Challenge 1: Template Metaprogramming Complexity

**Problem**: Compile-time template magic can produce cryptic error messages.

**Example**:
```d
// Cryptic error example
template Repository(T) {
    static assert(is(T == struct), "Repository requires struct type");
}

// Error: template instance does not match constraint
```

**Solution**:
```d
// Clear constraint declaration
template Repository(T) {
    static assert(is(T == struct), 
        "Repository!(T): T must be a struct type. Got: " ~ T.stringof);
    
    // Provide helpful error messages
    static if (!is(T == struct)) {
        static assert(false, 
            "Repository!(T) requires struct type. " ~
            "Consider using class-based RepositoryClass!(T) for classes.");
    }
}
```

**Best Practice**:
```d
// Use constraints clearly
template Repository(T) 
    if (is(T == struct)) {
    // Implementation
}

// Usage shows clear intent
static assert(is(User == struct)); // Pre-check
alias UserRepo = Repository!User;  // Clear usage
```

### Challenge 2: vibe.d Async Patterns

**Problem**: Mixing blocking and async code can cause deadlocks.

**Example**:
```d
// WRONG: Blocking in async context
void handler(HTTPServerRequest req, HTTPServerResponse res) {
    auto result = blockingDatabaseCall(); // BAD: Blocks event loop
    res.writeBody(result.toString());
}

// CORRECT: Non-blocking approach
void handler(HTTPServerRequest req, HTTPServerResponse res) {
    runAsync({
        auto result = databaseCall();
        res.writeBody(result.toString());
    });
}
```

**Best Practice**:
```d
// Use vibe.d's async primitives
void handler(HTTPServerRequest req, HTTPServerResponse res) {
    // Non-blocking database call with callback
    db.query("SELECT * FROM products", (row) {
        // Process each row as it arrives
        processRow(row);
    });
    
    // Continue handling other requests
    res.writeBody("Processing started");
}
```

### Challenge 3: SQLite Connection Management

**Problem**: SQLite's single-writer model requires careful connection handling.

**Solution**:
```d
// Connection pool pattern
class DatabasePool {
    private Database[] connections;
    private Mutex mutex;
    
    this(size_t poolSize = 10) {
        mutex = new Mutex();
        foreach (i; 0..poolSize) {
            connections ~= new Database(connectionString);
        }
    }
    
    Database acquire() {
        synchronized(mutex) {
            if (!connections.empty) {
                return connections.popBack();
            }
            // Create new if pool exhausted
            return new Database(connectionString);
        }
    }
    
    void release(Database db) {
        synchronized(mutex) {
            connections ~= db;
        }
    }
}
```

---

## 🅰️ Angular Specific Challenges

### Challenge 1: Change Detection Performance

**Problem**: Default change detection can cause unnecessary re-renders.

**Solution**:
```typescript
// Use OnPush strategy for performance
@Component({
  selector: 'app-product-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent {
  @Input() product!: Product;
  
  constructor(private cdr: ChangeDetectorRef) {}
  
  ngOnChanges() {
    this.cdr.markForCheck(); // Manual trigger when needed
  }
}

// For async data, use async pipe
@Component({
  template: `
    <app-product-card 
      *ngFor="let product of products$ | async"
      [product]="product">
    </app-product-card>
  `
})
export class ProductListComponent {
  products$: Observable<Product[]>;
}
```

### Challenge 2: RxJS Memory Leaks

**Problem**: Subscriptions that aren't cleaned up cause memory leaks.

**Solution**:
```typescript
// WRONG: Leak
@Component({
  template: `<button (click)="loadData()">Load</button>`
})
export class BadComponent {
  ngOnInit() {
    this.dataService.getData().subscribe(data => {
      this.data = data;
    }); // Subscription never cleaned up!
  }
}

// CORRECT: Proper cleanup
@Component({
  template: `<button (click)="loadData()">Load</button>`
})
export class GoodComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    this.dataService.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.data = data;
      });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Challenge 3: Standalone Component Dependencies

**Problem**: Managing imports in standalone components can become unwieldy.

**Solution**:
```typescript
// Group imports logically
import { 
  CommonModule, 
  ReactiveFormsModule, 
  FormsModule 
} from '@angular/forms';

import { 
  MatCardModule, 
  MatButtonModule,
  MatInputModule,
  MatFormFieldModule 
} from '@angular/material';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ],
  template: `...`
})
export class ProductFormComponent {
  // Component logic
}

// For shared functionality, create shared module
@NgModule({
  imports: [SharedMaterialModule],
  exports: [SharedMaterialModule]
})
export class SharedMaterialModule {}
```

---

## 📊 Performance Measures

### Backend Performance (DLang)

#### Response Time Targets
| Endpoint Type | Target P50 | Target P95 | Target P99 |
|--------------|------------|------------|------------|
| Simple GET | < 10ms | < 50ms | < 100ms |
| List with pagination | < 50ms | < 100ms | < 200ms |
| Complex query | < 100ms | < 200ms | < 500ms |
| Write operations | < 50ms | < 100ms | < 200ms |

#### Memory Usage Targets
| Scenario | Target | Maximum |
|----------|--------|---------|
| Idle server | < 50MB | < 100MB |
| Under load | < 100MB | < 200MB |
| Peak (1000 concurrent) | < 200MB | < 500MB |

#### Benchmark Commands
```bash
# Run wrk benchmarks
wrk -t4 -c100 -d30s http://localhost:8080/api/products

# ab (Apache Benchmark)
ab -n 1000 -c 10 http://localhost:8080/api/products

# vegeta (modern load testing)
echo "GET http://localhost:8080/api/products" | \
  vegeta attack -rate=100 -duration=30s | \
  vegeta report
```

### Frontend Performance (Angular)

#### Core Web Vitals Targets
| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| LCP (Largest Contentful Paint) | < 2.5s | < 4.0s |
| FID (First Input Delay) | < 100ms | < 300ms |
| CLS (Cumulative Layout Shift) | < 0.1 | < 0.25 |
| INP (Interaction to Next Paint) | < 200ms | < 500ms |

#### Bundle Size Targets
| Bundle | Target | Maximum |
|--------|--------|---------|
| Initial (gzip) | < 150KB | < 200KB |
| Total JS (gzip) | < 500KB | < 1MB |
| CSS (gzip) | < 50KB | < 100KB |

#### Performance Commands
```bash
# Angular bundle analysis
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/stats.json

# Lighthouse CI
lighthouse http://localhost:4200 --output=json --output-path=./lighthouse.json

# Chrome DevTools Performance
# 1. Open DevTools > Performance
# 2. Record while performing actions
# 3. Analyze long tasks and frame drops
```

---

## 🛠️ Tooling Recommendations

### Development Tools
| Tool | Purpose | DLang | Angular |
|------|---------|-------|---------|
| VS Code | IDE | ✅ DLang extension | ✅ Native support |
| IntelliJ IDEA | IDE | ✅ D plugin | ✅ Ultimate |
| GitLens | Git history | ✅ | ✅ |
| Docker | Containerization | ✅ | ✅ |

### Testing Tools
| Tool | Type | Command |
|------|------|---------|
| dub test | Backend unit | `dub test` |
| ng test | Frontend unit | `npm run test` |
| Karate | API integration | `karate test` |
| Cypress | E2E | `npm run test:e2e` |
| k6 | Load testing | `k6 run script.js` |

### Performance Tools
| Tool | Purpose | Usage |
|------|---------|-------|
| wrk | HTTP benchmarking | `wrk -t4 -c100 -d30s URL` |
| dtrace | DLang profiling | `dtrace -p PID` |
| Chrome DevTools | Frontend profiling | DevTools > Performance |
| Lighthouse | Web vitals | `lighthouse URL` |

---

## 💡 Use Cases

### Use Case 1: High-Traffic E-commerce

**Scenario**: 10,000+ products, 1,000+ concurrent users

**DLang Advantage**:
- Native performance handles concurrent requests efficiently
- Low memory footprint scales under load
- Compile-time optimization eliminates runtime overhead

**Angular Advantage**:
- Lazy loading keeps initial bundle small
- Standalone components enable tree-shaking
- Service worker provides offline capability

**Architecture**:
```
CDN → Load Balancer → N × DLang Backend → Redis Cache → SQLite/PostgreSQL
```

### Use Case 2: Content-Rich Blog + Shop

**Scenario**: Heavy content, SEO focus, integrated commerce

**DLang Advantage**:
- Fast server-side rendering for SEO
- Efficient templating (diet-ng)
- Built-in caching mechanisms

**Angular Advantage**:
- Angular Universal for SSR
- Meta service for SEO tags
- Angular Material for professional UI

### Use Case 3: API-First Platform

**Scenario**: Mobile app + web + third-party integrations

**DLang Advantage**:
- Clean REST API design
- Fast serialization (vibe.data)
- WebSocket support for real-time

**Angular Advantage**:
- TypeScript shares types with backend
- Consistent data models across platforms
- Interceptors handle auth uniformly

---

## 🎓 Learning Curve Tips

### DLang for Java/C# Developers
```
Transition Tips:
├── Understand value types vs references (struct vs class)
├── Learn template constraints (if statements)
├── Embrace immutability where possible
├── Use vibe.d's async/await patterns
└── Leverage std.range and std.algorithm

Common Mistakes:
├── Forgetting @property decorators
├── Mixing mutable and immutable data
├── Ignoring const-correctness
└── Overusing templates (simplicity first)
```

### Angular for React/Vue Developers
```
Transition Tips:
├── Angular has DI built-in (no Redux needed)
├── Templates are HTML-first (not JSX)
├── RxJS is mandatory (not optional)
├── Modules replaced by standalone components
└── Strict TypeScript from the start

Common Mistakes:
├── Putting everything in one component
├── Ignoring OnPush change detection
├── Not unsubscribing from observables
├── Forgetting trackBy in *ngFor
└── Over-nesting components
```

---

## 🔒 Security Best Practices

### DLang Backend
```d
// Validate ALL input
void handler(HTTPServerRequest req, HTTPServerResponse res) {
    auto username = req.jsonBody["username"].str;
    
    // Input sanitization
    enforce(username.length >= 3, "Username too short");
    enforce(username.length <= 50, "Username too long");
    enforce(isValidUsername(username), "Invalid username");
    
    // SQL injection prevention (use parameterized queries)
    db.execute("SELECT * FROM users WHERE username = ?", username);
}

// JWT validation on every protected route
void protectedHandler(HTTPServerRequest req, HTTPServerResponse res) {
    auto token = extractToken(req);
    auto payload = jwtHandler.validateToken(token);
    enforce(!payload.expired, "Token expired");
}
```

### Angular Frontend
```typescript
// Sanitize user input
constructor(private sanitizer: DomSanitizer) {}

sanitizeContent(userContent: string): SafeHtml {
  return this.sanitizer.bypassSecurityTrustHtml(userContent);
}

// Use HTTP interceptors for auth
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next.handle(req);
  }
}
```

---

## 📚 Recommended Resources

### DLang
- [Official DLang Documentation](https://dlang.org/spec/spec.html)
- [vibe.d Framework Guide](https://vibe-d.github.io/)
- [Dlang Tour](https://tour.dlang.org/)
- [D Cookbook](https://github.com/dlang-tour)

### Angular
- [Angular Documentation](https://angular.io/docs)
- [Angular Material](https://material.angular.io/)
- [RxJS Documentation](https://rxjs.dev/)
- [Angular Best Practices](https://angular.io/guide/styleguide)

### Performance
- [web.dev/vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Chrome Performance](https://developer.chrome.com/docs/devtools/performance/)

---

## 🔧 Troubleshooting Quick Reference

### DLang Issues
| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| Compile error in templates | Type mismatch | Check constraints with static assert |
| Memory growing | Reference cycles | Use weakRef or manual cleanup |
| Slow compile | Template bloat | Use explicit instantiation |
| Runtime crash | Null dereference | Enable bounds checking in debug |

### Angular Issues
| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| Memory leak | Unsubscribed observables | Use takeUntil pattern |
| Slow renders | Default change detection | Use OnPush strategy |
| Large bundle | Unused imports | Tree-shake, lazy load |
| Test failures | Async timing | Use fakeAsync, tick |

---

**Document Version**: 1.0.0  
**Last Updated**: 2024-02-09  
**Stack**: DLang 2.1xx + Angular 17