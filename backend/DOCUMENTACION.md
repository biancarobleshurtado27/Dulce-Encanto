# Backend Dulce Encanto

## Configuración

1. Usar Node.js 22.
2. En backend ejecutar `npm ci`.
3. Copiar `.env.example` a `.env`; completar DB_USER y DB_PASSWORD. No subir este archivo.
4. Ejecutar `npm run db:init` para crear las 15 tablas en MySQL. El comando se detiene si ya hay tablas para conservar los datos.
5. Ejecutar `npm start` o `npm run dev`.

La API local escucha en el puerto indicado por PORT (3000 por defecto). GET /api/salud/db comprueba MySQL. GET /api/entidades describe campos para los formularios.

## Rutas

Cada entidad tiene GET y POST /api/{ruta}, y GET, PUT y DELETE /api/{ruta}/{id}.

Rutas: categorias, productos, sucursales, inventarios, clientes, ventas, detalles-venta, metodos-pago, empleados, proveedores, ingredientes, recetas, detalles-receta, ordenes-compra, detalles-compra.

POST devuelve 201, GET/PUT 200 y DELETE 204. Los errores devuelven JSON con `error`: 400 datos inválidos, 404 inexistente, 409 duplicado o conflicto de relación, 503 base no disponible.

PUT actualiza los campos enviados. Se rechazan campos desconocidos, identificadores automáticos, totales y subtotales. Los campos opcionales pueden enviarse como null. Las fechas usan YYYY-MM-DD; las fechas con hora YYYY-MM-DD HH:mm:ss. Los importes y cantidades se envían como números JSON, no texto.

## Ejemplos

POST /api/categorias
```json
{"nombre":"Pasteles","descripcion":"Pasteles para celebraciones"}
```

POST /api/productos (usar una categoría existente)
```json
{"id_categoria":1,"codigo":"PAST-001","nombre":"Pastel de chocolate","precio_venta":12500,"vida_util_dias":3}
```

POST /api/ventas (todos los identificadores deben existir)
```json
{"id_sucursal":1,"id_empleado":1,"id_metodo_pago":1,"detalles":[{"id_producto":1,"cantidad":2,"precio_unitario":12500}]}
```

POST /api/recetas
```json
{"id_producto":1,"nombre":"Pastel de chocolate","instrucciones":"Mezclar y hornear","rendimiento_unidades":1,"tiempo_preparacion_minutos":60,"detalles":[{"id_ingrediente":1,"cantidad":0.5}]}
```

POST /api/ordenes-compra
```json
{"id_proveedor":1,"id_empleado":1,"detalles":[{"id_ingrediente":1,"cantidad":10,"costo_unitario":1200}]}
```

Ventas, recetas y compras requieren al menos un detalle al crearse. GET por ID incluye detalles. PUT puede recibir `detalles` para reemplazarlos completamente en una transacción; no enviar IDs de detalle ni del padre dentro de ese arreglo. Eliminar un padre elimina sus propios detalles dentro de la transacción. Un detalle independiente no puede cambiar de padre ni eliminarse si es el último. No se permite borrar registros maestros referenciados.

Las operaciones de venta y compra recalculan el total al modificar los detalles. El inventario se administra con su CRUD; registrar una venta no descuenta existencias automáticamente y recibir una compra no modifica existencias de ingredientes. No hay autenticación, lotes ni control de vencimientos.

## Pruebas

`npm test` necesita RUN_DB_TESTS=1 y una base de datos de prueba vacía con las mismas tablas. Configurar las variables DB_* exclusivamente para esa base: las pruebas crean y eliminan registros. Nunca ejecutar contra datos personales o de producción.

La suite verifica los 15 CRUD, duplicados, relaciones, cantidades, rollback, totales y protección del último detalle. Se ejecutó satisfactoriamente en MySQL 8.0.46, en una instancia aislada del puerto 3307.

Importar `Dulce-Encanto.postman_collection.json` en Postman. Cambiar baseUrl al puerto activo. Los cuerpos vacíos son plantillas que deben completarse con los campos de /api/entidades; los IDs de ejemplo deben sustituirse por los reales.
