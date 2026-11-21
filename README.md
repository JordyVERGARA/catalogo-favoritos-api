# API REST · Catálogo de productos con favoritos y acceso por roles

API REST desarrollada con **Node.js + Express + PostgreSQL (pg)** que gestiona un catálogo de productos y la lista de favoritos de cada usuario, con autenticación **JWT** y autorización por **roles** (`usuario` y `admin`).

## Integrantes

| Integrante | Aportes principales |
|---|---|
|Jordy Rodrigo Vergara Morales | Configuración, base de datos PostgreSQL, CRUD de productos, colección Postman |
| Hector Tenelema | Autenticación JWT, roles, favoritos |

## Propósito

- Consultar el catálogo sin iniciar sesión (listar, filtrar por categoría, ver detalle).
- Permitir que solo el administrador cree, actualice y elimine productos.
- Permitir que cada usuario autenticado gestione **únicamente sus propios** favoritos.

## Elección de base de datos: PostgreSQL

Elegimos PostgreSQL porque los datos son relacionales (usuarios ↔ favoritos ↔ productos) y la propia base garantiza la integridad:

- `UNIQUE (email)` impide correos duplicados.
- `CHECK (precio > 0)` y `CHECK (rol IN ('usuario','admin'))` refuerzan las validaciones del servidor.
- `PRIMARY KEY (usuario_id, producto_id)` en `favoritos` impide favoritos duplicados.
- `FOREIGN KEY ... ON DELETE CASCADE`: al eliminar un producto, se eliminan automáticamente sus favoritos, por lo que nunca quedan favoritos apuntando a productos inexistentes.
- Todas las consultas son **parametrizadas** (`$1, $2, ...`) para evitar inyección SQL.

## Requisitos

- Node.js 18 o superior y npm
- PostgreSQL 14 o superior (probado con 16)
- Postman (para las pruebas)

## Instalación

```bash
git clone https://github.com/USUARIO/REPOSITORIO.git
cd REPOSITORIO
npm install
```

Crear la base de datos vacía (en psql o pgAdmin):

```sql
CREATE DATABASE catalogo_db;
```

## Variables de entorno

Copiar `.env.example` como `.env` y completar los valores locales. El archivo `.env` **no se sube** al repositorio.

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto de la API | `3000` |
| `DB_HOST` / `DB_PORT` | Servidor PostgreSQL | `localhost` / `5432` |
| `DB_USER` / `DB_PASSWORD` | Credenciales de PostgreSQL | `postgres` / _(su clave local)_ |
| `DB_NAME` | Nombre de la base | `catalogo_db` |
| `JWT_SECRET` | Secreto para firmar los JWT (cadena larga aleatoria) | _(generar)_ |
| `JWT_EXPIRES_IN` | Vencimiento del token | `1h` |
| `ADMIN_NOMBRE` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Datos del administrador inicial | `admin@catalogo.test` |

Para generar un `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Inicialización de datos y del administrador

```bash
npm run db:init    # ejecuta db/schema.sql: crea tablas y 6 productos de ejemplo (borra datos previos)
npm run db:admin   # crea o actualiza el administrador con ADMIN_EMAIL / ADMIN_PASSWORD
```

El rol `admin` **solo** se obtiene con `npm run db:admin`. El registro público siempre crea usuarios con rol `usuario`, aunque el cliente envíe `"rol": "admin"`.

## Ejecución

```bash
npm start      # producción
npm run dev    # desarrollo con reinicio automático (nodemon)
```

La API queda en `http://localhost:3000/api`. Comprobación: `GET /api/salud`.

## Estructura del proyecto

```
├── db/schema.sql                 # Script SQL: tablas, restricciones y datos de ejemplo
├── postman/                      # Colección y entorno de Postman
├── scripts/
│   ├── init-db.js                # npm run db:init
│   ├── crear-admin.js            # npm run db:admin
│   └── token-vencido.js          # npm run token:vencido (para la prueba de 401 por expiración)
└── src/
    ├── server.js                 # Arranque y conexión
    ├── app.js                    # Express, middlewares y montaje de rutas
    ├── config/db.js              # Pool de PostgreSQL con variables de entorno
    ├── routes/                   # Definición de rutas y permisos
    ├── controllers/              # Lógica de cada endpoint
    ├── models/                   # Acceso a datos (consultas SQL parametrizadas)
    ├── middlewares/              # auth.js (JWT y roles), errores.js (manejo central)
    └── utils/                    # Validaciones y formato de respuestas
```

Flujo de una petición: **Postman → ruta (`routes/`) → middleware JWT/rol → controlador (`controllers/`) → validación → modelo (`models/`) → PostgreSQL → respuesta JSON**.

## Formato de respuestas

```json
// Éxito
{ "ok": true, "mensaje": "Producto creado", "data": { ... } }

// Error
{ "ok": false, "mensaje": "Datos inválidos", "errores": ["precio debe ser mayor que cero"] }
```

Los errores nunca incluyen trazas, consultas SQL, hashes ni secretos.

### Criterio de códigos HTTP

