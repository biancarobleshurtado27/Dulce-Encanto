import {createServer} from 'vite';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import assert from 'node:assert/strict';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
const originalFetch=globalThis.fetch,originalWindow=globalThis.window;
try{
 const {api,downloadAlertReport,setToken}=await server.ssrLoadModule('/src/services/api.js');
 const {ApiError,statusDetails,retryDate}=await server.ssrLoadModule('/src/services/status.js');
 const {default:StatusAlert}=await server.ssrLoadModule('/src/components/StatusAlert.jsx');
 const {default:Missing}=await server.ssrLoadModule('/src/pages/NoEncontrado.jsx');
 const events=[];globalThis.window=new EventTarget();window.addEventListener('dulce:status',e=>events.push(e.detail));
 for(const status of [400,401,403,404,409,429,500,502,503,504]){
  globalThis.fetch=async()=>new Response(JSON.stringify({error:'Detalle de prueba'}),{status,headers:{'Retry-After':'15'}});
  await assert.rejects(()=>api('productos'),error=>error.status===status&&error.retryAt>Date.now());
  const html=renderToString(React.createElement(StatusAlert,{error:new ApiError('Detalle de prueba',status),onRetry:()=>{}}));
  assert.ok(html.includes(`Código HTTP ${status}`));assert.ok(html.includes('role="alert"')||html.includes('role="status"'));
 }
 assert.ok(!statusDetails(new ApiError('contraseña interna ficticia',500)).message.includes('contraseña'));
 for(const [method,status] of [['POST',201],['PUT',200],['DELETE',204]]){
  globalThis.fetch=async()=>new Response(status===204?null:JSON.stringify({id:1}),{status});
  await api('productos/1',method,{nombre:'Prueba'});assert.equal(events.at(-1).status,status);
 }
 const before=events.length;globalThis.fetch=async()=>new Response('[]',{status:200});await api('productos');assert.equal(events.length,before);
 let expired=0;window.addEventListener('auth:expired',()=>expired++);
 globalThis.fetch=async()=>new Response('{"error":"Sesión vencida"}',{status:401});setToken('ficticio');await assert.rejects(()=>api('productos'));assert.equal(expired,1);
 await assert.rejects(()=>api('auth/login','POST',{}));assert.equal(expired,1);
 globalThis.fetch=async()=>new Response('<html>Servicio externo</html>',{status:502});await assert.rejects(()=>api('productos'),error=>error.status===502);
 globalThis.fetch=async()=>{throw new TypeError('sin conexión');};await assert.rejects(()=>api('productos'),error=>error.kind==='network');
 globalThis.fetch=async()=>{throw Object.assign(new Error('timeout'),{name:'TimeoutError'});};await assert.rejects(()=>api('productos'),error=>error.kind==='timeout'&&!error.status);
 globalThis.fetch=async()=>new Response('<html>incorrecto</html>',{status:200});await assert.rejects(()=>api('productos'),error=>error.kind==='format'&&!error.status);
 globalThis.fetch=async()=>new Response('{"error":"Espera"}',{status:429});await assert.rejects(()=>downloadAlertReport(),error=>error.status===429);
 assert.equal(retryDate('incorrecto'),undefined);
 const missing=renderToString(React.createElement(MemoryRouter,null,React.createElement(Missing)));assert.ok(missing.includes('404'));assert.ok(missing.includes('Ir al catálogo'));
 console.log('OK: códigos HTTP, error HTML de proxy, expiración de sesión, confirmaciones, red, timeout sin código inventado, PDF y página 404.');
}finally{globalThis.fetch=originalFetch;if(originalWindow===undefined)delete globalThis.window;else globalThis.window=originalWindow;await server.close();}
