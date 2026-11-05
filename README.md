# Dulce Encanto

Sistema de gestión de inventario, ventas y compras para una cadena ficticia de pastelerías de Costa Rica.

## Estructura
- backend/src/models: acceso a datos.
- backend/src/controllers: lógica CRUD.
- backend/src/routes: rutas API.
- backend/src/config: conexión MySQL.
- frontend/src/components: componentes React.
- frontend/src/pages: vistas.
- frontend/src/services: llamadas API.
- database/dulce_encanto.sql: 15 tablas relacionadas.

## Estado
Backend Express con conexión MySQL y CRUD de las 15 entidades implementados. Probado en MySQL 8.0.46 en una instancia aislada; la conexión a la instalación personal requiere configurar backend/.env. Interfaz React implementada; ver frontend/README.md para ejecutarla. Se requiere MySQL 8.0.16 o posterior para aplicar CHECK.

## Ejecutar el servidor

Usar Node.js 22. Desde la carpeta backend:

```sh
npm ci
npm start
```

Para reiniciar automáticamente al editar: `npm run dev`.
Opcionalmente copiar backend/.env.example a backend/.env para cambiar PORT.
El servidor escucha localmente en http://localhost:3000.

- GET /: identificación del servicio (200).
- GET /api/salud: estado del servidor (200); no comprueba MySQL.
- Rutas inexistentes: respuesta JSON con estado 404.
- JSON inválido: respuesta JSON con estado 400.

Las rutas CRUD, ejemplos, configuración y pruebas se explican en [backend/DOCUMENTACION.md](backend/DOCUMENTACION.md). Se incluye una colección Postman en esa carpeta.

Los totales y la obligación de incluir detalles se validarán mediante transacciones en el backend. No incluye autenticación.



## Día 2: autenticación

La regla sin autenticación corresponde únicamente al día 1. Desde el día 2, las rutas empresariales requieren JWT. Ver backend/AUTENTICACION.md e INFORME_JWT_DIA_2.md.

Para instalar desde cero: configurar backend/.env, ejecutar npm ci en backend, npm run db:init y node --env-file=.env scripts/migrate-auth.js. Luego arrancar el backend. En frontend ejecutar npm ci y npm run dev. Si el backend usa 3000, ajustar el destino del proxy en frontend/vite.config.js; la configuración actual utiliza 3001.

El frontend se abre en http://localhost:5173/login. Crear la cuenta en /registro. Las contraseñas se guardan como hash; JWT_SECRET nunca se comparte con React. La sesión dura una hora y se pierde al recargar porque el token se conserva en memoria.

El diagrama actualizado está en diagramas/dulce-encanto-dia-2.png y .svg. La colección backend/Dulce-Encanto.postman_collection.json incluye 90 solicitudes y 239 comprobaciones aprobadas. Ver backend/POSTMAN_DIA_2.md antes de ejecutarla: usar una base aislada para pruebas.
