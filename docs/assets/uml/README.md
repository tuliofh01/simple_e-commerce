# UML Diagrams

Complete UML documentation for Simple E-Commerce Platform architecture and flows.

## 📊 Diagram Index

### System Architecture
- [System Architecture](system-architecture.puml) - High-level system overview
- [Deployment Architecture](deployment-architecture.puml) - Container deployment view
- [Technology Stack](technology-stack.puml) - Technology components and relationships

### Backend Architecture
- [Backend Class Diagram](backend-class-diagram.puml) - DLang backend structure
- [Database Schema](database-schema.puml) - SQLite entity relationships
- [Repository Pattern](repository-pattern.puml) - Data access layer design

### Frontend Architecture
- [Frontend Components](frontend-components.puml) - Angular component hierarchy
- [Service Architecture](service-architecture.puml) - Angular service layer
- [Routing Architecture](routing-architecture.puml) - Navigation and guards

### Process Flows
- [Authentication Flow](authentication-flow.puml) - JWT implementation
- [Product CRUD](product-crud.puml) - Product management operations
- [Shopping Cart Flow](shopping-cart-flow.puml) - Cart to checkout process
- [Order Processing](order-processing.puml) - Complete order lifecycle

### Integration Patterns
- [API Design Patterns](api-design-patterns.puml) - RESTful conventions
- [Error Handling Flow](error-handling-flow.puml) - Centralized error management
- [Caching Strategy](caching-strategy.puml) - Performance optimization

## 🎯 Architecture Highlights

### DLang Backend Features
```
Controllers → Business Logic → Data Access → SQLite Database
     ↓              ↓                ↓              ↓
   HTTP Routes   JWT Security   Repository Pattern   ACID Transactions
```

### Angular Frontend Features
```
Components → Services → Interceptors → API
    ↓           ↓           ↓          ↓
 Templates   RxJS        Auth Headers  REST/JSON
```

### Integration Benefits
- **Type Safety**: DLang + TypeScript end-to-end
- **Performance**: Compiled backend + optimized frontend
- **Security**: JWT + rate limiting + validation
- **Scalability**: Modular architecture + database optimization

## 🔧 Technical Specifications

### System Boundaries
- **Frontend Port**: 4200 (development), 80/443 (production)
- **Backend Port**: 8080
- **Database**: Local SQLite file
- **Protocol**: HTTP/HTTPS with REST API

### Key Components
- **7 Database Tables**: Users, Products, Orders, Blog, Comments, Media, Expenses
- **30+ API Endpoints**: Full CRUD operations with security
- **20+ Angular Components**: Modular, reusable UI components
- **5 Feature Modules**: Auth, Shop, Blog, Account, Admin

### Security Architecture
- **Authentication**: JWT with HMAC-SHA256
- **Authorization**: Role-based access control (Admin/Moderator/User)
- **Rate Limiting**: IP-based throttling (5 attempts/15min)
- **Data Protection**: Encrypted passwords + secure headers

## 📈 Performance Characteristics

### Backend Performance
- **Response Time**: <200ms average
- **Concurrent Users**: ~100-500
- **Database Queries**: Optimized with indexes
- **Memory Usage**: <100MB typical

### Frontend Performance
- **Bundle Size**: <1MB (gzipped)
- **Load Time**: <2s first paint
- **Components**: Lazy loaded and tree-shakable
- **State Management**: Observable-based with caching

### Database Performance
- **Tables**: 7 main entities with relationships
- **Indexes**: Strategic indexes for common queries
- **Transactions**: ACID compliance
- **Scalability**: Suitable for SMB (up to 1TB)

## 🔄 Development Process

### Code Organization
```
Backend (DLang):
- Controllers: Request handlers and validation
- Models: Data structures and business logic
- Middleware: Authentication, CORS, rate limiting
- Database: Connection management and migrations

Frontend (Angular):
- Components: UI building blocks (standalone)
- Services: Business logic and API communication
- Guards: Route protection and access control
- Interceptors: HTTP request/response handling
```

### Integration Patterns
- **RESTful API**: Consistent endpoint design
- **JSON Communication**: Lightweight data exchange
- **Error Handling**: Centralized error management
- **Authentication Flow**: JWT token lifecycle management

## 🎯 Business Logic Coverage

### E-commerce Features
- **Product Management**: Categories, pricing, inventory, images
- **Shopping Cart**: LocalStorage persistence, quantity management
- **Order Processing**: Payment integration, status tracking
- **User Accounts**: Registration, profiles, order history

### Content Management
- **Blog System**: Posts, categories, tags, comments
- **Media Management**: File uploads, image optimization
- **Author Management**: User roles and permissions

### Administrative Features
- **Dashboard**: Overview with statistics
- **User Management**: Role assignment, account control
- **Order Management**: Status updates, shipping, refunds
- **Content Moderation**: Blog approval, comment management

## 🚀 Deployment Architecture

### Containerization
- **Backend**: DLang application in Alpine Linux
- **Frontend**: Angular bundles in Nginx container
- **Database**: SQLite with persistent volume
- **Networking**: Docker networks for service communication

### Production Features
- **HTTPS**: SSL/TLS encryption
- **Load Balancing**: Nginx reverse proxy
- **Static Files**: CDN-ready file serving
- **Monitoring**: Health checks and logging

---

**Next**: Explore individual diagram files for detailed technical specifications.