| Código | Cuándo |
|---|---|
| 200 | Consulta, actualización o eliminación exitosa |
| 201 | Creación (registro, producto, favorito) |
| 400 | Petición mal formada: campos obligatorios ausentes o vacíos, tipo incorrecto (precio como texto), campos no permitidos (p. ej. `usuarioId`), id no numérico, JSON inválido |
| 401 | Sin token, token con firma inválida, token vencido o credenciales incorrectas |
| 403 | Token válido pero sin el rol requerido (usuario intentando modificar el catálogo) |
| 404 | Producto inexistente, ruta inexistente o favorito que no pertenece al usuario |
| 409 | Correo ya registrado o favorito duplicado |
| 422 | Petición bien formada que viola una regla de negocio: precio ≤ 0, correo con formato inválido, contraseña de menos de 6 caracteres |

## Rutas

Prefijo: `/api`. Las rutas protegidas requieren la cabecera `Authorization: Bearer <token>`.

| Método | Ruta | Acceso | Cuerpo | Respuesta exitosa |
|---|---|---|---|---|
| POST | `/auth/registro` | Público | `{ "nombre", "email", "password" }` | 201 · usuario (sin contraseña) |
| POST | `/auth/login` | Público | `{ "email", "password" }` | 200 · `{ token, tipo, expiraEn, usuario }` |
| GET | `/productos` | Público | — · filtro opcional `?categoria=hogar` | 200 · lista de productos |
| GET | `/productos/:id` | Público | — | 200 · producto |
| POST | `/productos` | Admin | `{ "nombre", "descripcion", "categoria", "precio" }` | 201 · producto creado |
| PUT | `/productos/:id` | Admin | Uno o más de: `nombre`, `descripcion`, `categoria`, `precio` | 200 · producto actualizado |
| DELETE | `/productos/:id` | Admin | — | 200 · `{ id }` (sus favoritos se eliminan en cascada) |
| GET | `/favoritos` | Autenticado | — | 200 · favoritos del usuario del token |
| POST | `/favoritos` | Autenticado | `{ "productoId": 1 }` | 201 · favorito creado |
| DELETE | `/favoritos/:productoId` | Autenticado | — | 200 · `{ productoId }` |

**Propiedad de favoritos:** el id del usuario se toma siempre del token verificado (`req.usuario.id`). Si el cliente envía `usuarioId` en el cuerpo, la petición se rechaza con 400. Si un usuario intenta quitar un favorito que no es suyo, recibe 404 y el favorito del otro usuario no se modifica.

**Eliminación de productos:** al eliminar un producto se eliminan automáticamente los favoritos que lo contenían (`ON DELETE CASCADE`).

## Pruebas con Postman

1. Iniciar la API (`npm start`) con la base inicializada y el administrador creado.
2. En Postman: **Import** → `postman/Catalogo.postman_collection.json` y `postman/Catalogo.postman_environment.json`.
3. Seleccionar el entorno **Catálogo - Local** y completar localmente (no se exportan):
   - `adminPassword`: el valor de `ADMIN_PASSWORD` del `.env`.
   - `tokenVencido`: el resultado de `npm run token:vencido`.
4. Abrir el **Collection Runner** y ejecutar en orden las carpetas **00 a 06**.
5. Detener el servidor (`Ctrl + C`), volver a iniciarlo (`npm start`) y ejecutar la carpeta **07 Persistencia**.

La colección se puede ejecutar varias veces: el registro genera correos nuevos en cada corrida.

Opcional, por línea de comandos con Newman:

```bash
npx newman run postman/Catalogo.postman_collection.json -e postman/Catalogo.postman_environment.json \
  --env-var adminPassword=SU_CLAVE_ADMIN --env-var tokenVencido=TOKEN_GENERADO
```

### Casos cubiertos

| Carpeta | Casos |
|---|---|
| 01 Autenticación | Registro correcto, intento de auto-asignarse admin, correo duplicado (409), campos vacíos (400), correo inválido (422), login correcto, credenciales incorrectas (401) |
| 02 Catálogo público | Listar, filtrar por categoría, consultar por id, producto inexistente (404), id inválido (400) |
| 03 CRUD admin | Crear (201), consultar, actualizar (200), precio 0 o negativo (422), campos vacíos (400), precio texto (400), inexistente (404) |
| 04 Seguridad | Sin token (401), token vencido (401), firma inválida (401), usuario crea/actualiza/elimina producto (403) |
| 05 Favoritos | Agregar (201), duplicado (409), producto inexistente (404), listar, aislamiento A/B, B no puede quitar el favorito de A, quitar (200) |
| 06 Consistencia | Eliminar producto y comprobar que desaparece de los favoritos |
| 07 Persistencia | Tras reiniciar Node.js: productos, usuarios y favoritos siguen guardados |

## Recursos y herramientas de apoyo

- Documentación de [Express](https://expressjs.com/), [node-postgres](https://node-postgres.com/), [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) y [bcryptjs](https://github.com/dcodeIO/bcrypt.js).
- Claude (asistente de IA) como apoyo para estructurar el proyecto, generar código base y resolver errores; el código fue revisado y comprendido por ambos integrantes.