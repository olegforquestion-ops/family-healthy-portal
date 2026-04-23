\# AGENTS.md



\## Project

Family Healthy Lifestyle Portal (MVP)



\## Source of truth

Always follow `TZ.md`.

If there is ambiguity, choose the simplest MVP-friendly interpretation.



\## Delivery process

Do not jump directly into full implementation.



Work in phases:

1\. UX and interface planning

2\. UI approval

3\. technical architecture and data model

4\. implementation of core modules

5\. deployment and polish



Do not proceed to the next major phase without summarizing the previous one.



\## Mandatory first phase

Before implementing full business logic, first produce:

\- screen map

\- user flows

\- wireframes or mock pages

\- page/component inventory

\- proposed app structure



\## MVP priorities

Required:

\- authentication

\- admin-created users only

\- user profiles

\- weight and measurements history

\- calories/macros calculation

\- nutrition log

\- shared food database

\- meal draft preview with recalculation

\- water tracking

\- workout tracking

\- template-based goals

\- personal dashboard

\- family dashboard



\## Out of scope

Do not implement unless explicitly requested:

\- public self-registration

\- password reset by email or SMS

\- wearable integrations

\- AI recommendations

\- complex recipe builder with ingredients

\- messaging bot integrations

\- medical diagnostics

\- social features beyond family overview



\## Tech stack

Use:

\- Next.js

\- TypeScript

\- Tailwind CSS

\- shadcn/ui

\- PostgreSQL

\- Prisma

\- Auth.js/NextAuth with credentials auth

\- Recharts

\- Docker

\- Docker Compose

\- Nginx-compatible deployment



Do not replace the stack unless there is a strong reason and you explain it first.



\## Deployment requirement

This project must be deployable on a remote Ubuntu server.



Mandatory:

\- Docker-based deployment

\- PostgreSQL in a separate container

\- environment variables via `.env`

\- production Dockerfile

\- compose file

\- migration support

\- headless deployment

\- Linux-compatible scripts only



\## Development principles

\- prefer simple, explicit code

\- avoid overengineering

\- keep domain modules isolated

\- use migrations for schema changes

\- use seed data for reference tables

\- keep UI mobile-friendly

\- prioritize working MVP over extensibility fantasies



\## Access rules

\- admin can create users manually

\- no self-registration

\- user manages only own detailed data

\- admin can view all users and family dashboards

\- enforce access in backend and UI



\## Testing expectations

At minimum, add tests for:

\- auth and permissions

\- calorie/macros calculation

\- meal draft recalculation

\- workout calories by norm

\- goal progress calculation

\- dashboard aggregations



\## Iteration discipline

For each major task:

1\. summarize the plan

2\. implement

3\. run checks/tests

4\. update README if needed

5\. summarize what remains

