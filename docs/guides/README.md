# Developer Guides

Comprehensive guides for developers working with Simple E-Commerce Platform.

## 📋 Guide Index

### Getting Started
- [Development Setup](development-setup.md) - Environment setup and first-time configuration
- [Project Structure](project-structure.md) - Code organization and file layout
- [Coding Standards](coding-standards.md) - Style guides and best practices

### Backend Development (DLang)
- [DLang Basics](dlang-basics.md) - Language features and patterns used
- [Backend Patterns](backend-patterns.md) - Architecture patterns and conventions
- [Database Development](database-development.md) - Schema design and data access
- [API Development](api-development.md) - RESTful API design and implementation

### Frontend Development (Angular)
- [Angular Basics](angular-basics.md) - Framework concepts and modern patterns
- [Component Development](component-development.md) - Building reusable UI components
- [State Management](state-management.md) - Data flow and service architecture
- [Route Guards](route-guards.md) - Authentication and authorization

### Integration & Testing
- [API Integration](api-integration.md) - Frontend-backend communication
- [Testing Strategies](testing-strategies.md) - Unit, integration, and E2E testing
- [Error Handling](error-handling.md) - Centralized error management
- [Performance Optimization](performance-optimization.md) - Best practices for speed

## 🎯 Development Philosophy

### 1. **Code Quality First**
- **Type Safety**: Leverage DLang and TypeScript for compile-time error checking
- **Clean Code**: Write self-documenting, maintainable code
- **Testing**: Comprehensive test coverage for critical paths
- **Documentation**: Clear comments and separate technical docs

### 2. **Modern Practices**
- **Component-Based**: Build reusable, composable components
- **Service-Oriented**: Separate business logic from presentation
- **Observable Patterns**: Use reactive programming for data flow
- **RESTful Design**: Follow API best practices and conventions

### 3. **Security Mindset**
- **Input Validation**: Never trust client input
- **Authentication**: Secure JWT token handling
- **Authorization**: Role-based access control
- **Data Protection**: Encrypt sensitive information

### 4. **Performance Awareness**
- **Lazy Loading**: Load code only when needed
- **Database Optimization**: Use indexes and efficient queries
- **Client-Side Caching**: Reduce unnecessary requests
- **Bundle Optimization**: Minimize JavaScript payload

## 🛠️ Development Environment

### Required Tools
```bash
# Backend (DLang)
dmd --version              # DLang compiler
dub --version              # D package manager

# Frontend (Angular)
node --version             # Node.js 18+
npm --version              # npm 9+
ng --version              # Angular CLI 17+

# Development Tools
git --version             # Git for version control
docker --version          # Docker for containerization
vscode --version          # Recommended IDE
```

### Recommended IDE Setup
```
VS Code Extensions:
├── DLang Extension Pack    # DLang support
├── Angular Language Service # Angular framework support
├── TypeScript Importer     # Import organization
├── Prettier             # Code formatting
├── ESLint               # Code quality
├── GitLens              # Git integration
└── Docker               # Container management
```

## 🔄 Development Workflow

### 1. **Feature Development**
```bash
# Create feature branch
git checkout -b feature/new-ecommerce-feature

# Backend development
cd backend
dub build          # Compile and check
dub test           # Run backend tests

# Frontend development
cd frontend
npm start          # Development server
npm test           # Run unit tests
```

### 2. **Code Quality Checks**
```bash
# Backend quality
dub test --coverage     # Run tests with coverage
dfmt --inplace source   # Format DLang code
dscanner source         # Static analysis

# Frontend quality
npm run lint           # Check code style
npm run test:ci        # Run tests with coverage
npm run build          # Verify production build
```

### 3. **Integration Testing**
```bash
# Start both services
cd backend && dub build && ./bin/simple_ecommerce &
cd frontend && npm start &

# Run integration tests
npm run test:integration
```

## 📚 Learning Resources

### DLang Resources
- [Official DLang Documentation](https://dlang.org/spec/spec.html)
- [vibe.d Framework Guide](https://vibe-d.readthedocs.io/)
- [DLang Tour](https://tour.dlang.org/)
- [D Cookbook](https://github.com/dlang-tour/core-dlang)

### Angular Resources
- [Angular Documentation](https://angular.io/docs)
- [Angular Material](https://material.angular.io/)
- [RxJS Documentation](https://rxjs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Best Practices
- [Clean Code Principles](https://blog.cleancoder.com/uncle-bob/2008/08/08/the-basics-of-clean-code.html)
- [REST API Design](https://restfulapi.net/)
- [JWT Best Practices](https://auth0.com/blog/json-web-token-best-practices)
- [Angular Style Guide](https://angular.io/guide/styleguide)

## 🎯 Common Development Tasks

### Adding New API Endpoint
1. **Model**: Define data structure in `backend/source/models/`
2. **Controller**: Implement handler in `backend/source/controllers/`
3. **Route**: Register endpoint in `backend/source/server.d`
4. **Service**: Create frontend service in `frontend/src/app/core/services/`
5. **Type**: Add interface to `frontend/src/app/core/interfaces/`
6. **Test**: Write unit and integration tests

### Creating New Angular Component
1. **Generate**: Use Angular CLI or manual component creation
2. **Template**: Create HTML template with Material Design
3. **Styles**: Add component-specific styling
4. **Logic**: Implement component class and methods
5. **Integration**: Add to parent component or routing
6. **Test**: Write component tests

### Database Schema Changes
1. **Migration**: Create SQL migration script
2. **Model**: Update DLang struct definitions
3. **Controller**: Update CRUD operations
4. **Indexes**: Add database indexes for performance
5. **Test**: Verify data integrity and queries

## 🔧 Troubleshooting

### Common Backend Issues
- **Import Errors**: Check module paths and dub.json dependencies
- **Database Issues**: Verify SQLite file permissions and path
- **Compilation Errors**: Check DLang syntax and library versions
- **Template Issues**: Verify template parameter types

### Common Frontend Issues
- **Import Errors**: Check Angular module imports and exports
- **Type Errors**: Verify TypeScript interfaces and types
- **Build Errors**: Check Angular CLI version and dependencies
- **Runtime Errors**: Check service initialization and observables

### Performance Issues
- **Slow API**: Check database queries and missing indexes
- **Large Bundles**: Check for unused imports and lazy loading
- **Memory Leaks**: Check for unsubscribed observables
- **Slow UI**: Check for blocking operations and change detection

---

**Next**: Get started with [Development Setup](development-setup.md) for your first-time configuration.