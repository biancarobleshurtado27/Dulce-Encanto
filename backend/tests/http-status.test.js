import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {errorHandler} from '../src/middlewares/errorHandler.js';

test('Middleware conserva estados reales y no expone detalles internos',async()=>{
 const app=express();app.use(express.json({limit:'1kb'}));
 app.post('/json',(_req,res)=>res.json({ok:true}));
 app.get('/error/:status',(req,_res,next)=>{const error=new Error('Mensaje controlado');error.status=Number(req.params.status);if(error.status===429)error.retryAfter=23;next(error);});
 app.use(errorHandler);
 const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 try{
  for(const status of [400,401,403,404,409,429,502,503,504]){const r=await fetch(`${base}/error/${status}`);assert.equal(r.status,status);if(status===429)assert.equal(r.headers.get('Retry-After'),'23');assert.equal((await r.json()).error,'Mensaje controlado');}
  const invalid=await fetch(base+'/json',{method:'POST',headers:{'Content-Type':'application/json'},body:'no es JSON'});assert.equal(invalid.status,400);
  const large=await fetch(base+'/json',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({datos:'a'.repeat(2000)})});assert.equal(large.status,413);
  const old=console.error;console.error=()=>{};
  try{const r=await fetch(base+'/error/500');assert.equal(r.status,500);assert.equal((await r.json()).error,'Error interno del servidor');}finally{console.error=old;}
 }finally{await new Promise(resolve=>server.close(resolve));}
});
