# Autenticación: avance del paso 2

## Instalación

Ejecutar `npm ci` y, desde backend con .env configurado, `node --env-file=.env scripts/migrate-auth.js`. Este comando agrega la tabla usuario sin alterar las tablas empresariales y genera JWT_SECRET si esa variable aún no está definida. Si ya existe, debe contener al menos 32 bytes aleatorios. Nunca copiar el secreto al frontend ni subir .env a GitHub.

La base cuenta ahora con 16 tablas. Para una instalación nueva, primero ejecutar `npm run db:init` y después la migración de autenticación.

## Endpoints

- POST /api/auth/register: `{ "nombre": "Nombre", "correo": "correo@example.com", "password": "una contraseña de 8 o más caracteres" }`. Devuelve 201 con usuario público; 400 si el correo ya existe o los datos no son válidos.
- POST /api/auth/login: correo y password. Devuelve 200 con token y usuario; credenciales incorrectas válidas en formato devuelven 401, datos malformados 400.
- GET /api/auth/me: requiere `Authorization: Bearer TOKEN`; devuelve el perfil sin hash o 401.

El password se guarda como hash bcrypt con costo 12. Se rechazan más de 72 bytes UTF-8. El JWT usa HS256, expira en 30 minutos y verifica emisor y destinatario. El servidor vuelve a consultar la existencia del usuario.

## Pruebas

La prueba tests/auth.test.js se ejecutó en MySQL aislado (3307). Comprueba registro, hash, correo duplicado, validaciones, login incorrecto/correcto, perfil, expiración, firma inválida y usuario eliminado. No utilizar esta prueba con datos personales. Requiere RUN_DB_TESTS=1.

Las rutas empresariales, metadatos y salud de la base requieren Bearer JWT. Solo registro, login y salud básica del servidor son públicos. React incluye /login, /registro, AuthContext y protección de las páginas de gestión. El token se mantiene en memoria; al recargar, cerrar sesión, vencer 30 minutos o recibir 401 desde una ruta protegida, se solicita iniciar sesión nuevamente.

Pruebas repetidas: 15 CRUD con JWT; las cinco operaciones de cada entidad rechazan peticiones sin token; perfil y tokens inválidos/vencidos. Frontend compilado. La comprobación visual del flujo autenticado sigue pendiente por un fallo del navegador automatizado.

El script de demostración ahora exige API_TOKEN con un JWT válido. No guardar el token en archivos del repositorio. Los datos de demostración ya cargados se conservan.


Actualización: el frontend mantiene el JWT en sessionStorage de la pestaña, restaura el perfil al recargar y elimina la sesión al salir o a los 30 minutos desde el login. La recarga no extiende la expiración.
