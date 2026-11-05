import {readFile,appendFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {pool} from '../src/config/database.js';
try {
  const sql=await readFile(new URL('../../database/002_usuario.sql',import.meta.url),'utf8');
  await pool.query(sql);
  const envUrl=new URL('../.env',import.meta.url);
  const env=await readFile(envUrl,'utf8');
  if(!/^JWT_SECRET\s*=/m.test(env)) await appendFile(envUrl,`\nJWT_SECRET=${randomBytes(48).toString('hex')}\n`);
  console.log('Tabla Usuario creada y configuración JWT preparada. No se muestran secretos.');
} finally {await pool.end();}
