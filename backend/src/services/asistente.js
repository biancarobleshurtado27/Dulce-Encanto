import {pool} from '../config/database.js';
import {problem} from '../models/entities.js';

// Especialistas de consulta local. No generan SQL ni ejecutan instrucciones del mensaje.
export function selectAgents(message){
 const text=message.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
 const agents=[];
 if(/inventario|existencia|stock|agotad|disponib|sucursal/.test(text))agents.push('inventario');
 if(/\b(ventas?|vendid\w*|ingres\w*)\b/.test(text))agents.push('ventas');
 if(/compra|proveedor/.test(text))agents.push('compras');
 if(/receta|ingrediente|preparacion/.test(text))agents.push('recetas');
 if(/como|ayuda|funciona|registrar|crear|editar|eliminar/.test(text))agents.push('guia');
 if(!agents.length||/busca|encuentra|producto|pastel|galleta/.test(text))agents.push('busqueda');
 return [...new Set(agents)];
}
function searchTerm(message){
 const words=message.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,' ').split(/\s+/).filter(Boolean);
 const ignored=new Set('busca buscar buscame encuentra encontrar quiero necesito tengo donde esta estan hay el la los las un una unos unas de del en por para con que cuanto cuanta cuantos cuantas cual cuales y o a me mi mis producto productos inventario existencia existencias stock disponible disponibles sucursal sucursales receta recetas ingrediente ingredientes dame mostrar muestra consultar consulta porfavor favor'.split(' '));
 return words.filter(w=>!ignored.has(w)).slice(0,8).join(' ').slice(0,100);
}
export async function localAssistant(message,options={}){
 if(typeof message!=='string'||!message.trim()||message.length>1000)throw problem('Escribe una consulta de entre 1 y 1000 caracteres');
 const selected=options.agentes||selectAgents(message);
 if(!Array.isArray(selected)||!selected.length||selected.length>6||selected.some(a=>!['busqueda','inventario','ventas','compras','recetas','guia'].includes(a)))throw problem('Especialista no válido');
 const term=typeof options.termino==='string'?options.termino.slice(0,100):searchTerm(message);
 const like='%'+term.split(/\s+/).map(word=>word.replace(/[\\%_]/g,'\\$&')).join('%')+'%';
 const modules={
  busqueda:async()=>{
   const [rows]=await pool.query('SELECT p.id_producto AS id,p.nombre,p.codigo,p.precio_venta,p.activo,c.nombre AS categoria FROM producto p JOIN categoria c ON c.id_categoria=p.id_categoria WHERE p.nombre LIKE ? OR p.codigo LIKE ? ORDER BY p.nombre LIMIT 10',[like,like]);
   return {agente:'Búsqueda de productos',resumen:term?`Coincidencias para «${term}» (máximo 10).`:'Primeros 10 productos del catálogo.',ruta:'/productos',registros:rows};
  },
  inventario:async()=>{
   const low=/baj|minim|agotad|alerta/.test(message.toLowerCase());
   const filter=low?'WHERE i.cantidad_disponible<=i.stock_minimo':term?'WHERE p.nombre LIKE ? OR s.nombre LIKE ?':'';
   const [rows]=await pool.query(`SELECT i.id_inventario AS id,p.nombre AS producto,s.nombre AS sucursal,i.cantidad_disponible,i.stock_minimo FROM inventario i JOIN producto p ON p.id_producto=i.id_producto JOIN sucursal s ON s.id_sucursal=i.id_sucursal ${filter} ORDER BY i.cantidad_disponible,i.id_inventario LIMIT 10`,!low&&term?[like,like]:[]);
   return {agente:'Inventario',resumen:low?'Hasta 10 registros en el mínimo o por debajo; consulta global sin otros filtros.':term?`Hasta 10 coincidencias de producto o sucursal para «${term}».`:'Hasta 10 registros, ordenados de menor a mayor existencia.',ruta:'/inventarios',registros:rows};
  },
  ventas:async()=>{
   const [[summary]]=await pool.query("SELECT COUNT(*) AS ventas_registradas,COALESCE(SUM(total),0) AS total,COALESCE(AVG(total),0) AS promedio FROM venta WHERE estado='registrada'");
   return {agente:'Ventas',resumen:'Resumen de todo el historial; excluye ventas anuladas. No aplica filtros por fecha ni sucursal.',ruta:'/ventas',registros:[summary]};
  },
  compras:async()=>{
   const [rows]=await pool.query('SELECT o.id_orden_compra AS id,p.nombre AS proveedor,o.fecha_orden,o.estado,o.total FROM orden_compra o JOIN proveedor p ON p.id_proveedor=o.id_proveedor ORDER BY o.id_orden_compra DESC LIMIT 10');
   return {agente:'Compras',resumen:'Las últimas 10 órdenes de compra, sin filtros adicionales.',ruta:'/ordenes-compra',registros:rows};
  },
  recetas:async()=>{
   const [rows]=await pool.query('SELECT r.id_receta AS id,r.nombre,p.nombre AS producto,r.rendimiento_unidades,r.tiempo_preparacion_minutos FROM receta r JOIN producto p ON p.id_producto=r.id_producto ORDER BY r.nombre LIMIT 10');
   return {agente:'Recetas',resumen:'Primeras 10 recetas registradas, sin filtros adicionales.',ruta:'/recetas',registros:rows};
  },
  guia:async()=>({agente:'Guía del sistema',resumen:'Para crear un registro, entra a su sección y pulsa Nuevo registro. Para conservar cambios, pulsa Guardar. Los selectores requieren que los registros relacionados existan. La sesión dura 30 minutos y los registros guardados permanecen en MySQL.',ruta:'/productos',registros:[]})
 };
 const results=await Promise.all(selected.map(agent=>modules[agent]()));
 return {modo:'consulta_local',iaConectada:false,mensaje:'Consulta local completada. La conexión al proveedor de IA está pendiente; estos resultados vienen de consultas predefinidas a MySQL.',resultados:results,fechaConsulta:new Date().toISOString()};
}
