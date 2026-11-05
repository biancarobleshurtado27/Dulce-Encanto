# Día 2: autenticación y CRUD completos

El día 2 reemplaza la regla sin autenticación del día 1. Fecha límite indicada: 5 de noviembre de 2026, antes de las 13:00, Costa Rica.

- [x] Leer los requisitos del día 2 y revisar el avance previo.
- [x] CRUD de las 15 entidades empresariales implementados y probados con autenticación.
- [x] Informe previo sobre JWT, expiración, refresh, almacenamiento, XSS/CSRF, middleware y seguridad, con fuentes.
- [x] Agregar Usuario: id, nombre, correo único, password hash y fechaCreacion.
- [x] Registro público POST /api/auth/register (201; correo duplicado 400).
- [x] Login público POST /api/auth/login (200 o 401).
- [x] Perfil protegido GET /api/auth/me (200 o 401).
- [x] Bcrypt, contraseña mínima de 8 caracteres; hash nunca devuelto.
- [x] JWT con expiración y clave en .env.
- [x] Middleware Bearer; rutas empresariales protegidas; 401 sin autorización.
- [x] Relaciones inexistentes: devolver 400 o 404; dependencia al eliminar: 409.
- [x] Adaptar React: login, registro, AuthContext y rutas protegidas.
- [x] Enviar token en cada llamada protegida; limpiar sesión ante 401 y al salir.
- [x] Mantener páginas CRUD y selectores relacionados para las 15 entidades.
- [x] Actualizar diagrama para incluir Usuario: 16 entidades, SVG y fuente Mermaid.
- [x] Colección Postman completa con auth y casos 400, 401, 404 y 409: 90 solicitudes, 239 comprobaciones, sin fallos.
- [x] Repetir pruebas backend con autenticación y compilar frontend.
- [x] Registro realizado por la usuaria. Verificación visual en Chrome: panel autenticado, consulta de detalle de venta, cierre de sesión y regreso al panel mediante login.
- [x] Actualizar README, configuración de ejemplo y guía de presentación.
- [x] Revisar archivos de entrega y exclusión de .env y node_modules.
- [x] Verificar generación de JWT_SECRET al instalar con el valor de ejemplo vacío.
- [x] Sincronizar entregables del día 2 en GitHub.

No se exigen roles ni permisos. La sección específica de Usuario exige registro, login y perfil; los cinco endpoints CRUD se mantienen en las entidades empresariales.

