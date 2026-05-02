# Vincobov API

Backend en NestJS para marketplace agropecuario con autenticacion JWT, autorizacion por roles/permisos, CRUD para todos los modulos y pruebas unitarias.

## Requisitos

- Node.js 20+
- Docker y Docker Compose
- npm

## Configuracion local

1. Instalar dependencias:

```bash
npm install
```

2. Levantar PostgreSQL:

```bash
docker compose up -d
```

3. Revisar variables en `.env`:

- `DB_HOST=localhost`
- `DB_PORT=5433`
- `DB_DATABASE=vincobov`
- `DB_USERNAME=postgres`
- `DB_PASSWORD=postgres`
- `DB_SYNCHRONIZE=true` (solo desarrollo inicial)

4. Iniciar API:

```bash
npm run start:dev
```

## Modulo 1: alimentacion base de datos por SQL

El script oficial de carga inicial esta en:

- `db/seed.initial.sql`

Este script:

- crea/actualiza roles iniciales (`admin`, `seller`, `buyer`)
- crea permisos
- asigna permisos por rol
- crea/actualiza usuarios iniciales

### Ejecutar seed SQL

```bash
docker exec -i vincobov-postgres psql -U postgres -d vincobov < db/seed.initial.sql
```

Credenciales de prueba:

- `admin@vincobov.com` / `Admin123*`
- `seller1@vincobov.com` / `Seller123*`
- `buyer1@vincobov.com` / `Buyer123*`

## Modulo 2 y 3: autenticacion/autorizacion

- Login JWT: `POST /auth/login`
- Logout (stateless): `POST /auth/logout`
- Rutas protegidas con `AuthGuard('jwt')` + `PermissionsGuard`
- Permisos por endpoint mediante `@Permissions(...)`

## Modulo 4: CRUD con TypeORM

Recursos expuestos:

- auth: `users`, `roles`
- negocio: `product`
- marketplace: `categories`, `orders`, `payments`, `chats`, `messages`

Todos los servicios interactuan con base de datos via repositorios TypeORM.

## Modulo 5: pruebas unitarias

Ejecutar:

```bash
npm run test
```

## Modulo 6: Postman

Coleccion incluida en:

- `postman/vincobov.postman_collection.json`

Importar en Postman y definir variable `baseUrl` (ej. `http://localhost:3000`).

## Comandos utiles

```bash
npm run build
npm run lint
npm run test
```
