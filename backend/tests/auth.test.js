import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import {pool} from '../src/config/database.js';
import {tokenOptions} from '../src/config/jwt.js';

test('Registro, login, perfil y protección de contraseñas',async()=>{
 if(process.env.RUN_DB_TESTS!=='1') throw new Error('Usar una base aislada y RUN_DB_TESTS=1');
 process.env.JWT_SECRET=randomBytes(48).toString('hex');
 await pool.query(await readFile(new URL('../../database/002_usuario.sql',import.meta.url),'utf8'));
 const server=app.listen(0,'127.0.0.1');
 await new Promise(resolve=>server.once('listening',resolve));
 const base=`http://127.0.0.1:${server.address().port}/api/auth`;
 const correo=`test-${randomBytes(5).toString('hex')}@example.com`;
 const password='PruebaSegura123!';
 async function call(route,method,body,status,token){
   const res=await fetch(base+route,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:body?JSON.stringify(body):undefined});
   const data=await res.json();assert.equal(res.status,status,JSON.stringify(data));assert.equal(data.password,undefined);assert.equal(data.usuario?.password,undefined);return data;
 }
 try {
   await call('/register','POST',{nombre:'Prueba',correo,password:'corta'},400);
   await call('/register','POST',{nombre:'Prueba',correo:'incorrecto',password},400);
   await call('/register','POST',{nombre:'Prueba',correo,password:'🙂'.repeat(30)},400);
   const user=await call('/register','POST',{nombre:'Prueba',correo,password},201);
   assert.ok(user.id);assert.ok(user.fechaCreacion);
   const [[stored]]=await pool.query('SELECT password FROM usuario WHERE id=?',[user.id]);
   assert.notEqual(stored.password,password);assert.ok(await bcrypt.compare(password,stored.password));
   await call('/register','POST',{nombre:'Prueba',correo:correo.toUpperCase(),password},400);
   await call('/login','POST',{correo,password:'Incorrecta123!'},401);
   const result=await call('/login','POST',{correo,password},200);
   for(const route of ['categorias','productos','sucursales','inventarios','clientes','ventas','detalles-venta','metodos-pago','empleados','proveedores','ingredientes','recetas','detalles-receta','ordenes-compra','detalles-compra','entidades']) {
     for(const [method,path] of [['GET',route],['POST',route],['GET',route+'/1'],['PUT',route+'/1'],['DELETE',route+'/1']]) {
       const response=await fetch(`http://127.0.0.1:${server.address().port}/api/${path}`,{method});
       assert.equal(response.status,401,`${method} ${path} sin token`);
     }
   }
   const payload=jwt.verify(result.token,process.env.JWT_SECRET,{algorithms:['HS256'],issuer:tokenOptions.issuer,audience:tokenOptions.audience});
   assert.equal(payload.exp-payload.iat,1800);
   await call('/me','GET',null,401);
   await call('/me','GET',null,401,'invalido');
   const expired=jwt.sign({},process.env.JWT_SECRET,{...tokenOptions,subject:String(user.id),expiresIn:-1});
   await call('/me','GET',null,401,expired);
   const tooOld=jwt.sign({iat:Math.floor(Date.now()/1000)-1860},process.env.JWT_SECRET,{...tokenOptions,subject:String(user.id),expiresIn:'1h'});
   await call('/me','GET',null,401,tooOld);
   const wrong=jwt.sign({},'otra-clave',{...tokenOptions,subject:String(user.id)});
   await call('/me','GET',null,401,wrong);
   const me=await call('/me','GET',null,200,result.token);assert.equal(me.id,user.id);
   await pool.query('DELETE FROM usuario WHERE id=?',[user.id]);
   await call('/me','GET',null,401,result.token);
 }finally{
   await pool.query('DELETE FROM usuario WHERE correo=?',[correo]);
   await new Promise(resolve=>server.close(resolve));await pool.end();
 }
});
