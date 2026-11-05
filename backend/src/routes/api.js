import { Router } from 'express';
import { entities, columns } from '../models/entities.js';
import { pool } from '../config/database.js';
import { crud } from '../controllers/crud.js';

export const api = Router();
api.get('/entidades', async (_req,res,next) => {
  try {
    const result = [];
    for (const [ruta,tabla] of Object.entries(entities)) {
      const fields = await columns(pool,tabla);
      result.push({ruta,tabla,campos:fields.map(f => ({nombre:f.Field,tipo:f.Type,opcional:f.Null==='YES',predeterminado:f.Default,clave:f.Key,extra:f.Extra}))});
    }
    res.json(result);
  } catch (error) { next(error); }
});
api.get('/salud/db', async (_req,res,next) => {
  try { await pool.query('SELECT 1'); res.json({estado:'ok',base_de_datos:'conectada'}); }
  catch(error) { next(error); }
});
for (const [route,table] of Object.entries(entities)) {
  const handler = crud(table);
  api.route(`/${route}`).get(handler).post(handler);
  api.route(`/${route}/:id`).get(handler).put(handler).delete(handler);
}
