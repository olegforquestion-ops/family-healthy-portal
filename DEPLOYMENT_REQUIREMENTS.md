\# Deployment requirements



The system must be deployable on a remote Ubuntu server.



Mandatory requirements:

\- production deployment target: Ubuntu LTS

\- app must run in Docker containers

\- must include docker-compose.yml or compose.yaml

\- database: PostgreSQL in separate container

\- app must support environment variables via .env

\- must include production-ready Dockerfile

\- must include README with Ubuntu deployment steps

\- must include database migrations and migration execution instructions

\- must support reverse proxy via Nginx

\- must not depend on Windows-specific tooling

\- must not require local desktop environment

\- must support headless deployment

\- must expose app via configurable port

\- must persist PostgreSQL data in Docker volume

