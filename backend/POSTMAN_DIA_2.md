# Colección de Postman del día 2

Importar Dulce-Encanto.postman_collection.json. Contiene 90 solicitudes con 239 comprobaciones. Ejecutar con Collection Runner en el orden de las carpetas; no seleccionar orden aleatorio.

## Antes de ejecutar

Usar una base de pruebas con las 16 tablas y un backend conectado a ella. Cambiar baseUrl a ese backend. La verificación realizada usó http://127.0.0.1:3002 con MySQL aislado en 3307, separado de los datos de la aplicación personal. El archivo distribuido tiene baseUrl=http://localhost:3001 para facilitar cambiarlo al importar; no ejecutar la colección sobre datos importantes.

## Flujo

1. Registro: genera un correo único ficticio para cada ejecución. La contraseña es únicamente de prueba. Prueba duplicado y credenciales incorrectas.
2. Login: guarda automáticamente el JWT en la variable token de la colección.
3. Perfil: verifica acceso con token y rechazo sin token.
4. Crea, lista, consulta y actualiza las 15 entidades. Los IDs creados se guardan en variables y se utilizan en sus relaciones.
5. Verifica 400 (datos y relación inexistente), 401 (sin token), 404 (ID inexistente) y 409 (dependencias).
6. Elimina en orden inverso los registros empresariales que creó. No elimina otros registros.

La cuenta ficticia de registro permanece en la base de pruebas porque no se requiere un endpoint de eliminación de usuarios. Si una ejecución se interrumpe, pueden quedar registros de prueba. No se incluyen tokens reales ni credenciales personales en el archivo.

## Resultado verificado

90 solicitudes completadas, 239 comprobaciones aprobadas, cero fallos. Ejecución con Newman sobre el backend real y MySQL aislado. Registro, login, perfil y las cinco operaciones de las 15 entidades están incluidos.
