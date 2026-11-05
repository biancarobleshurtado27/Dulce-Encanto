import {readFile,writeFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {pool} from '../src/config/database.js';
try {
  const sql=await readFile(new URL('../../database/002_usuario.sql',import.meta.url),'utf8');
  await pool.query(sql);
  const envUrl=new URL('../.env',import.meta.url);
  const env=await readFile(envUrl,'utf8');
  const match=env.match(/^JWT_SECRET[^\S\r\n]*=[^\S\r\n]*([^\r\n]*)/m);
  if(!match || !match[1].trim() || ['""',"''"].includes(match[1].trim())) {
    const entry=`JWT_SECRET=${randomBytes(48).toString('hex')}`;
    await writeFile(envUrl,match?env.replace(/^JWT_SECRET[^\r\n]*/m,entry):env+`\n${entry}\n`);
  }
  console.log('Tabla Usuario creada y configuración JWT preparada. No se muestran secretos.');
} finally {await pool.end();}
