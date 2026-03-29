# Loans System

A full-stack loan management system built with **Node.js + Express** (REST API), **React** (mobile-first web UI), and **SQL Server** — all containerized with Docker Compose.

---

## Overview

| Layer | Technology |
|-------|-----------|
| Backend API | Node.js 20, Express 5, mssql (tedious) |
| Frontend | React 18 (Create React App), mobile phone-frame UI |
| Database | SQL Server 2022 (Docker) / SQL Server Express (local) |
| Container | Docker Compose (3 services) |
| Reverse proxy | Nginx 1.27 (serves React + proxies `/api/` to API) |

---

## Features

### Web Application (`loans-web`)
- **Mobile phone-frame UI** — responsive design styled as a mobile device
- **Login screen** — username + password authentication against the Users table
- **Role-based access control**:
  - `Admin` role → full access to all 7 modules
  - Non-admin roles → restricted to Prestamos and Pagos only
- **Session persistence** — login session stored in `sessionStorage`
- **Popup dialogs** — all create and edit forms open as modal dialogs
- **Spanish UI** — all labels, tabs, and messages are in Spanish
- **7 modules** with full CRUD (list, create, edit):
  - Estados (Statuses)
  - Roles
  - Usuarios (Users)
  - Productos (Loan Products)
  - Prestamos (Loans)
  - Pagos (Payments)
  - Historial (Loan History)

### REST API (`loans-api`)
- Generic CRUD endpoints for every resource
- SQL Server schema auto-initialization on startup (creates tables + seeds default data)
- Swagger/OpenAPI documentation
- Health check endpoint

---

## Default Users

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin (full access) |
| `glimo17` | `123456` | Admin (full access) |
| `juan01` | `123456` | Customer (Prestamos + Pagos only) |

---

## Quick Start — Docker (recommended)

Requires Docker Desktop running.

```bash
# From workspace root
docker compose up -d --build
```

| Service | URL |
|---------|-----|
| Web UI | http://localhost:3000 |
| REST API | http://localhost:5000/api |
| Swagger UI | http://localhost:5000/api-docs |
| SQL Server | localhost:1433 (user `sa`, password `YourStrong!Passw0rd`) |

Stop containers:

```bash
docker compose down
```

Stop and wipe database volume:

```bash
docker compose down -v
```

---

## Local Development

### Backend (`loans-api`)

```bash
cd loans-api
copy .env.example .env   # Windows
# edit .env with your local SQL Server connection
npm install
npm run dev
```

Requires **SQL Server Express** locally and **ODBC Driver 17 for SQL Server**.

API base URL: `http://localhost:5000/api`  
Swagger UI: `http://localhost:5000/api-docs`

### Frontend (`loans-web`)

```bash
cd loans-web
npm install
npm start
```

Frontend URL: `http://localhost:3000`

> The frontend reads `REACT_APP_API_URL` from `.env`. For local dev it points to `http://localhost:5000/api`. In Docker the Nginx proxy handles `/api/` automatically.

---

## API Endpoints

Every resource exposes standard CRUD:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/{resource}` | List all records |
| `GET` | `/api/{resource}/:id` | Get one record |
| `POST` | `/api/{resource}` | Create a record |
| `PUT` | `/api/{resource}/:id` | Update a record |
| `DELETE` | `/api/{resource}/:id` | Delete a record |
| `GET` | `/api/health` | Health check |

### Resources

| Resource | Table | ID field |
|----------|-------|----------|
| `roles` | `Roles` | `roleId` |
| `users` | `Users` | `userId` |
| `statuses` | `Statuses` | `statusId` |
| `loan-products` | `LoanProducts` | `productId` |
| `loans` | `Loans` | `loanId` |
| `payments` | `Payments` | `paymentId` |
| `loan-history` | `LoanHistory` | `historyId` |

---

## Database Schema

**LoanSystemDB** — tables auto-created on API startup:

- `Roles` — user roles (Admin, Customer, etc.)
- `Users` — system users with `Username`, `Email`, `PasswordHash`, `RoleId`, `IsActive`
- `Statuses` — loan lifecycle statuses (Pending, Active, Closed, etc.)
- `LoanProducts` — configurable loan products with interest rates, amounts, and terms
- `Loans` — loan records linked to users, products, and statuses
- `Payments` — payment records linked to loans (principal + interest breakdown)
- `LoanHistory` — audit trail of loan status changes

---

## Project Structure

```
Loans-1/
├── docker-compose.yml          # Orchestrates 3 services
├── loans-api/
│   ├── Dockerfile
│   ├── .env / .env.example
│   └── src/
│       ├── app.js                          # Express app setup
│       ├── server.js                       # Entry point
│       ├── shared/
│       │   ├── tableConfigs.js             # Per-resource field definitions
│       │   └── config.js                   # Environment config
│       ├── infrastructure/
│       │   ├── db/sqlServer.js             # DB connection + schema bootstrap
│       │   └── repositories/
│       │       └── SqlCrudRepository.js    # Generic SQL repository
│       ├── presentation/
│       │   ├── controllers/
│       │   │   └── createCrudController.js # Generic REST controllers
│       │   └── routes/
│       │       └── createCrudRoutes.js     # Generic REST route builder
│       └── docs/swagger.js                 # OpenAPI spec
└── loans-web/
    ├── Dockerfile                          # Multi-stage: CRA build → Nginx
    ├── nginx.conf                          # Proxy /api/ to loans-api, SPA fallback
    ├── .env
    └── src/
        ├── App.js                          # Main app: auth, routing, CRUD UI
        ├── App.css                         # Mobile phone-frame + dialog styles
        └── api.js                          # HTTP client (getResourceItems, create, update)
```
