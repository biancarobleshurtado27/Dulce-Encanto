# Memoria y notificaciones

## Memoria del asistente

Ejecutar desde backend con .env configurado:

```sh
node --env-file=.env scripts/migrate-memory.js
node --env-file=.env scripts/migrate-notifications.js
```

Las migraciones agregan tres tablas auxiliares sin reconstruir las tablas existentes. El historial está asociado a Usuario. Se recuperan las últimas 20 consultas; DeepSeek recibe hasta seis intercambios recientes como contexto. Las consultas anteriores pueden contener cifras antiguas: el asistente debe consultar MySQL otra vez para dar cifras actuales.

Las conversaciones nuevas se conservan después de recargar o volver a iniciar sesión con la misma cuenta. No se recuperan mensajes anteriores a la activación de esta función. Las rutas de memoria requieren JWT y filtran por el usuario autenticado. Se omiten patrones reconocibles de claves, credenciales y datos de contacto en preguntas almacenadas y contexto. Esto no sustituye evitar escribir información sensible en el chat.

## Alertas e informe PDF

Botón Alertas en el encabezado: consultar productos en mínimos y compras pendientes, descargar un PDF generado con DeepSeek y, cuando SMTP esté configurado, enviar el correo al destinatario fijo de la empresa.

Las condiciones son: producto y sucursal activos con cantidad disponible menor o igual al mínimo; y orden de compra con estado pendiente. Pendiente no significa atrasada. No se monitorean ingredientes, porque no se lleva su inventario.

El PDF contiene fecha, motivo, explicación/recomendaciones de DeepSeek y detalle original de MySQL. La dirección de correo no se envía al modelo. La IA no modifica registros. Si DeepSeek falla, el envío se detiene y se registra el fallo; no se presenta un texto alternativo como redactado por IA.

## Configurar correo

Completar únicamente en backend/.env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, ALERT_FROM y ALERT_RECIPIENT. La cuenta emisora y su autenticación están pendientes de confirmar; no se han enviado correos reales. Nunca usar una contraseña personal ordinaria en el código ni subir credenciales al repositorio.

Una vez verificada la cuenta, ALERT_EMAIL_ENABLED=true activa el monitoreo automático. ALERT_DAILY_HOUR=08 configura el resumen a las 8:00 a. m. de Costa Rica; puede cambiarse a otra hora entre 00 y 23. Reiniciar backend tras cambiar .env.

## Tres modalidades

- Inmediato: revisión cada 60 segundos, envío ante un cambio en el conjunto o datos de alertas. No repite el mismo estado continuamente. Cada cambio en el conjunto genera una revisión nueva; si se resuelve y reaparece, es un episodio nuevo.
- Diario: durante la hora configurada, un resumen por fecha si hay alertas. Si la aplicación está apagada durante toda esa hora, el resumen no se ejecuta retrospectivamente.
- Manual: descargar PDF o enviar desde Alertas. Los envíos manuales tienen un minuto de separación como mínimo.

El monitoreo funciona solo mientras el backend esté encendido y conectado. Para servicio continuo se necesita alojarlo en un servidor encendido. El registro guarda preparando, enviando, enviado, fallido o incierto; si SMTP falla durante el envío, no se reintenta automáticamente el mismo evento para evitar duplicados. Revisar entrega y spam antes de reenviar manualmente. La aceptación de SMTP no garantiza que llegue a la bandeja de entrada.

## Verificación

Pruebas en MySQL aislado: memoria persistida, aislamiento de cuentas, omisión de credenciales y PDF válido. Se inspeccionó visualmente un PDF ficticio de ejemplo. El frontend compiló. No se ha probado la entrega SMTP porque faltan los datos de la cuenta emisora.
