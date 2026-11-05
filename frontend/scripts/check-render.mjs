import {createServer} from 'vite';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import assert from 'node:assert/strict';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try{
 const {AuthProvider}=await server.ssrLoadModule('/src/context/AuthContext.jsx');
 for(const page of ['Login','Registro']){
  const {default:Page}=await server.ssrLoadModule(`/src/pages/${page}.jsx`);
  const html=renderToString(React.createElement(MemoryRouter,null,React.createElement(AuthProvider,null,React.createElement(Page))));
  assert.ok(html.includes('Restaurando sesión'));
  console.log(`${page}: render correcto`);
 }
 const {default:Sales}=await server.ssrLoadModule('/src/components/SalesWorkspace.jsx');
 const html=renderToString(React.createElement(Sales,{rows:[{id_venta:1,id_sucursal:1,id_cliente:null,estado:'registrada',fecha_venta:'2026-11-05 09:00:00',total:17300}],catalogs:{sucursales:[{id_sucursal:1,nombre:'San José'}],productos:[],empleados:[],clientes:[]},onEdit:()=>{},onDelete:()=>{},onSaved:()=>{}}));
 assert.ok(html.includes('Registrar nueva venta'));assert.ok(html.includes('Historial de ventas'));assert.ok(html.includes('17'));assert.ok(html.replace(/<!--.*?-->/g,'').includes('VE-00001'));
 console.log('Ventas: formulario y registro del historial renderizados correctamente.');
 const {default:Summary}=await server.ssrLoadModule('/src/components/SummaryCards.jsx');
 const summary=renderToString(React.createElement(Summary,{route:'productos',rows:[{activo:1},{activo:0}],catalogs:{sucursales:[{activa:1}],recetas:[]}}));
 assert.ok(summary.includes('EN PAUSA'));assert.ok(summary.includes('SUCURSALES ACTIVAS'));
 console.log('Métricas del catálogo: render correcto con datos reales.');
}finally{await server.close();}

