# Estados y avisos de Dulce Encanto

Se incorporó un componente común para avisos en formularios, notificaciones, asistente, autenticación y tablas. Los mensajes usan el resultado real de la solicitud, con iconos, texto y un código secundario. El diseño se adapta a móvil, modo claro, modo oscuro y movimiento reducido.

## Códigos contemplados

- 200: consulta solicitada mediante Actualizar lista, cambio guardado, sesión iniciada, informe disponible o envío aceptado por SMTP.
- 201: registro o cuenta creados.
- 204: eliminación confirmada, sin cuerpo de respuesta.
- 400: datos incorrectos o JSON inválido.
- 401: credenciales incorrectas o sesión no válida. Un fallo de login no provoca un cierre de sesión global.
- 403: aviso disponible si el servidor devuelve acceso denegado. El proyecto no agrega roles ni genera este código artificialmente.
- 404: recurso no encontrado; las direcciones desconocidas muestran una página propia y el catálogo sigue en la raíz. La página React es una vista de error: Vite entrega el HTML inicial con 200 por su comportamiento de SPA; los recursos ausentes de la API sí responden 404.
- 409: datos duplicados o dependencias que impiden eliminar.
- 429: límite de solicitudes. En el correo manual, Retry-After indica el tiempo que falta para permitir otro envío.
- 500: fallo interno; no se muestran trazas, claves o datos técnicos en el aviso.
- 502: respuesta inválida del proveedor, incluido JSON no interpretable de DeepSeek.
- 503: servicio necesario no disponible.
- 504: DeepSeek supera el plazo de respuesta del backend.
- 413, 415 y 422: presentaciones previstas para tamaño, formato y reglas empresariales cuando el servidor las devuelva. No se agregan cargas de archivos ni se cambian las validaciones existentes de 400 a 422.

Una respuesta HTTP 200 ordinaria al cargar tablas no genera avisos repetidos. Los avisos flotantes y los avisos dentro de formularios se cierran a los 30 segundos; el contador se pausa al colocar el puntero encima o mover el foco al aviso. El cierre del aviso no borra los datos del formulario. Un nuevo error vuelve a mostrar su aviso durante 30 segundos. Las listas vacías siguen siendo respuestas correctas y no se convierten en 404.

## Red y reintentos

Sin conexión, fallo de contacto con el backend y tiempo de espera del navegador se identifican sin inventar códigos HTTP. Recuperar conexión del dispositivo no garantiza que el backend esté disponible. No se repiten automáticamente escrituras, ventas ni correos. El botón Reintentar consulta solo se ofrece para lecturas; antes de repetir un envío incierto se pide comprobar el resultado. Los formularios permanecen abiertos al fallar el guardado, salvo que la sesión haya vencido.

## Comprobaciones

- Frontend: `npm run build`, `npm run check:render` y `npm run check:status`.
- Backend: pruebas de estados y proveedor; autenticación, 15 CRUD y memoria en una base temporal independiente.
- Navegador: credenciales incorrectas simuladas (401), confirmación 201, cierre de aviso, cambio de conexión y página 404; temas claro/oscuro y vista móvil, sin errores de JavaScript.

Las simulaciones no envían correos ni consumen la API real del proveedor.

## Puertos alternativos

Los puertos predeterminados continúan siendo backend 3001 y frontend 5173. Si están ocupados por otro proyecto, se puede iniciar el backend con `PORT=3003` y `FRONTEND_ORIGIN=http://localhost:5175,http://127.0.0.1:5175`, y Vite con `API_PROXY_TARGET=http://127.0.0.1:3003` y `--port 5175`. Definir estas variables según la sintaxis de la terminal; no es necesario mover el proyecto.

Referencia de semántica HTTP: https://www.rfc-editor.org/rfc/rfc9110.html#name-status-codes
