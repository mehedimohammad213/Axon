# Headless Engine Express

A complete headless CMS API built with **Express**, **pg** (Node.js PostgreSQL client), and **PostgreSQL**. This is a Node.js port of the Laravel-based [headless-engine](../headless-engine) project.

## Features

- Multi-tenant organization scoping
- JWT authentication
- Role-based permissions (77 permissions, 4 role templates)
- Full CMS content APIs (pages, navbars, menus, sliders, cards, footers, media, forms)
- Public site API with `X-Headless-Site-Key`
- Dynamic model generation (Doc to API / DIY CMS)
- Dynamic CRUD at `/api/dynamic?model=<table>`

## Tech Stack

- **Express** - HTTP server
- **pg** - PostgreSQL driver with raw SQL queries
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Multer** - File uploads

## Quick Start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 2. Setup

```bash
cd headless-engine-express
cp .env.example .env
# Edit .env with your PostgreSQL credentials

npm install
createdb headless_engine   # or create DB via pgAdmin
npm run setup              # migrate + seed
npm run dev
```

Server runs at `http://localhost:3000`

### 3. Default Credentials

After seeding:

- **Super Admin:** `superadmin@headless.local` / `password`
- **Site org admins:** see table below / `password`

| Organization | Slug | Admin Email |
|---|---|---|
| Sajida Hospital | `sajida-hospital` | `admin@sajida.local` |
| Sandhani Life | `sandhani-life` | `admin@sandhani.local` |
| CARB | `carb` | `admin@carb.local` |
| Al Muslim Group | `al-muslim` | `admin@almuslim.local` |
| United Aygaz | `united-aygaz` | `admin@aygaz.local` |
| Dream Agent Car Vision | `dream-agent-car-vision` | `admin@dreamagentcarvision.local` |

## API Overview

### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/admin/register` | None | Register + create organization |
| POST | `/api/admin/login` | None | Login, returns JWT |
| POST | `/api/admin/logout` | JWT | Logout |
| GET | `/api/admin/user` | JWT | Current user |
| PUT | `/api/admin/password/change` | JWT | Change password |

### CMS APIs (JWT required)

All under `/api/` prefix:

- **Users:** `/api/admin/users`, `/api/admin/user`
- **Roles:** `/api/roles`
- **Permissions:** `/api/permissions`
- **Organizations:** `/api/organizations` (super admin only)
- **Pages:** `/api/pages`
- **Navbars:** `/api/navbars`
- **Menus:** `/api/menus`
- **Menu Items:** `/api/menuitems`
- **Footers:** `/api/footers`
- **Sliders:** `/api/sliders`
- **Cards:** `/api/cards`
- **Forms:** `/api/forms` (read-only)
- **Media:** `/api/media`, `/api/media/upload`
- **Form Builder:** `/api/form_builder`
- **Form Data:** `/api/formdata`
- **Form Submissions:** `/api/form-submission`
- **DIY CMS:** `/api/diy-cms`, `/api/generated-models`, `/api/dynamic`

### Public Site API

Requires header: `X-Headless-Site-Key: <site_key>`

- `GET /api/public/pages`
- `GET /api/public/navbars`, `/menus`, `/sliders`, `/cards`, etc.
- `POST /api/form-submission`

### Dynamic CRUD

JWT + `access_doc_to_api` permission required:

- `GET /api/dynamic?model=<table>&page=1&limit=20`
- `GET /api/dynamic/:id?model=<table>`
- `POST /api/dynamic?model=<table>`
- `PUT /api/dynamic/:id?model=<table>`
- `DELETE /api/dynamic/:id?model=<table>`

Only tables registered in `generated_models` for the current organization are allowed. System tables are blocked.

Legacy `/dynamic` URLs redirect to `/api/dynamic`.

### Pagination

List endpoints return a paginated envelope:

```json
{
  "data": [],
  "meta": { "total": 0, "page": 1, "limit": 20, "totalPages": 0 }
}
```

Query params: `page` (default 1), `limit` (default 20, max 100).

## Headers

| Header | Used For |
|--------|----------|
| `Authorization: Bearer <token>` | JWT auth for CMS APIs |
| `X-Organization-Id: <id>` | Super admin org context |
| `X-Headless-Site-Key: <key>` | Public site API auth |

## Database

Migrations create 30 tables matching the Laravel headless-engine schema (adapted for PostgreSQL):

- `organizations`, `users`, `roles`, `permissions`, `role_permission`
- `pages`, `media`, `navbars`, `menus`, `menu_items`, `footers`, `sliders`, `cards`
- `forms`, `form_builder`, `form_data`, `form_submissions`
- `generated_models`, polymorphic pivots (`cardables`, `formables`, `medex`)

```bash
npm run migrate        # Run migrations
npm run migrate:rollback  # Rollback last batch
npm run seed           # Seed all (permissions, super admin, site organizations)
npm run seed -- --specific 03_sajida.js   # Seed one site org only
```

Site organization seeders (`03`–`08`) load content from `src/seeds/data/{org}/` JSON fixtures when present, otherwise fetch from live APIs.

```bash
npm run seed:fetch-fixtures              # download all site org JSON fixtures
npm run seed:fetch-fixtures -- carb sajida # download specific orgs only
```

### Site organization seeders

Each site has one seeder file (Laravel-style). JSON fixtures live under `src/seeds/data/{org}/`.

| Seeder | Data directory |
|--------|----------------|
| `03_sajida.js` | `src/seeds/data/sajida/` |
| `04_sandhani.js` | `src/seeds/data/sandhani/` |
| `05_carb.js` | `src/seeds/data/carb/` |
| `06_al_muslim.js` | `src/seeds/data/al-muslim/` |
| `07_aygaz.js` | `src/seeds/data/aygaz/` |
| `08_car_vision.js` | `src/seeds/data/car-vision/` |

Shared fixture-loading logic is in `src/utils/organizationSeeder.js`.

## Project Structure (MVC)

```
src/
├── app.js           # Express app setup (middleware, routes)
├── index.js         # Server entry point
├── config/          # Permissions config
├── context/         # Request-scoped tenant context (AsyncLocalStorage)
├── controllers/     # HTTP layer — request/response handling
├── services/        # Business logic, validation, orchestration
├── models/          # Data access layer (raw SQL via pg)
├── db/              # pg pool, SQL helpers, migrations, query scoping
├── middleware/      # Auth, org context, permissions
├── migrations/      # Database migrations
├── routes/          # Express routers (URL → controller mapping)
├── seeds/           # Database seeders
└── utils/           # Shared helpers & response formatters
```

### MVC Layers

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Routes** | Map URLs to controller actions | `src/routes/` |
| **Controllers** | Handle HTTP requests and responses | `src/controllers/` |
| **Services** | Business logic, validation, orchestration | `src/services/` |
| **Models** | Database queries and data operations | `src/models/` |
| **Middleware** | Auth, permissions, org scoping | `src/middleware/` |

## License

MIT
