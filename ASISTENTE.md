# Asistente: preparación de integración multiagente

Estado: adaptador DeepSeek y coordinador multiagente implementados. Conexión real verificada con una clave aceptada. La usuaria autorizó explícitamente enviar preguntas y datos empresariales necesarios a DeepSeek, excluyendo contraseñas y datos de contacto personales. Se verificaron consultas reales de precio del pastel de chocolate e inventario en mínimos; los campos enviados no incluyen password, correo, teléfono ni identificación. El modo local funciona sin enviar consultas fuera del sistema.

## Arquitectura preparada

- Coordinador: selecciona módulos según palabras clave; no interpreta instrucciones SQL.
- Búsqueda: productos por nombre/código, máximo 10 resultados.
- Inventario: existencias y mínimos por producto o sucursal; alerta global de inventario bajo.
- Ventas: resumen de todo el historial de ventas registradas, sin fechas ni filtros adicionales.
- Compras: últimas 10 órdenes, sin filtros adicionales.
- Recetas: primeras 10 recetas, sin filtros adicionales.
- Guía: explicación predefinida de las operaciones del sistema.

En modo local estos módulos son consultas predefinidas. En modo IA, DeepSeek coordina llamadas de herramientas; cada especialista resume su evidencia mediante una llamada independiente al modelo y el coordinador produce una síntesis final. Se ejecutan hasta tres especialistas concurrentes por consulta. Los datos originales permanecen visibles y cada respuesta indica sus límites. No se utiliza SQL generado por IA.

Las rutas GET /api/asistente/estado y POST /api/asistente/consulta están detrás del middleware JWT. El cuerpo de consulta es {"mensaje":"Buscar pastel de chocolate"}. Las consultas están limitadas a 1000 caracteres. No hay operaciones de escritura, ejecución de código ni SQL generado por IA. Nunca se consulta la tabla Usuario desde el asistente.

## Configuración DeepSeek

Guardar DEEPSEEK_API_KEY en backend/.env y DEEPSEEK_MODEL=deepseek-flash. Reiniciar el backend después de cambiar la clave. La URL es https://api.deepseek.com/chat/completions; autenticación Bearer. La clave nunca se envía al frontend ni se versiona. La configuración de una clave no garantiza que haya sido aceptada: los rechazos 401, saldo insuficiente 402 y límites 429 se muestran como errores de servicio, sin exponer credenciales.

El modo IA envía la pregunta y los resultados de las herramientas seleccionadas a DeepSeek. No se incluyen contraseñas, hashes, la tabla Usuario, correos ni teléfonos de clientes o empleados. Se envían únicamente resultados de productos, sucursales, inventario, recetas, nombres de proveedores y resúmenes de transacciones según la consulta. No hay memoria persistente ni modificación de registros mediante IA. Una consulta por usuario a la vez; máximo tres especialistas, respuestas limitadas y espera por llamada de hasta 35 segundos.

Las pruebas simuladas comprobaron coordinación, selección de herramientas permitidas, síntesis, validaciones y errores del proveedor. Además se verificó el flujo real: coordinador, herramienta de MySQL, especialista y síntesis. Los resultados siguen sujetos al alcance y límite de cada herramienta; el modelo puede equivocarse y se muestran los registros originales para contrastarlo.

Documentación oficial consultada: https://api-docs.deepseek.com/ y https://api-docs.deepseek.com/guides/tool_calls/

