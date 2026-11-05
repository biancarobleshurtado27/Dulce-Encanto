# Dulce Encanto

Sistema académico de inventario, ventas, recetas y compras para una cadena ficticia de pastelerías de Costa Rica. Día 2: Node.js, Express, React, MySQL y autenticación JWT, sin roles diferenciados.

## Requisitos

- Node.js 22 y npm disponibles en la terminal.
- MySQL 8.0.16 o posterior, iniciado.
- Un usuario MySQL con permiso para crear la base y tablas durante la instalación.

## 1. Descargar

```sh
git clone --branch codex/dulce-encanto https://github.com/biancarobleshurtado27/Dulce-Encanto.git
cd Dulce-Encanto
```

## 2. Configurar backend

```sh
cd backend
npm ci
```

Copiar .env.example a .env y completar DB_USER y DB_PASSWORD con los datos privados de tu MySQL.

| Variable | Configuración |
|---|---|
| PORT | 3001, para coincidir con el proxy del frontend. |
| DB_HOST | localhost o el servidor MySQL correspondiente. |
| DB_PORT | Normalmente 3306. |
| DB_NAME | dulce_encanto. |
| DB_USER / DB_PASSWORD | Credenciales privadas de MySQL. |
| FRONTEND_ORIGIN | Orígenes React permitidos por CORS. |
| JWT_SECRET | Clave aleatoria privada de al menos 32 bytes; la migración la genera si está vacía o no existe. |

No subir .env, contraseñas ni tokens al repositorio. El ejemplo no contiene secretos reales.

## 3. Crear o actualizar la base

En una instalación nueva, desde backend:

```sh
npm run db:init
node --env-file=.env scripts/migrate-auth.js
```

El primer comando crea las 15 tablas empresariales y se detiene si encuentra tablas existentes, para conservar tus datos. El segundo agrega Usuario y prepara JWT_SECRET. Resultado: 16 tablas.

Si ya tienes la base del día 1, omite db:init y ejecuta únicamente migrate-auth.js. No borres la base existente.

Los archivos SQL están en database/dulce_encanto.sql y database/002_usuario.sql. Si los ejecutas manualmente en Workbench, selecciona dulce_encanto antes de ejecutar 002_usuario.sql y configura también JWT_SECRET.

## 4. Ejecutar

Primera terminal, dentro de backend:

```sh
npm start
```

Para reinicio automático: npm run dev.

Segunda terminal, desde la raíz del proyecto:

```sh
cd frontend
npm ci
npm run dev
```

Abrir http://localhost:5173/login. Crear una cuenta en /registro e iniciar sesión. Vite redirige /api a http://127.0.0.1:3001; si cambias el puerto del backend, ajustar frontend/vite.config.js.

El JWT se conserva en sessionStorage de la pestaña y vence a los 30 minutos desde el login. Recargar no renueva ese plazo: se valida el token consultando el perfil antes de mostrar el panel. Cerrar sesión, vencer el plazo o recibir 401 elimina la sesión. Los registros confirmados con Guardar permanecen en MySQL; los formularios sin guardar no se recuperan al recargar.

## Funciones y API

Las 15 entidades empresariales tienen crear, listar, consultar por ID, actualizar y eliminar: categorias, productos, sucursales, inventarios, clientes, ventas, detalles-venta, metodos-pago, empleados, proveedores, ingredientes, recetas, detalles-receta, ordenes-compra y detalles-compra.

Cada ruta utiliza GET/POST /api/entidad y GET/PUT/DELETE /api/entidad/:id. Requieren Authorization: Bearer TOKEN. React incluye tablas, búsqueda, formularios, selectores relacionados y eliminación con confirmación.

| Ruta | Acceso | Resultado |
|---|---|---|
| POST /api/auth/register | Público | Usuario sin password: 201 o 400. |
| POST /api/auth/login | Público | Token y usuario: 200, 400 o 401. |
| GET /api/auth/me | JWT | Perfil: 200 o 401. |
| GET /api/salud | Público | Estado del servidor; no verifica MySQL. |
| GET /api/salud/db | JWT | Comprueba MySQL. |
| GET /api/entidades | JWT | Campos para los formularios. |

Las ventas, recetas y órdenes se guardan con detalles en transacciones. Los totales se calculan desde los detalles. Las relaciones y valores únicos se validan. No se eliminan maestros referenciados.

Contraseñas: hash bcrypt, costo 12, mínimo 8 caracteres y máximo 72 bytes UTF-8. JWT: HS256, 30 minutos, emisor y destinatario verificados. Los hashes no se devuelven y JWT_SECRET no se envía a React. Fuera del desarrollo local se necesita HTTPS.

## Pruebas y demostración

- [Colección Postman](backend/Dulce-Encanto.postman_collection.json): 90 solicitudes y 239 comprobaciones aprobadas, incluidos 400, 401, 404 y 409. Leer [instrucciones](backend/POSTMAN_DIA_2.md). Ejecutar sobre una base aislada.
- Backend: npm test, desde backend. Configurar RUN_DB_TESTS=1 y DB_* para una base de pruebas con 16 tablas. Nunca usar datos personales o de producción. Las pruebas generan sus propios usuarios y claves de prueba.
- Frontend: npm run build, desde frontend.
- Datos ficticios: con el backend encendido y API_TOKEN temporal con un JWT válido, ejecutar node scripts/demo.js desde backend. API_URL permite otro destino. No guardar el JWT en el repositorio.

Se verificaron las suites de autenticación y los 15 CRUD con JWT en MySQL aislado, la colección Postman y la compilación React. En Chrome se comprobó el panel autenticado, consulta de venta, cierre de sesión y nuevo login. La usuaria realizó el registro. No se guardó manualmente un registro desde cada formulario.

## Entregables y estructura

- [Investigación JWT y fuentes](INFORME_JWT_DIA_2.md).
- [Diagrama PNG](diagramas/dulce-encanto-dia-2.png), [SVG](diagramas/dulce-encanto-dia-2.svg) y [Mermaid](diagramas/dulce-encanto-dia-2.mmd).
- [Requerimientos del día 2](REQUERIMIENTOS_DIA_2.md).
- [Guía de demostración](GUIA_DEMOSTRACION.md).
- backend/src: config, models, controllers, routes, middlewares.
- frontend/src: components, context, pages, services.
- database: esquema empresarial y migración Usuario.

Cada entidad empresarial tiene un archivo de modelo, controlador y rutas en backend, además de una página con URL propia y un servicio en frontend. Los controladores usan una fábrica CRUD común y las páginas reutilizan GestionEntidad.jsx. Usuario mantiene sus archivos de autenticación separados. Así se conserva la organización por entidad sin duplicar validaciones ni formularios.

## Alcance

El inventario se administra por su CRUD; las ventas no descuentan existencias automáticamente. No se incluyen lotes, vencimientos, inventario de ingredientes, roles, recuperación de contraseña ni refresh tokens. Al vencer el token se inicia sesión otra vez. Cerrar sesión no revoca una copia del JWT en el servidor; esa copia vence según su expiración.



