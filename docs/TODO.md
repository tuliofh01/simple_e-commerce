# TODO.md - Project Roadmap

## Stack
- **Backend**: DLang + Vibe-D + SQLite
- **Frontend**: Angular 17 + TypeScript + Angular Material
- **DevOps**: Bash + Docker + GitHub Actions
- **Diagrams**: Mermaid.js (no Java dependencies)

## Quick Status

| Layer | Status | Files |
|-------|--------|-------|
| Backend | ✅ Complete | 15 D files |
| Frontend Services | ✅ Complete | 6 services |
| Frontend Routes | ✅ Structure | 7 route files |
| Frontend Components | 🔄 Pending | 24 stubs needed |
| Backend Tests | 🔄 Pending | 6 test stubs |
| Documentation | ✅ Complete | 17 markdown files |
| Diagrams | 🔄 Migration | 8 PlantUML → Mermaid |

---

## Phase 1: Auth Components (P0)

### `frontend/src/app/features/auth/login/login.component.ts`
- Implement: Email/password form with Material
- Connect: AuthService.login()
- Handle: JWT storage, redirect on success
- Validate: Reactive forms validation

### `frontend/src/app/features/auth/register/register.component.ts`
- Implement: Registration form (email, password, name)
- Connect: AuthService.register()
- Handle: Validation errors, success redirect
- Validate: Password strength, email format

### `frontend/src/app/features/auth/forgot-password/forgot-password.component.ts`
- Implement: Email input form
- Connect: AuthService.requestPasswordReset()
- Handle: Success message, resend option

### `frontend/src/app/features/auth/reset-password/reset-password.component.ts`
- Implement: New password form (token from URL)
- Connect: AuthService.resetPassword()
- Validate: Password confirmation match

---

## Phase 2: Shop Components (P0)

### `frontend/src/app/features/shop/shop-list/shop-list.component.ts`
- Implement: Product grid with pagination
- Connect: ProductService.getProducts()
- Features: Category filter, sort options, search bar
- Navigate: Product detail on click

### `frontend/src/app/features/shop/product-detail/product-detail.component.ts`
- Implement: Full product view with images
- Connect: ProductService.getProduct(id)
- Features: Add to cart, quantity selector, related products
- Route: Product ID from URL param

### `frontend/src/app/features/shop/category/category.component.ts`
- Implement: Filtered product list by category
- Connect: ProductService.getByCategory()
- Features: Category breadcrumb, subcategory filter

### `frontend/src/app/features/shop/search/search.component.ts`
- Implement: Search results page
- Connect: ProductService.search(query)
- Features: Query display, result count, filters

---

## Phase 3: Cart & Checkout (P0)

### `frontend/src/app/features/checkout/cart/cart.component.ts`
- Implement: Cart items list with quantities
- Connect: CartService operations
- Features: Remove item, update quantity, totals
- Persist: localStorage sync

### `frontend/src/app/features/checkout/checkout/checkout.component.ts`
- Implement: Shipping form, order summary
- Connect: CartService + OrderService
- Features: Address validation, stock check
- Navigate: Stripe payment on submit

### `frontend/src/app/features/checkout/order-confirmation/order-confirmation.component.ts`
- Implement: Order success display
- Connect: OrderService.getOrder(id)
- Features: Order number, items list, next steps

---

## Phase 4: Account (P1)

### `frontend/src/app/features/account/profile/profile.component.ts`
- Implement: User profile display/edit
- Connect: AuthService.getProfile(), updateProfile()
- Features: Avatar, email, name, password change

### `frontend/src/app/features/account/orders/orders.component.ts`
- Implement: Order history list
- Connect: OrderService.getUserOrders()
- Features: Status badges, date filters, reorder

### `frontend/src/app/features/account/settings/settings.component.ts`
- Implement: Notification prefs, privacy settings
- Connect: User preferences API
- Features: Email toggles, password change

---

## Phase 5: Blog (P2)

### `frontend/src/app/features/blog/blog-list/blog-list.component.ts`
- Implement: Blog posts grid
- Connect: BlogService.getPosts()
- Features: Pagination, category filter, read time

### `frontend/src/app/features/blog/blog-post/blog-post.component.ts`
- Implement: Single post view with comments
- Connect: BlogService.getPost(id)
- Features: Markdown rendering, comment form

### `frontend/src/app/features/blog/blog-create/blog-create.component.ts`
- Implement: Rich text editor for posts
- Connect: BlogService.createPost()
- Features: Title, body, category, publish/save draft

---

## Phase 6: Admin (P1)

### `frontend/src/app/features/admin/dashboard/dashboard.component.ts`
- Implement: KPI cards (orders, revenue, products)
- Connect: StatsService.getDashboard()
- Features: Charts, recent orders, quick actions

### `frontend/src/app/features/admin/product-management/product-management.component.ts`
- Implement: Product CRUD table
- Connect: ProductService admin endpoints
- Features: Edit, delete, stock edit, bulk actions

### `frontend/src/app/features/admin/user-management/user-management.component.ts`
- Implement: User list with roles
- Connect: UserService admin endpoints
- Features: Role toggle, disable user, search

### `frontend/src/app/features/admin/order-management/order-management.component.ts`
- Implement: Order list with status
- Connect: OrderService admin endpoints
- Features: Status update, refund, export CSV

---

## Backend Tests (P1)

### `backend/tests/auth_test.d`
- Test: User registration, login, JWT validation
- Coverage: 100% auth_controller.d

### `backend/tests/product_test.d`
- Test: CRUD operations, search, categories
- Coverage: 100% product_controller.d

### `backend/tests/order_test.d`
- Test: Order creation, status updates, history
- Coverage: 100% order_controller.d

### `backend/tests/blog_test.d`
- Test: Post CRUD, comments, publishing
- Coverage: 100% blog_controller.d

### `backend/tests/cart_test.d`
- Test: Cart operations, persistence
- Coverage: Cart service logic

### `backend/tests/integration_test.d`
- Test: Full purchase flow
- Coverage: End-to-end scenarios

---

## Commands

```bash
# Generate diagrams (Mermaid)
bash generate_diagrams.sh

# Run backend
cd backend && dub run

# Test backend
cd backend && dub test

# Run frontend
cd frontend && npm start

# Test frontend
cd frontend && npm test

# Docker development
docker-compose -f docker-compose.dev.yml up -d
```

---

**Updated**: 2026-02-10  
**Stack**: DLang + Angular + Bash (no Java)
