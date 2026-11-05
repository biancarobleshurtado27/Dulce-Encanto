import express from 'express';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.json({ nombre: 'Dulce Encanto API', estado: 'funcionando' });
});

app.get('/api/salud', (_req, res) => {
  res.json({ estado: 'ok', servicio: 'Dulce Encanto API' });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((error, _req, res, _next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo debe contener JSON válido' });
  }
  if (error.status === 413) {
    return res.status(413).json({ error: 'El cuerpo supera el tamaño permitido' });
  }
  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

export default app;

