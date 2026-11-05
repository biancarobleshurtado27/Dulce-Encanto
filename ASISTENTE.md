# Asistente: preparación de integración multiagente

Estado: asistente local implementado; conexión al modelo de IA pendiente de la API que proporcionará la usuaria. No se envían datos a proveedores externos y no hay claves del asistente en el frontend.

## Arquitectura preparada

- Coordinador: selecciona módulos según palabras clave; no interpreta instrucciones SQL.
- Búsqueda: productos por nombre/código, máximo 10 resultados.
- Inventario: existencias y mínimos por producto o sucursal; alerta global de inventario bajo.
- Ventas: resumen de todo el historial de ventas registradas, sin fechas ni filtros adicionales.
- Compras: últimas 10 órdenes, sin filtros adicionales.
- Recetas: primeras 10 recetas, sin filtros adicionales.
- Guía: explicación predefinida de las operaciones del sistema.

Estos módulos son consultas predefinidas, no agentes LLM autónomos. La interfaz informa esta limitación. El coordinador puede ejecutar varios módulos de consulta de forma concurrente. Los resultados se obtienen de MySQL y permiten abrir la sección correspondiente.

Las rutas GET /api/asistente/estado y POST /api/asistente/consulta están detrás del middleware JWT. El cuerpo de consulta es {"mensaje":"Buscar pastel de chocolate"}. Las consultas están limitadas a 1000 caracteres. No hay operaciones de escritura, ejecución de código ni SQL generado por IA. Nunca se consulta la tabla Usuario desde el asistente.

## Para completar la conexión

Hace falta el nombre del proveedor, la documentación de su API, el modelo y el formato de autenticación. La clave se configurará únicamente en backend/.env cuando se confirme ese formato. No pegar claves en el chat ni en archivos del frontend. Después se implementará el adaptador del proveedor y se probará la interpretación de preguntas, selección de herramientas, respuestas basadas en resultados y tratamiento de errores y límites.

No se ha implementado envío externo, memoria de conversaciones persistente ni modificación de registros mediante IA.
