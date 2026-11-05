import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {pool} from '../src/config/database.js';
import {historyFor,saveTurn,conversationFrom,redact} from '../src/services/memoriaAsistente.js';
import {reportPdf,mailStatus} from '../src/services/notificaciones.js';

test('Memoria persistente aislada por usuario y sin credenciales reconocibles',async()=>{
 if(process.env.RUN_DB_TESTS!=='1')throw new Error('Usar base aislada y RUN_DB_TESTS=1');
 await pool.query(await readFile(new URL('../../database/003_memoria_asistente.sql',import.meta.url),'utf8'));
 const suffix=randomBytes(6).toString('hex');
 const [a]=await pool.query('INSERT INTO usuario (nombre,correo,password) VALUES (?,?,?)',['Memoria A',`mem-a-${suffix}@example.com`,'hash-ficticio']);
 const [b]=await pool.query('INSERT INTO usuario (nombre,correo,password) VALUES (?,?,?)',['Memoria B',`mem-b-${suffix}@example.com`,'hash-ficticio']);
 try{
  await saveTurn(a.insertId,'Consulta test@example.com clave=secreto',{mensaje:'Consulta completada.',resultados:[],fechaConsulta:new Date().toISOString()});
  const history=await historyFor(a.insertId);assert.equal(history.length,1);assert.ok(!history[0].pregunta.includes('test@example.com'));assert.ok(!history[0].pregunta.includes('secreto'));
  assert.equal((await historyFor(b.insertId)).length,0);assert.equal(conversationFrom(history).length,2);
  assert.ok(!redact('sk-'+ 'a'.repeat(32)).includes('a'.repeat(32)));
 }finally{await pool.query('DELETE FROM usuario WHERE id IN (?,?)',[a.insertId,b.insertId]);}
});
test('Informe PDF se genera con motivos y datos; correo no se activa sin configuración',async()=>{
 const pdf=await reportPdf({fecha:new Date().toISOString(),productos:[{id:1,producto:'Pastel ficticio',codigo:'TEST',sucursal:'Tienda de prueba',cantidad_disponible:0,stock_minimo:3}],compras:[{id:1,proveedor:'Proveedor ficticio',fecha_orden:'2026-11-05',fecha_entrega_estimada:null,total:1000}],total:2},'Este es un resumen ficticio para probar el documento, sin llamada a IA ni envío de correo.');
 assert.equal(pdf.subarray(0,4).toString(),'%PDF');assert.ok(pdf.length>1000);
 const env=process.env.SMTP_PASSWORD;delete process.env.SMTP_PASSWORD;assert.equal(mailStatus().correoConfigurado,false);if(env!==undefined)process.env.SMTP_PASSWORD=env;
});
test.after(async()=>pool.end());
