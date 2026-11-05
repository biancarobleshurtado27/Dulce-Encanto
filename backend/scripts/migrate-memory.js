import {readFile} from 'node:fs/promises';
import {pool} from '../src/config/database.js';
try{await pool.query(await readFile(new URL('../../database/003_memoria_asistente.sql',import.meta.url),'utf8'));console.log('Memoria del asistente creada; registros empresariales conservados.');}finally{await pool.end();}
