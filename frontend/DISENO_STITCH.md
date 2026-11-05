# Diseño de Dulce Encanto basado en Stitch

Referencia proporcionada: stitch_dulce_encanto_admin_portal.zip (login, catálogo de productos y ventas).

## Aplicación

- Colores del diseño: fondo #fff8f8, superficies blancas y rosa suave, vino #873d57 y #6a2640, estados positivos verdes.
- Tipografías Playfair Display y Plus Jakarta Sans, iconos Lucide y marca vectorial propia con pastel.
- Login y registro con fotografía original del boceto, mensaje editorial, formulario y control para mostrar u ocultar la contraseña.
- Catálogo con métricas calculadas desde la API, fotografía en los dos productos de demostración, filtros reales de categoría/estado, búsqueda, paginación y exportación CSV.
- Ficha de producto en panel lateral; el resto de entidades mantiene sus formularios de gestión con la misma identidad.
- Ventas con formulario y líneas de producto junto al historial. Seleccionar un producto completa su precio; los subtotales y el total se actualizan en pantalla y el backend calcula el total persistido al guardar.
- Diseño adaptable para pantallas pequeñas.

Las fotografías de public/assets se descargaron de las URL contenidas en el HTML de referencia de Stitch. No se muestra el logo roto de ese HTML. Las fotos del catálogo se asocian exclusivamente a los códigos de demostración; los demás productos utilizan un icono.

Los avisos de credenciales incorrectas y sesión vencida se muestran solo cuando sucede ese estado. No se incluyen indicadores ficticios de SSL, soporte telefónico, Hacienda, facturación electrónica, impuestos, pagos mixtos, escáner ni recuperación de contraseña, pues no forman parte del sistema implementado.

## Verificación de esta modificación

Compilación de producción aprobada. scripts/check-render.mjs verifica el renderizado de login, registro, formulario e historial de ventas y métricas del catálogo. Página y fotos responden HTTP 200. Se reinició Vite con caché nueva y deduplicación de React tras agregar los iconos.

La automatización del navegador se detuvo al no poder determinar de forma fiable la URL en Windows. La revisión visual final de escritorio y móvil y el guardado desde el nuevo formulario de ventas siguen pendientes; las pruebas de renderizado no sustituyen esa revisión. Las pruebas funcionales previas del backend siguen documentadas por separado.
