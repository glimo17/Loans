# Loans Workspace

This workspace contains a modular loans system:

- `loans-api`: Node.js + Express REST API with SQL Server and clean architecture.
- `loans-web`: ReactJS frontend created with Create React App.

## 1) Run backend (`loans-api`)

```bash
cd loans-api
copy .env.example .env
npm install
npm run dev
```

API base URL: `http://localhost:5000/api`

Swagger docs:

- UI: `http://localhost:5000/api-docs`
- JSON: `http://localhost:5000/api-docs.json`

## 2) Run frontend (`loans-web`)

```bash
cd loans-web
npm install
npm start
```

Frontend URL: `http://localhost:3000`

## Docker deploy (API + Web + SQL Server)

From workspace root:

```bash
docker compose up -d --build
```

Services:

- Web: `http://localhost:3000`
- API: `http://localhost:5000/api`
- Swagger: `http://localhost:5000/api-docs`
- SQL Server: `localhost:1433` (user `sa`)

Stop all containers:

```bash
docker compose down
```

Stop and remove SQL data volume:

```bash
docker compose down -v
```

## API resources (all CRUD endpoints)

Every resource exposes:

- `GET /api/{resource}`
- `GET /api/{resource}/:id`
- `POST /api/{resource}`
- `PUT /api/{resource}/:id`
- `DELETE /api/{resource}/:id`

Resources mapped from your SQL script tables:

- `roles` (table `Roles`)
- `users` (table `Users`)
- `statuses` (table `Statuses`)
- `loan-products` (table `LoanProducts`)
- `loans` (table `Loans`)
- `payments` (table `Payments`)
- `loan-history` (table `LoanHistory`)

## Database initialization

On startup, `loans-api` initializes `LoanSystemDB` and creates all tables from your script if they do not exist, then inserts seed records for roles, statuses, and loan products.

## Backend modules

- `src/shared/tableConfigs.js`: per-table model/field definitions
- `src/infrastructure/db/sqlServer.js`: SQL Server connection + schema bootstrap
- `src/infrastructure/repositories/SqlCrudRepository.js`: generic SQL repository
- `src/presentation/controllers/createCrudController.js`: generic REST controllers
- `src/presentation/routes/createCrudRoutes.js`: generic REST routes
