# Sevanto

Hyperlocal workforce marketplace monorepo.

```
sevanto/
├── packages/shared/   # Shared types, validators, API client, auth store
├── client/            # Customer web app (Next.js)
├── worker/            # Worker web app (Next.js)
├── admin/             # Admin dashboard (Next.js)
└── server/            # Backend API (Node.js + Express + Prisma)
```

## Phase Status

- ✅ Phase 0 — Documentation & Planning
- 🔄 Phase 1 — Authentication (in progress; backend complete, all 3 frontends scaffolding)

## Quick Start

```bash
# Install all workspaces (requires Node 20+)
npm install

# Start backend
cd server && npm run prisma:generate && npm run prisma:migrate:dev && npm run dev

# In a separate terminal, start a frontend
cd client && npm run dev    # http://localhost:3001
cd worker && npm run dev    # http://localhost:3002
cd admin  && npm run dev    # http://localhost:3003
```

## Documentation

All planning and architecture docs live in [`docs/`](docs/). See
[`docs/23-progress-tracker.md`](docs/23-progress-tracker.md) for the current phase status.

```

```
