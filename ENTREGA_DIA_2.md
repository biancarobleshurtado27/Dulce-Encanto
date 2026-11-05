# Entrega del día 2 · Dulce Encanto

## Archivos para presentar

1. INFORME_JWT_DIA_2.md: investigación previa, decisiones de autenticación y fuentes.
2. diagramas/dulce-encanto-dia-2.png: modelo de 16 entidades con Usuario. También se incluyen SVG y fuentes editables.
3. Repositorio con backend, frontend, SQL y README: https://github.com/biancarobleshurtado27/Dulce-Encanto/tree/codex/dulce-encanto
4. backend/Dulce-Encanto.postman_collection.json: importar en Postman y seguir backend/POSTMAN_DIA_2.md.
5. README.md: requisitos e instalación desde cero, migración, configuración y ejecución.

El documento de Google del caso empresarial corresponde al día 1. Adjuntar el diagrama actualizado al documento que se entregue para el día 2.

## Evidencia verificada

- MySQL personal: 16 tablas después de agregar Usuario; datos empresariales conservados.
- Suite de autenticación y los 15 CRUD con JWT aprobados sobre MySQL aislado.
- Postman/Newman: 90 solicitudes, 239 comprobaciones, sin fallos. Incluye 400, 401, 404 y 409.
- Compilación de producción del frontend aprobada.
- Registro realizado por la usuaria. Prueba visual en Chrome: sesión activa, consulta de detalle de venta, cierre de sesión y nuevo login.
- Instalación de JWT_SECRET verificada con clave ausente, vacía, entre comillas y ya existente. Este control usa una conexión simulada para no modificar la base personal.
- Archivo .env fuera de Git; ejemplos sin secretos reales. No se incluyen node_modules.

## Presentación sugerida

1. Mostrar registro y login.
2. Mostrar categorías y productos relacionados.
3. Mostrar siete sucursales e inventario por tienda.
4. Consultar una venta con sus detalles y total.
5. Mostrar receta y compra de ingredientes.
6. Crear, editar y eliminar un registro de demostración con confirmación.
7. Cerrar sesión y comprobar el regreso al login.

Las limitaciones de alcance están documentadas en README. La prueba visual no equivale a guardar manualmente un registro de cada entidad; esas operaciones se verificaron con las pruebas HTTP automatizadas.
