#!/bin/bash

# AI Context Generator
# Generates a comprehensive JSON file describing the project for AI assistants
# Usage: ./generate-ai-context.sh [output_file]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "${SCRIPT_DIR}")")"
OUTPUT_FILE=""

# Detect project state
detect_project_state() {
    local backend_status="unknown"
    local frontend_status="unknown"
    
    # Check backend
    if [ -f "${PROJECT_ROOT}/backend/source/server.d" ]; then
        backend_status="implemented"
        if grep -q "blog_controller" "${PROJECT_ROOT}/backend/source/server.d" 2>/dev/null; then
            backend_status="complete"
        fi
    fi
    
    # Check frontend
    if [ -f "${PROJECT_ROOT}/frontend/package.json" ]; then
        if [ -f "${PROJECT_ROOT}/frontend/src/app/app.component.ts" ]; then
            frontend_status="implemented"
        fi
        if [ -f "${PROJECT_ROOT}/frontend/src/app/features/auth/auth.routes.ts" ]; then
            frontend_status="structure_ready"
        fi
    fi
    
    echo "${backend_status}:${frontend_status}"
}

# Generate JSON context
generate_context() {
    local state=$(detect_project_state)
    local backend_state=$(echo "$state" | cut -d: -f1)
    local frontend_state=$(echo "$state" | cut -d: -f2)
    
    # Get last commit info
    local last_commit=$(cd "${PROJECT_ROOT}" && git log -1 --format='%H%n%an%n%ae%n%ad%n%s' --date=iso-strict 2>/dev/null || echo "unknown")
    local commit_hash=$(echo "$last_commit" | head -1)
    local last_author=$(echo "$last_commit" | head -2 | tail -1)
    local commit_date=$(echo "$last_commit" | head -3 | tail -1)
    local commit_message=$(echo "$last_commit" | head -4 | tail -1)
    
    # Get file counts
    local backend_files=$(find "${PROJECT_ROOT}/backend/source" -name "*.d" 2>/dev/null | wc -l | tr -d ' ')
    local frontend_files=$(find "${PROJECT_ROOT}/frontend/src/app" -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
    local test_files=$(find "${PROJECT_ROOT}" -name "*.spec.ts" 2>/dev/null | wc -l | tr -d ' ')
    local doc_files=$(find "${PROJECT_ROOT}/docs" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    
    # Count UML diagrams
    local uml_files=$(find "${PROJECT_ROOT}/docs/assets/uml" -name "*.puml" 2>/dev/null | wc -l | tr -d ' ')
    local diagram_count=$(find "${PROJECT_ROOT}/docs/assets/diagrams" -name "*.svg" 2>/dev/null | wc -l | tr -d ' ')
    
    # Get dependencies
    local backend_deps="vibe-d"
    local frontend_deps=$(cat "${PROJECT_ROOT}/frontend/package.json" 2>/dev/null | jq -r '.dependencies | keys[]' 2>/dev/null | tr '\n' ',' | sed 's/,$//' || echo "unknown")
    
    # Generate timestamp
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    # Generate JSON
    cat > "${OUTPUT_FILE}" << EOF
{
  "metadata": {
    "generated_at": "${timestamp}",
    "generator_version": "1.0.0",
    "git_commit": "${commit_hash}",
    "git_author": "${last_author}",
    "git_date": "${commit_date}",
    "git_message": "${commit_message}"
  },
  
  "project": {
    "name": "Simple E-Commerce Platform",
    "description": "Minimalist zero-transaction-fee e-commerce solution",
    "license": "Apache-2.0",
    "version": "1.0.0-mvp",
    "stage": "mvp-construction"
  },
  
  "technology_stack": {
    "backend": {
      "language": "DLang",
      "version": "2.1xx",
      "framework": "vibe-d",
      "database": "SQLite",
      "file_count": ${backend_files},
      "dependencies": ["vibe-d", "sqlite-d"],
      "build_tool": "dub"
    },
    "frontend": {
      "language": "TypeScript",
      "version": "5.2",
      "framework": "Angular",
      "framework_version": "17",
      "ui_library": "Angular Material",
      "file_count": ${frontend_files},
      "build_tool": "npm/Angular CLI",
      "dependencies": ["@angular/core@^17", "@angular/material@^17", "rxjs"]
    }
  },
  
  "project_state": {
    "backend": {
      "status": "${backend_state}",
      "authentication": "implemented",
      "products": "implemented",
      "blog": "implemented",
      "orders": "implemented",
      "security_middleware": "implemented"
    },
    "frontend": {
      "status": "${frontend_state}",
      "components": "pending_implementation",
      "services": "implemented",
      "guards": "implemented",
      "routing": "structure_ready"
    },
    "documentation": {
      "status": "comprehensive",
      "markdown_files": ${doc_files},
      "uml_diagrams": ${uml_files},
      "generated_images": ${diagram_count}
    },
    "tests": {
      "files": ${test_files},
      "backend_tests": "pending",
      "frontend_tests": "pending",
      "coverage_target": "80%"
    }
  },
  
  "architecture": {
    "pattern": "Layered Architecture",
    "frontend_pattern": "Component-Based with Services",
    "backend_pattern": "Controller-Service-Repository",
    "authentication": "JWT with Refresh Tokens",
    "authorization": "Role-Based Access Control",
    "api_style": "RESTful HTTP/JSON"
  },
  
  "file_structure": {
    "backend": [
      "source/server.d",
      "source/controllers/*.d",
      "source/models/*.d",
      "source/middleware/*.d",
      "source/crypto/*.d",
      "source/database/*.d",
      "source/templates/*.d",
      "tests/"
    ],
    "frontend": [
      "src/app/core/services/",
      "src/app/core/guards/",
      "src/app/core/interceptors/",
      "src/app/features/",
      "src/app/shared/components/",
      "src/app/shared/directives/"
    ],
    "docs": [
      "README.md",
      "TODO.md",
      "STACK.md",
      "docs/guides/",
      "docs/reference/",
      "docs/performance/",
      "docs/assets/diagrams/",
      "docs/assets/uml/"
    ]
  },
  
  "api_endpoints": {
    "authentication": [
      "POST /api/auth/register",
      "POST /api/auth/login",
      "POST /api/auth/refresh",
      "GET /api/auth/profile",
      "PUT /api/auth/profile",
      "POST /api/auth/change-password"
    ],
    "products": [
      "GET /api/products",
      "GET /api/products/:id",
      "GET /api/products/featured",
      "GET /api/products/search",
      "POST /api/products",
      "PUT /api/products/:id",
      "DELETE /api/products/:id"
    ],
    "orders": [
      "POST /api/orders",
      "GET /api/orders",
      "GET /api/orders/:id",
      "PUT /api/orders/:id/status"
    ],
    "blog": [
      "GET /api/blog/posts",
      "POST /api/blog/posts",
      "GET /api/blog/posts/:id",
      "DELETE /api/blog/posts/:id"
    ]
  },
  
  "database_schema": {
    "tables": [
      "users",
      "products",
      "orders",
      "order_items",
      "blog_posts",
      "comments",
      "media_files"
    ],
    "relationships": {
      "users_orders": "one-to-many",
      "users_blog_posts": "one-to-many",
      "products_order_items": "one-to-many",
      "orders_order_items": "one-to-many",
      "blog_posts_comments": "one-to-many"
    }
  },
  
  "current_priorities": [
    "Implement Angular component implementations",
    "Complete checkout flow with Stripe integration",
    "Add email notification service",
    "Write unit tests for core functionality",
    "Complete MVP documentation"
  ],
  
  "known_issues": [
    "Frontend component implementations pending",
    "Payment integration not yet integrated",
    "Email service templates pending",
    "Test coverage below target"
  ],
  
  "roadmap": {
    "mvp": {
      "status": "in_progress",
      "completion_target": "4-6 weeks",
      "remaining_tasks": [
        "Angular login/register components",
        "Shop/product listing components",
        "Cart checkout flow",
        "Stripe payment integration",
        "SMTP email service",
        "Backend unit tests (80% coverage)"
      ]
    },
    "full_project": {
      "status": "planned",
      "estimated_duration": "3-6 months",
      "features": [
        "Admin dashboard",
        "Advanced search (Elasticsearch)",
        "Analytics and reporting",
        "Mobile app (React Native)",
        "PostgreSQL migration",
        "Redis caching"
      ]
    }
  },
  
  "guidance_for_ai": {
    "coding_standards": {
      "backend": [
        "Use structs for data models",
        "Use classes for controllers/services",
        "Prefer immutable data where possible",
        "Use templates for reusable patterns",
        "Always validate input in controllers"
      ],
      "frontend": [
        "Use standalone components (Angular 17)",
        "Prefer OnPush change detection",
        "Use RxJS observables for async",
        "Unsubscribe using takeUntil pattern",
        "Use TypeScript strict mode"
      ]
    },
    "file_conventions": {
      "backend": {
        "controllers": "lowercase_controller.d",
        "models": "lowercase.d",
        "middleware": "lowercase_middleware.d"
      },
      "frontend": {
        "components": "kebab-case.component.ts",
        "services": "kebab-case.service.ts",
        "guards": "kebab-case.guard.ts"
      }
    },
    "important_files": [
      "backend/dub.json",
      "backend/source/server.d",
      "frontend/package.json",
      "frontend/angular.json",
      "docs/README.md",
      "docs/TODO.md",
      "docs/STACK.md"
    ],
    "ci_cd_pipeline": {
      "backend_test": "dub test",
      "frontend_test": "npm test",
      "backend_build": "dub build --build=release",
      "frontend_build": "npm run build:prod"
    }
  },
  
  "quick_reference": {
    "run_backend": "cd backend && dub run",
    "test_backend": "cd backend && dub test",
    "build_backend": "cd backend && dub build --build=release",
    "run_frontend": "cd frontend && npm start",
    "test_frontend": "cd frontend && npm test",
    "build_frontend": "cd frontend && npm run build:prod",
    "generate_docs": "bash generate_diagrams.sh",
    "docker_dev": "docker-compose -f docker-compose.dev.yml up -d",
    "docker_prod": "docker-compose -f docker-compose.prod.yml up -d"
  }
}
EOF
    
    echo "✅ AI context generated: ${OUTPUT_FILE}"
    echo ""
    echo "Generated context summary:"
    echo "  Project: Simple E-Commerce Platform"
    echo "  Backend: DLang ${backend_state} (${backend_files} files)"
    echo "  Frontend: Angular ${frontend_state} (${frontend_files} files)"
    echo "  Tests: ${test_files} files"
    echo "  Diagrams: ${diagram_count} images"
    echo ""
}

# Update existing context if it exists
update_context() {
    if [ -f "${OUTPUT_FILE}" ]; then
        echo "📝 Updating existing AI context..."
        
        # Merge with existing data
        local prev_timestamp=$(cat "${OUTPUT_FILE}" 2>/dev/null | jq -r '.metadata.generated_at' 2>/dev/null || echo "")
        local prev_commit=$(cat "${OUTPUT_FILE}" 2>/dev/null | jq -r '.metadata.git_commit' 2>/dev/null || echo "")
        local current_commit=$(cd "${PROJECT_ROOT}" && git rev-parse HEAD 2>/dev/null || echo "")
        
        if [ "${prev_commit}" != "${current_commit}" ] && [ -n "${current_commit}" ]; then
            echo "  📦 Changes detected since last generation"
            echo "  🕐 Previous generation: ${prev_timestamp}"
            echo "  📝 Regenerating context..."
            generate_context
        else
            echo "  ✅ No changes detected, context up to date"
        fi
    else
        generate_context
    fi
}

# Main execution
main() {
    OUTPUT_FILE="${1:-${SCRIPT_DIR}/ai-context.json}"
    
    echo "======================================"
    echo "  AI Context Generator"
    echo "======================================"
    echo ""
    echo "Generating AI context for: ${PROJECT_ROOT}"
    
    # Check for required tools
    if ! command -v jq &> /dev/null; then
        echo "⚠️  jq not found, using basic JSON generation"
        # Fallback to basic generation without jq
        generate_context
    else
        # Full generation with jq
        update_context
    fi
}

# Handle arguments
case "${1:-}" in
    --force|-f)
        OUTPUT_FILE="${2:-${SCRIPT_DIR}/ai-context.json}"
        generate_context
        ;;
    --update|-u)
        OUTPUT_FILE="${2:-${SCRIPT_DIR}/ai-context.json}"
        update_context
        ;;
    --help|-h|--usage)
        echo "Usage: $0 [output_file]"
        echo ""
        echo "Options:"
        echo "  [output_file]  Output JSON file (default: ref/ai-context.json)"
        echo "  --force, -f      Force regeneration"
        echo "  --update, -u     Update only if changed"
        echo "  --help, -h       Show this help"
        ;;
    *)
        main "$@"
        ;;
esac