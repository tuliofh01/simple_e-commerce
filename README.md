# 🛒 Simple E-Commerce Platform

> A high-performance, self-hosted e-commerce engine designed for independence and speed.

## 🎯 The Mission

In an era of bloated CMS platforms and expensive SaaS subscriptions, **Simple E-Commerce** stands as a declaration of digital sovereignty. We are building a system that respects the user's resources, data, and freedom.

### Why this stack?
*   **DLang (vibe.d)**: The performance of C++ with the productivity of Python. Non-blocking I/O allows thousands of concurrent connections with minimal memory.
*   **Angular 17**: Enterprise-grade structure with Standalone Components. Reactive state management ensures predictable UI updates.
*   **SQLite**: ACID-compliant, zero-configuration database. Perfect for small-to-medium businesses (SMBs) without the overhead of a heavy DB server.

## 🚀 Key Differentiators

| Feature | **Simple E-Commerce** | WordPress + WooCommerce |
| :--- | :--- | :--- |
| **Language** | **DLang** (Compiled) | PHP (Interpreted) |
| **Performance** | Sub-200ms API responses | Often 1s+ without caching |
| **Security** | Hardware-Locked Licensing | Plugin-vulnerable |
| **Data** | **You own it.** SQLite file. | Scattered MySQL tables |
| **Deployment** | Single binary + SPA | Heavy LAMP stack |

## 🇧🇷 Um Convite à Comunidade Lusófona

Este projeto nasceu da vontade de democratizar tecnologia de ponta. Queremos que o pequeno empreendedor brasileiro, angolano, português ou moçambicano tenha o mesmo poder de fogo de uma gigante do varejo, **sem pagar taxas abusivas**.

**Precisamos de você:** A documentação técnica está em inglês para alcançar o mundo, mas o coração deste projeto bate em português. Ajude-nos a traduzir, adaptar e melhorar este sistema para a nossa realidade.

> *"A tecnologia é uma ferramenta. O que você constrói com ela é a sua obra."*

## 📂 Project Structure

We use a modern **Monorepo** structure to separate concerns while keeping the ecosystem unified.

```
simple_ecommerce/
├── apps/
│   ├── api/         # DLang Backend (vibe.d)
│   └── web/         # Angular 17 Frontend
├── tools/           # Automation & Checkpoint tools
├── deploy/          # Docker & CI/CD configurations
├── docs/            # Architecture & Guides
└── data/            # Local SQLite Database
```

## 🛠️ Getting Started

### Prerequisites
*   **DLang SDK**: [https://dlang.org/download](https://dlang.org/download)
*   **Node.js 20+**: [https://nodejs.org](https://nodejs.org)
*   **Docker**: [https://docker.com](https://docker.com)

### Quick Install

1.  **Clone the repository**
    ```bash
    git clone https://github.com/tuliofh01/simple_e-commerce.git
    cd simple_ecommerce
    ```

2.  **Sync Dependencies**
    ```bash
    # Automated setup
    chmod +x tools/sync.sh
    ./tools/sync.sh
    ```

3.  **Generate License**
    Hardware-locking is essential for security.
    ```bash
    cd apps/api
    # Run the checkpoint tool to generate your unique key
    dub run tools:checkpoint -- --generate
    # Follow the instructions to update apps/api/.env
    ```

4.  **Run**
    ```bash
    # Terminal 1: Backend
    cd apps/api && dub run

    # Terminal 2: Frontend
    cd apps/web && npm start
    ```

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| GET | `/api/products` | List all products | Public |
| GET | `/api/products/:id` | Get product by ID | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/orders` | Create new order | User |
| GET | `/api/admin/stats` | Dashboard stats | Admin |

*Full API Reference:* [docs/developer-guide/api-reference.md](docs/developer-guide/api-reference.md)

## 🛡️ Security & Licensing

This project uses a **Hardware-Deterministic License System**.
*   Each server instance requires a unique license key.
*   Keys are generated based on the machine's unique ID.
*   Unauthorized instances will be rejected at startup.

## 📚 Documentation

*   **Architecture:** [docs/architecture/README.md](docs/architecture/README.md)
*   **Guides:** [docs/guides/README.md](docs/guides/README.md)
*   **API Reference:** [docs/developer-guide/api-reference.md](docs/developer-guide/api-reference.md)
*   **System Overview:** [docs/system-overview.md](docs/system-overview.md)

## 🛠️ Troubleshooting

### "Dub not found"
Ensure DLang is installed and `dub` is in your PATH.

### "Machine ID not found"
The license generator relies on `/etc/machine-id`. On Windows, it uses the hostname fallback.

### "SQLite database not found"
Run the backend once to initialize the database in `data/database.db`.

## 📄 License

This project is licensed under the **Apache License 2.0**.

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](docs/CONTRIBUTING.md) before submitting PRs.

---

**Built with ❤️ and efficient code.**
