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
Estructura inicial restaurada. Servidor Express, interfaz React y dependencias pendientes de implementar. La base de datos aún no se ha ejecutado ni probado en MySQL. Se requiere MySQL 8.0.16 o posterior para aplicar CHECK.

Los totales y la obligación de incluir detalles se validarán mediante transacciones en el backend. No incluye autenticación.

