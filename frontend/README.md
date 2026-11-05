# Interfaz React de Dulce Encanto

Requiere Node.js 22 y backend accesible en http://127.0.0.1:3001.

Desde frontend:

```sh
npm ci
npm run dev
```

Abrir http://localhost:5173. Vite redirige las solicitudes /api al backend, según vite.config.js. Si el backend usa otro puerto, ajustar ese archivo. Para compilar: `npm run build`.

La aplicación incluye 15 secciones con búsqueda, listado, creación, edición y confirmación de eliminación. Los campos relacionados se seleccionan por nombre; deben existir previamente los registros de referencia. Empezar por categorías, sucursales, métodos de pago, proveedores e ingredientes.

Ventas, recetas y órdenes de compra incluyen un formulario de líneas de detalle; el backend calcula los totales. Los formularios se generan con los metadatos de GET /api/entidades y guardan mediante POST/PUT. Los datos se conservan en MySQL.

Validación realizada: compilación de producción, conexión a las 15 entidades, creación y edición de categoría desde el navegador, confirmación visual de eliminación y limpieza del registro temporal mediante la API. Los CRUD de las 15 entidades se verificaron además en las pruebas del backend. No se ha probado manualmente cada formulario en el navegador.

No hay inicio de sesión. El inventario se administra por separado y las ventas no descuentan existencias automáticamente.
