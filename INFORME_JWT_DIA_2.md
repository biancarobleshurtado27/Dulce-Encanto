# Aplicación de tokens en Dulce Encanto

Informe de investigación previo a la implementación de autenticación. Fecha: 5 de noviembre de 2026.

## 1. Qué es un JWT

Un JSON Web Token representa afirmaciones sobre una identidad. En su forma firmada compacta tiene tres segmentos separados por puntos: header.payload.firma. El encabezado identifica el algoritmo; el payload contiene datos y condiciones del token; la firma permite comprobar su integridad con la clave correspondiente. Codificar con Base64URL no equivale a cifrar: el contenido puede leerse. La verificación comprueba la firma y condiciones como la expiración. [1]

Se usarán sub (identificador del usuario), iat (emisión), exp (expiración), iss (emisor) y aud (destinatario). No se incluirán contraseñas, hashes ni información personal innecesaria. Un token firmado válido no sustituye comprobar si la cuenta todavía existe. [1]

## 2. Generación y verificación en Express

La biblioteca jsonwebtoken permite emitir un token con sign y comprobarlo con verify. Se definirá HS256 y una duración de una hora. El middleware verificará explícitamente algoritmo, emisor, destinatario y expiración. decode solo interpreta el contenido y no autentica al remitente; no debe usarse para conceder acceso. Los errores de firma o vencimiento se traducirán a 401. [2]

## 3. Expiración y renovación

Un access token tiene duración limitada. Un refresh token permite obtener nuevos access tokens mediante un flujo separado, sin volver a escribir la contraseña; también requiere almacenamiento, revocación y protección adecuados. Para este proyecto se decide no implementar refresh tokens: al vencer la hora, React borrará la sesión y solicitará iniciar sesión de nuevo. Esta decisión cumple el alcance académico y evita añadir un mecanismo de renovación que el documento no exige implementar. [6]

Cerrar sesión borrará el token del navegador. Esto no revoca por sí solo una copia robada de un JWT: esta podría funcionar hasta su expiración. La revocación inmediata requeriría un mecanismo adicional del servidor.

## 4. Comparación de almacenamiento en React

| Opción | Persistencia | Riesgo principal |
|---|---|---|
| localStorage | Persiste al cerrar el navegador | JavaScript puede leer el token; una vulnerabilidad XSS puede extraerlo. |
| sessionStorage | Asociado a la sesión de la pestaña | También es accesible desde JavaScript y vulnerable a extracción mediante XSS. |
| Memoria de React | Se pierde al recargar | Reduce persistencia, pero XSS ejecutándose en la página aún puede realizar acciones. |
| Cookie HttpOnly | Según configuración de la cookie | Impide leerla directamente con JavaScript; requiere considerar CSRF porque el navegador la envía automáticamente. |

OWASP desaconseja guardar identificadores de sesión en localStorage y advierte que sessionStorage tampoco es una frontera de seguridad frente a XSS. [3] HttpOnly, Secure y SameSite aportan controles distintos: acceso desde scripts, transporte HTTPS y envío entre sitios. No deben confundirse ni tratarse como una protección completa contra todos los ataques. [5]

Decisión del proyecto: token exclusivamente en memoria mediante AuthContext, enviado en Authorization: Bearer. Al recargar se solicita ingresar otra vez. El requisito permite guardar el token en contexto de React. No se persistirá en Web Storage. Una aplicación expuesta a Internet debe valorar cookies HttpOnly con defensas CSRF, según su arquitectura.

## 5. Flujo concreto de Dulce Encanto

1. POST /api/auth/register valida nombre, correo único y contraseña; guarda un hash y devuelve el usuario sin password.
2. POST /api/auth/login verifica credenciales y devuelve { token, usuario }.
3. AuthContext mantiene token y usuario; la función común de fetch añade Authorization: Bearer a las solicitudes protegidas.
4. El middleware rechaza solicitudes sin token o con token inválido con 401 y {"error":"No autorizado"}.
5. GET /api/auth/me devuelve el perfil actual sin contraseña.
6. Las vistas de gestión solo se muestran con sesión; ante un 401 o al cerrar sesión se limpia el contexto y se vuelve a /login.

Registro y login son públicos. Las rutas empresariales y de metadatos quedan protegidas. No se incorporan roles ni permisos diferenciados.

## 6. Contraseñas y clave secreta

Se utilizará bcrypt con factor de trabajo 12. Bcrypt almacena un hash con sal; no cifra la contraseña de forma reversible. Se exigirá un mínimo de ocho caracteres y se rechazará una entrada que supere 72 bytes UTF-8 para evitar truncamiento. OWASP considera Argon2id preferible para nuevos sistemas y documenta el uso de bcrypt con factor de al menos 10 y su límite de entrada. [4]

JWT_SECRET será aleatorio, permanecerá en backend/.env y nunca se enviará a React ni se subirá a GitHub. El ejemplo de configuración no contendrá secretos reales. HTTPS es necesario fuera del desarrollo local para proteger credenciales y tokens durante el transporte. También se usarán consultas parametrizadas, respuestas sin contraseñas y mensajes de login que no revelen si el correo existe.

## 7. Fuentes consultadas

1. IETF, RFC 7519: https://www.rfc-editor.org/rfc/rfc7519
2. Auth0, documentación oficial de node-jsonwebtoken: https://github.com/auth0/node-jsonwebtoken
3. OWASP, HTML5 Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html
4. OWASP, Password Storage Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
5. MDN, Using HTTP cookies: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies
6. Auth0, Refresh Tokens: https://auth0.com/docs/secure/tokens/refresh-tokens
