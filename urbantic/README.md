# URBANTIC

Sistema web de reporte y seguimiento de problemas urbanos. Este repositorio contiene el avance del 25% del proyecto, equivalente al cierre del Sprint 1.

## Alcance Sprint 1

- Infraestructura Docker completa.
- Modelo de datos de usuarios y roles.
- Autenticacion con registro, login y JWT.
- Autorizacion por rol.
- Perfil de usuario con consulta y edicion.
- Layout base y navegacion protegida por rol.

No incluye reportes urbanos, mapas, asignaciones, estadisticas, recuperacion de password, verificacion de correo ni refresh tokens.

## Stack

- Frontend: React 18, Vite, JavaScript, Axios, React Router.
- Backend: Node.js 20, Express, PostgreSQL, JWT, bcrypt.
- Base de datos: PostgreSQL 16.
- Contenedores: Docker y Docker Compose.

## Instalacion

1. Clonar el repositorio.

```bash
git clone <url-del-repositorio>
cd Telematicos-2026/urbantic
```

2. Copiar variables de entorno.

```bash
cp .env.example .env
```

3. Revisar `.env` y reemplazar los valores `change_me_*` si corresponde.

4. Construir las imagenes.

```bash
docker compose build
```

5. Levantar el sistema.

```bash
docker compose up -d
```

6. Verificar la API.

```bash
curl http://localhost:4000/api/health
```

La respuesta esperada es:

```json
{
  "success": true,
  "message": "URBANTIC API funcionando.",
  "data": {
    "status": "ok"
  }
}
```

El frontend queda disponible en:

```text
http://localhost:8081
```

## Usuarios de prueba

Todos los usuarios seed usan el password:

```text
Password123!
```

| Rol | Correo |
| --- | --- |
| ADMINISTRADOR | administrador@urbantic.test |
| TECNICO | tecnico@urbantic.test |
| CIUDADANO | ciudadano@urbantic.test |

## Endpoints

### Health

```http
GET /api/health
```

### Registro

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "firstName": "Ana",
  "lastName": "Perez",
  "phone": "70000004",
  "email": "ana@example.com",
  "password": "Password123!"
}
```

El rol se fuerza en servidor a `CIUDADANO`.

### Login

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "ciudadano@urbantic.test",
  "password": "Password123!"
}
```

### Usuario autenticado

```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Editar perfil

```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "firstName": "Ana",
  "lastName": "Gomez",
  "phone": "75550000"
}
```

Solo se aceptan `firstName`, `lastName` y `phone`. Cualquier otro campo enviado se ignora.

## Checklist de verificacion manual

### 1. Los 3 servicios levantan correctamente

```bash
docker compose up -d --build
docker compose ps
```

Los servicios `database`, `backend` y `frontend` deben aparecer como `healthy`.

### 2. Healthcheck de API

```bash
curl http://localhost:4000/api/health
```

### 3. Registro de usuario ciudadano

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"Ana\",\"lastName\":\"Perez\",\"phone\":\"70000004\",\"email\":\"ana@example.com\",\"password\":\"Password123!\"}"
```

Debe responder con `success: true` y el usuario con rol `CIUDADANO`.

### 4. Login exitoso

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"ciudadano@urbantic.test\",\"password\":\"Password123!\"}"
```

Debe responder con `success: true`, `user` y `token`.

### 5. Acceso denegado sin token

```bash
curl -i http://localhost:4000/api/auth/me
```

Debe responder `401 Unauthorized`.

### 6. Acceso con token

Guarda el token devuelto por login y ejecuta:

```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

### 7. Persistencia despues de detener contenedores

```bash
docker compose down
docker compose up -d
docker compose exec database psql -U urbantic_user -d urbantic -c "SELECT email FROM users ORDER BY id;"
```

Los usuarios seed y los usuarios registrados deben seguir existiendo porque los datos viven en el volumen `urban_pgdata`.

### 8. Limpieza completa opcional

Este comando elimina tambien el volumen de datos.

```bash
docker compose down -v
```
