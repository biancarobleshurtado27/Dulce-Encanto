# Demostración de Dulce Encanto

Todos los datos precargados son ficticios. Abrir http://localhost:5173/login con ambos servidores encendidos e iniciar sesión. Desde el día 2, la consulta y administración de datos requiere una cuenta registrada.

## Recorrido sugerido para presentar

1. Categorías: Pasteles de celebración y Galletas y bocados.
2. Productos: pastel de chocolate (CRC 12 500) y galleta de chispas (CRC 1 200).
3. Sucursales: siete tiendas, una por provincia.
4. Inventario: dos productos por sucursal, 14 registros.
5. Clientes, empleados y métodos de pago: mostrar cómo se relacionan con una venta.
6. Ventas: editar la venta de demostración para consultar sus dos líneas. Su total es CRC 17 300 (1 pastel y 4 galletas). Cancelar para conservarla.
7. Recetas: editar el pastel de chocolate y consultar sus tres ingredientes. Cancelar.
8. Proveedores y órdenes de compra: consultar la orden de harina y azúcar por CRC 17 000.
9. Crear una categoría nueva, buscarla, editarla y eliminarla con confirmación para demostrar un CRUD completo.

El inventario se administra independientemente: las ventas no descuentan existencias automáticamente.

## Cargar datos en otra instalación

Con las 16 tablas creadas, el backend encendido en 3001 y API_TOKEN configurado temporalmente con un JWT válido obtenido mediante login, ejecutar desde backend:

```sh
node scripts/demo.js
```

API_URL permite cambiar el destino de la API. La carga consulta antes de crear y conserva los registros existentes. No es una operación atómica global: si falla, se puede corregir el problema y volver a ejecutar.

## Verificación realizada

Se abrieron los 15 formularios de creación en el navegador y se comprobaron campos y opciones de relaciones con datos de demostración. La creación y edición desde React se verificaron previamente con una categoría. Los 15 CRUD se probaron contra MySQL en la suite del backend; no se guardó manualmente un registro desde cada formulario.

No se incluyen contraseñas en los archivos entregables. backend/.env es privado y no está en GitHub.
