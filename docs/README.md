# Simple E-Commerce Platform

A minimalist, enterprise-grade e-commerce solution built with **DLang** (backend) and **Angular 17** (frontend).

## Stack
- **Backend**: DLang + Vibe-D + SQLite
- **Frontend**: Angular 17 + TypeScript + Angular Material
- **DevOps**: Bash + Docker + GitHub Actions
- **Diagrams**: Mermaid.js (no Java dependencies)

## Status

| Layer | Status | Files |
|-------|--------|-------|
| Backend | ✅ Complete | 15 D files |
| Frontend Services | ✅ Complete | 6 services |
| Frontend Routes | ✅ Structure | 7 route files |
| Frontend Components | 🔄 Stubs | 24 components |
| Backend Tests | 🔄 Stubs | 6 test files |
| Documentation | ✅ Complete | 17 markdown files |
| Diagrams | 🔄 Migration | 8 Mermaid files |

## Quick Start

```bash
# Backend
cd backend && dub run

# Frontend
cd frontend && npm start

# Docker
docker-compose -f docker-compose.dev.yml up -d
```

## Documentation

```
docs/
├── README.md              ← You are here
├── TODO.md                ← Implementation plan
├── STACK.md               ← Stack guide
├── architecture/          ← Design docs
├── developer-guide/       ← API reference
├── getting-started/       ← Installation
├── guides/               ← How-to guides
├── performance/          ← Load testing
└── assets/
    ├── diagrams/         ← SVG/PNG diagrams
    └── uml/             ← Mermaid sources
```

## Next Steps

1. Complete Angular components (login, shop, cart, checkout)
2. Add Stripe payment integration
3. Write backend unit tests
4. Configure email notifications

## License

Apache 2.0