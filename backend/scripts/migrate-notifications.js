import {readFile} from 'node:fs/promises';
import {pool} from '../src/config/database.js';
try{const sql=await readFile(new URL('../../database/004_notificaciones.sql',import.meta.url),'utf8');for(const statement of sql.split(';').map(s=>s.trim()).filter(Boolean))await pool.query(statement);console.log('Tablas de notificaciones creadas.');}finally{await pool.end();}
