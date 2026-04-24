# Family Healthy Lifestyle Portal

## Current Phase

Core MVP implementation is connected for:

- authentication by login and password
- admin/user role model
- manual user creation by admin
- profile editing
- weight history
- measurements history
- calorie and macros calculation
- shared food database
- meal logging
- meal draft preview with daily recalculation
- water tracking
- workout norms
- workout logging
- template-based goals
- goal progress calculation
- personal dashboard
- family dashboard

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Auth.js credentials auth

## Environment

Create `.env` from `.env.example`.

Required variables:

- `DATABASE_URL`
- `AUTH_SECRET`
- `APP_URL`
- `BOOTSTRAP_FAMILY_NAME`
- `BOOTSTRAP_ADMIN_LOGIN`
- `BOOTSTRAP_ADMIN_PASSWORD`
- `BOOTSTRAP_ADMIN_DISPLAY_NAME`

## Core Setup

1. Install dependencies.
2. Generate Prisma client: `npm run prisma:generate`
3. Apply migrations: `npm run prisma:deploy`
4. Seed reference and bootstrap data: `npm run prisma:seed`
5. Start the app: `npm run dev`

## Seed Result

Seed creates:

- one bootstrap family
- roles `ADMIN` and `MEMBER`
- profile goal types
- one bootstrap admin account from environment variables
- initial shared food records for the food database
- initial workout norms for workout logging by reference
- goal templates for MVP goals

## Deployment Direction

This repository already includes Ubuntu-ready deployment preparation.

Prepared files:

- `Dockerfile`
- `compose.yaml`
- `docker/entrypoint.sh`
- `docker/nginx.family-healthy-portal.conf.example`
- `README_DEPLOY_UBUNTU.md`

Deployment approach:

- PostgreSQL runs in a separate container
- environment variables are loaded from `.env`
- migrations and seed can be executed headlessly
- scripts and commands are Linux-compatible
- reverse proxy setup is Nginx-compatible

For the full Ubuntu deployment flow, see `README_DEPLOY_UBUNTU.md`.
