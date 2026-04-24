# MVP Technical Specification

## Previous Phase Summary

The UX phase is already represented in the repository by the mock application under `src/app/*` and the mandatory UX artifacts surfaced in `src/app/ux-foundation/page.tsx`.

Confirmed UX scope:

- login
- admin users list
- create user
- profile
- weight and measurements
- nutrition diary
- food database
- meal draft preview
- water tracker
- workouts
- goals
- personal dashboard
- family dashboard

This technical specification builds on that approved structure and does not introduce full business logic implementation yet.

## Proposed Architecture

The MVP should remain a single Next.js application deployed as one web container, backed by PostgreSQL in a separate container.

Architecture layers:

- `src/app`: App Router pages, layouts, route groups, server actions entry points
- `src/components`: reusable UI and page composition blocks
- `src/modules`: isolated domain modules with schemas, services, repositories, permissions, and view-model helpers
- `src/lib`: shared utilities, auth helpers, formatting, date logic, validation glue
- `prisma`: schema, migrations, and seed scripts

Runtime approach:

- Next.js App Router with server components by default
- Auth.js credentials authentication with JWT session strategy
- Prisma as the only ORM/data access layer
- PostgreSQL as the primary datastore
- Recharts only in dashboard/reporting screens
- Tailwind CSS and shadcn/ui for UI primitives

MVP architectural constraints:

- no separate backend service
- no microservices
- no Windows-only tooling
- no persistent meal-draft workflow beyond preview unless later required
- no advanced recipe/ingredient engine; shared food records use one normalized food catalog with item type flags

## Proposed Modules

- `auth`: login, session resolution, role checks, route protection
- `users-admin`: admin list, create user, activate/deactivate user, credential reset by admin only
- `profiles`: personal data, activity level, profile goal, water target
- `measurements`: weight history and body measurements history
- `nutrition-norms`: calorie/macros calculation and current norm snapshot
- `foods`: shared food database for products and simple dishes
- `nutrition-log`: meal entries, meal items, daily totals
- `meal-preview`: recalculation service used before saving a meal entry
- `water`: water intake entries and daily progress
- `workouts`: workout entries and workout norm reference usage
- `goals`: template-based goals and progress calculation
- `dashboard-personal`: daily/weekly/monthly user aggregates
- `dashboard-family`: family-wide aggregate overview, primarily for admin
- `reporting`: date-range aggregation helpers shared by dashboards

## Entity List And Relationships

Core entities:

- `Family`
- `User`
- `Profile`
- `NutritionNormSnapshot`
- `WeightEntry`
- `MeasurementEntry`
- `FoodItem`
- `MealEntry`
- `MealItem`
- `WaterEntry`
- `WorkoutNorm`
- `WorkoutEntry`
- `GoalTemplate`
- `Goal`
- `GoalProgressSnapshot`

Main relationships:

- one `Family` has many `User`
- one `User` belongs to one `Family`
- one `User` has one `Profile`
- one `User` has many `NutritionNormSnapshot`
- one `User` has many `WeightEntry`
- one `User` has many `MeasurementEntry`
- one `User` has many `MealEntry`
- one `MealEntry` has many `MealItem`
- one `MealItem` references one shared `FoodItem`
- one `User` has many `WaterEntry`
- one `User` has many `WorkoutEntry`
- one `WorkoutEntry` may reference one `WorkoutNorm`
- one `User` has many `Goal`
- one `Goal` may reference one `GoalTemplate`
- one `Goal` has many `GoalProgressSnapshot`
- one `User` may create many shared `FoodItem`

MVP simplification decisions:

- `FoodItem` stores both products and simple dishes through `FoodItemType`
- meal preview is computed from selected food items and quantities before save; no dedicated persistent draft table in the first implementation
- dashboard values are derived from facts, not stored as separate report tables
- one family space is supported cleanly through `Family`, even if the first deployment only uses a single family record

## Route And Module Breakdown

Primary pages:

- `/login`
- `/dashboard`
- `/profile`
- `/measurements`
- `/nutrition`
- `/nutrition/draft`
- `/foods`
- `/water`
- `/workouts`
- `/goals`
- `/family`
- `/admin/users`
- `/admin/users/new`

Recommended route groups:

- `src/app/(public)/login`
- `src/app/(app)/dashboard`
- `src/app/(app)/profile`
- `src/app/(app)/measurements`
- `src/app/(app)/nutrition`
- `src/app/(app)/foods`
- `src/app/(app)/water`
- `src/app/(app)/workouts`
- `src/app/(app)/goals`
- `src/app/(app)/family`
- `src/app/(app)/admin/users`

Recommended domain module structure:

- `src/modules/auth/*`
- `src/modules/users/*`
- `src/modules/profiles/*`
- `src/modules/nutrition/*`
- `src/modules/foods/*`
- `src/modules/water/*`
- `src/modules/workouts/*`
- `src/modules/goals/*`
- `src/modules/dashboard/*`
- `src/modules/shared/*`

Recommended internal split inside each module:

- `schema.ts`: Zod validation
- `service.ts`: business logic
- `repository.ts`: Prisma access
- `permissions.ts`: role and ownership checks
- `queries.ts`: read models for screens
- `types.ts`: local module types when needed

