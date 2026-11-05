# Diagrama actualizado del día 2

16 entidades: las 15 empresariales más Usuario.

- dulce-encanto-dia-2.svg: imagen vectorial para abrir, ampliar o imprimir sin perder calidad.
- dulce-encanto-dia-2.mmd: fuente editable en Mermaid.
- dulce-encanto-dia-2.dot: fuente editable en Graphviz.

Usuario contiene id, nombre, correo único, password (hash bcrypt) y fechaCreacion. No se agrega una FK desde Usuario a Empleado: el requisito solicita autenticación, no auditoría ni roles, y las cuentas no se equiparan automáticamente a empleados.

Las tablas de ventas, recetas y órdenes exigen detalles mediante transacciones del backend. Inventario tiene una restricción única compuesta (id_producto,id_sucursal) y detalle_receta tiene (id_receta,id_ingrediente). La FK id_producto de receta es única. Las restricciones de unicidad compuesta no se representan como una FK adicional.

- dulce-encanto-dia-2.png: imagen de alta resolución lista para adjuntar al documento.
