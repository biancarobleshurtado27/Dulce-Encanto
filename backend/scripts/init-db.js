import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';

const name = process.env.DB_NAME || 'dulce_encanto';
if (name !== 'dulce_encanto') throw new Error('El esquema de este proyecto utiliza DB_NAME=dulce_encanto');
const db = await mysql.createConnection({host:process.env.DB_HOST || '127.0.0.1',port:Number(process.env.DB_PORT || 3306),user:process.env.DB_USER || 'root',password:process.env.DB_PASSWORD || ''});
try {
  const [existing] = await db.query('SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?', [name]);
  if (existing.length) throw new Error('La base ya contiene tablas. No se modifica automáticamente para conservar tus datos.');
  const sql = await readFile(new URL('../../database/dulce_encanto.sql',import.meta.url),'utf8');
  for (const statement of sql.split(';').map(s=>s.trim()).filter(s=>s && !s.startsWith('--'))) await db.query(statement);
  const [tables] = await db.query('SHOW TABLES');
  if (tables.length !== 15) throw new Error('No se encontraron las 15 tablas esperadas');
  console.log('Base creada y verificada: 15 tablas.');
} finally { await db.end(); }
