# Cowrite Backend (Redesigned)

Production-oriented backend redesign for Cowrite with:
- NestJS (Fastify) API
- Hocuspocus + Yjs collaboration server
- Prisma + PostgreSQL persistence
- Redis-backed presence + queues
- BullMQ workers

## Project Structure

- `backend/apps/api`: HTTP API service
- `backend/apps/collab`: realtime collaboration service
- `backend/apps/worker`: background worker service
- `backend/modules/*`: domain modules
- `backend/packages/*`: shared platform packages
- `prisma/schema.prisma`: full data model
- `infrastructure/*`: docker, k8s, nginx, monitoring scaffolding

## Quick Start

1. Copy env:
   - `cp .env.example .env`
2. Start infrastructure:
   - `docker compose up -d postgres redis`
3. Install dependencies:
   - `npm ci`
4. Generate Prisma client:
   - `npm run prisma:generate`
5. Run migrations:
   - `npm run prisma:migrate:dev`
6. Run services:
   - `npm run dev:api`
   - `npm run dev:collab`
   - `npm run dev:worker`

## Key Endpoints

- API health: `GET /api/health/liveness`
- API readiness: `GET /api/health/readiness`
- Metrics: `GET /api/metrics`
- Auth login: `POST /api/v1/auth/login`
- Collaboration WS: `ws://localhost:3001`

## Notes

- Legacy Express/Socket.IO/Mongoose implementation has been removed.
- Presence is ephemeral in Redis; durable metadata is in PostgreSQL.
- Snapshotting and versioning pipelines are initialized via BullMQ workers.
