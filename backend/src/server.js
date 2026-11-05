import app from './app.js';
import {startNotifications} from './services/notificaciones.js';

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT debe ser un número entero entre 1 y 65535');
}

const server = app.listen(port, '127.0.0.1', () => {
  console.log(`Dulce Encanto API disponible en http://localhost:${port}`);
  startNotifications();
});
server.on('error', (error) => {
  console.error(`No se pudo iniciar el servidor: ${error.message}`);
  process.exitCode = 1;
});
