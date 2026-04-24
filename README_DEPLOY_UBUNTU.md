# Ubuntu Deployment Guide

## Target

- Ubuntu LTS server
- Docker Engine with Docker Compose plugin
- Nginx as reverse proxy

## Files

- `Dockerfile`
- `compose.yaml`
- `docker/nginx.family-healthy-portal.conf.example`
- `.env.example`

## Required environment variables

Copy `.env.example` to `.env` and fill in real values.

- `NODE_ENV`
- `PORT`
- `APP_URL`
- `AUTH_SECRET`
- `DATABASE_URL`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `BOOTSTRAP_FAMILY_NAME`
- `BOOTSTRAP_ADMIN_LOGIN`
- `BOOTSTRAP_ADMIN_PASSWORD`
- `BOOTSTRAP_ADMIN_DISPLAY_NAME`

## First deploy

1. Install Docker and Docker Compose plugin on Ubuntu.
2. Clone the repository on the server.
3. Create `.env` from `.env.example`.
4. Build and start PostgreSQL:

```bash
docker compose build
docker compose up -d db
```

5. Apply database migrations:

```bash
docker compose run --rm app npx prisma migrate deploy
```

6. Seed bootstrap data:

```bash
docker compose run --rm app npx prisma db seed
```

7. Start the application:

```bash
docker compose up -d app
```

8. Check status:

```bash
docker compose ps
docker compose logs -f app
```

## Update deploy

After pulling new code:

```bash
docker compose build
docker compose run --rm app npx prisma migrate deploy
docker compose up -d app
```

Seed only when you intentionally need reference/bootstrap updates:

```bash
docker compose run --rm app npx prisma db seed
```

## Reverse proxy with Nginx

1. Copy `docker/nginx.family-healthy-portal.conf.example` to `/etc/nginx/sites-available/family-healthy-portal.conf`
2. Replace `example.com` with your real domain
3. Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/family-healthy-portal.conf /etc/nginx/sites-enabled/family-healthy-portal.conf
sudo nginx -t
sudo systemctl reload nginx
```

For HTTPS, terminate TLS in Nginx with Certbot or your preferred certificate flow.

## Healthchecks

Current setup includes:

- PostgreSQL healthcheck with `pg_isready`
- app healthcheck against `/login`

Recommendations:

- keep `APP_URL` aligned with the real public URL
- monitor `docker compose ps`
- review `docker compose logs -f app` after each deploy

## Troubleshooting

### App container restarts immediately

- check `.env`
- confirm `AUTH_SECRET` is set
- confirm `DATABASE_URL` points to `db:5432` inside Docker

### Migrations fail

- ensure `db` is healthy first:

```bash
docker compose ps
docker compose logs -f db
```

- rerun:

```bash
docker compose run --rm app npx prisma migrate deploy
```

### Site is not reachable through Nginx

- verify container is listening:

```bash
docker compose ps
docker compose logs -f app
```

- verify Nginx syntax:

```bash
sudo nginx -t
```

### Database data disappeared

- confirm the `postgres_data` Docker volume exists:

```bash
docker volume ls
```

- do not use `docker compose down -v` on production unless you intentionally want to remove database data
