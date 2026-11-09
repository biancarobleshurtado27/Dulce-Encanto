import {errorHandler} from './middlewares/errorHandler.js';
import express from 'express';
import cors from 'cors';
import { api } from './routes/api.js';
import { authRoutes } from './routes/authRoutes.js';
import { authMiddleware } from './middlewares/authMiddleware.js';

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: (process.env.FRONTEND_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173').split(',') }));
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.json({ nombre: 'Dulce Encanto API', estado: 'funcionando' });
});

app.get('/api/salud', (_req, res) => {
  res.json({ estado: 'ok', servicio: 'Dulce Encanto API' });
});

app.use('/api/auth', authRoutes);
app.use('/api', authMiddleware, api);

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use(errorHandler);

export default app;