## Access Control Model

Roles:

- `ADMIN`
- `MEMBER`

Rules:

- only authenticated users can access app routes
- only `ADMIN` can create users, activate/deactivate users, and manage workout norms
- only `ADMIN` can access `/admin/*`
- `ADMIN` can read all users, all personal records, and family dashboard data
- `MEMBER` can read and edit only their own profile and factual records
- shared food items are visible to all authenticated users
- creation of shared food items can be allowed for authenticated users, but edits/deactivation should be restricted to admins in the first iteration to avoid catalog conflicts
- family dashboard for MVP should be admin-visible by default; if member access is enabled later, it must stay aggregate-only

Enforcement points:

- middleware or layout-level session gate for private routes
- server-side permission checks in actions/services, not only in the UI
- repository queries must always scope member reads by `session.user.id`

## Database Schema Proposal

Relational design choices:

- keep reference data normalized with enums and small reference tables
- store factual nutrition values on `MealItem` as snapshots so food catalog changes do not mutate past meal history
- keep current nutrition norms as snapshots rather than only deriving from the latest profile every time
- use timestamped history tables for weight, measurements, meals, water, workouts, and goal progress

Important indexes:

- unique user login
- unique one-to-one `Profile.userId`
- per-user date indexes for weight, meals, water, workouts, and goals
- family and role indexes for admin dashboards
- food name and active-state indexes for catalog search

Data integrity rules:

- inactive users cannot log in
- food macros and calories cannot be negative
- meal items require a positive quantity
- water entries require a positive amount
- workout calories are stored as factual values after calculation
- only one current nutrition norm snapshot should be flagged per user at a time

## Prisma Draft

The initial Prisma draft is stored in `prisma/schema.prisma`.

It is intentionally MVP-scoped:

- includes only the tables needed for core modules
- omits Auth.js adapter tables because credentials auth can use JWT sessions in MVP
- omits persistent recipe ingredients and complex draft tables
- leaves room for migrations when implementation begins

## Seed And Reference Data Plan

Seed categories:

- one default `Family` for the first environment
- one bootstrap admin user from environment variables
- goal/profile reference values through enums and goal templates
- meal type enum values
- workout norms reference set
- a small shared food catalog for demo and first-run usage

Recommended seed contents:

- admin login, hashed password, active status
- 5 to 10 workout norms with unit labels and calories-per-unit values
- 15 to 30 common foods with calories and macros per 100g
- 3 to 5 goal templates such as lose weight, maintain weight, gain mass, drink water target, workout frequency

Seed execution expectations:

- Linux-compatible seed script
- idempotent upsert behavior where practical
- no reliance on interactive prompts
- runnable inside Docker container on Ubuntu

## Deployment Considerations

Target deployment shape:

- `web` container: Next.js app
- `db` container: PostgreSQL
- external Nginx reverse proxy on Ubuntu forwarding traffic to the app container port

Requirements to preserve during implementation:

- `DATABASE_URL`, `AUTH_SECRET`, bootstrap admin credentials, and app base URL come from `.env`
- Prisma migrations must run in headless mode
- application must bind to a configurable port
- PostgreSQL data must live in a named Docker volume
- scripts must work in Linux shells and CI containers
- no dependency on a local desktop session

Recommended future files for the deployment phase:

- `Dockerfile`
- `compose.yaml`
- `.env.example`
- `docker/entrypoint.sh`
- Ubuntu deployment section in project README

## Implementation Phases

1. Foundation

- add Prisma, Auth.js, environment validation, and route protection
- create base layout for private app routes
- bootstrap PostgreSQL connection and first migration flow

2. Users, Profiles, And Norms

- admin user creation and user list
- profile editing
- nutrition norm calculation service and current snapshot persistence
- tests for auth, permissions, and norm calculation

3. Food Catalog And Nutrition Logging

- shared food catalog CRUD with admin governance
- meal preview recalculation service
- meal entry save flow and daily totals
- tests for meal recalculation and nutrition aggregation

4. Water, Workouts, And Goals

- water entries and progress
- workout entries with norm-based calorie calculation
- template-based goals and progress calculation
- tests for workout calories and goal progress

5. Dashboards And Reporting

- personal dashboard aggregates
- family dashboard aggregates
- charts and reporting range selectors
- tests for dashboard aggregations

6. Deployment And Polish

- Docker assets
- Ubuntu deployment docs
- seed flow hardening
- mobile polish, empty states, validation cleanup

## Risks And MVP Simplifications

Risks:

- nutrition formulas can drift if not frozen clearly in one service and tested early
- food catalog editing can affect shared trust if governance rules are unclear
- family dashboard permissions can leak too much detail if aggregate-only boundaries are not explicit
- dashboard performance may degrade if indexes are skipped during migration design

Accepted MVP simplifications:

- only credentials login
- no self-registration
- no password reset workflow
- no wearable sync
- no AI recommendations
- no ingredient-based recipe builder
- no materialized analytics tables
- no background jobs required for first release

## Phase Outcome

This repository now has the required technical specification baseline for the next major phase. The next step after approval is implementation of the foundation and core modules in iterations, not full all-at-once delivery.
