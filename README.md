# Axon

Headless CMS with an API-first Express backend and a Next.js admin UI. Manage structured content, media, menus, pages, forms, and more, then deliver it to websites, apps, or any client over REST.

## Architecture

| Package | Role | Stack |
|---------|------|--------|
| [`axon_engine`](./axon_engine) | REST API & media | Express.js, PostgreSQL (`pg`), JWT auth |
| [`axon_cms`](./axon_cms) | Admin dashboard | Next.js, Ant Design, Redux |

```
Clients / websites
        │
        ▼
   axon_cms (:7007)  ──►  axon_engine (:6006)  ──►  PostgreSQL
```

## Features

- Multi-organization content with roles and permissions
- Pages, menus, navbars, and page builder
- Media library with local uploads (Cloudinary optional)
- Custom models and form builder / responses
- E-commerce primitives (products, product types)
- JWT authentication and public API routes

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm (or pnpm for the CMS if you prefer)

## Quick start

### 1. Engine (API)

```bash
cd axon_engine
cp .env.example .env
# Edit DB_* and JWT_SECRET in .env
npm install
npm run setup          # migrate + seed
npm run dev            # http://localhost:6006
```

### 2. CMS (Admin UI)

```bash
cd axon_cms
cp .env.example .env
# Point NEXT_PUBLIC_API_BASE_URL at the engine (default: http://127.0.0.1:6006/api)
npm install
npm run dev            # http://localhost:7007
```

### Environment

Copy the example files and fill in secrets locally — never commit `.env`:

- [`axon_engine/.env.example`](./axon_engine/.env.example) — `PORT`, database, JWT, uploads
- [`axon_cms/.env.example`](./axon_cms/.env.example) — API base URL, app URL, optional third-party keys

## Scripts

**Engine**

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with `--watch` |
| `npm start` | Production start |
| `npm run migrate` | Run DB migrations |
| `npm run seed` | Seed database |
| `npm run setup` | Migrate + seed |

**CMS**

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server on port 7007 |
| `npm run build` | Production build |
| `npm start` | Production server (`server.js`) |

## Project layout

```
.
├── axon_engine/          # Express API
│   ├── src/
│   │   ├── routes/       # auth, api, public
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── migrations/
│   │   └── seeds/
│   └── uploads/media/
└── axon_cms/             # Next.js admin
    ├── pages/            # App routes
    ├── components/
    ├── store/
    └── lib/
```

## License

See [`axon_cms/LICENSE.md`](./axon_cms/LICENSE.md).
