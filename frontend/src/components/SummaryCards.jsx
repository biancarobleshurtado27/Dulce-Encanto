import React from 'react';
import {CakeSlice,BookOpen,Store,Archive,ReceiptText,Wallet,ShoppingBag,Users} from 'lucide-react';
const money=n=>new Intl.NumberFormat('es-CR',{style:'currency',currency:'CRC',maximumFractionDigits:0}).format(n);
export default function SummaryCards({route,rows,catalogs}){
 let cards;
 if(route==='productos')cards=[['ACTIVOS EN CATÁLOGO',rows.filter(r=>r.activo).length,'Productos disponibles',CakeSlice],['CON RECETA REGISTRADA',new Set((catalogs.recetas||[]).map(r=>r.id_producto)).size,'Preparaciones de nuestra cocina',BookOpen],['EN PAUSA',rows.filter(r=>!r.activo).length,'Productos fuera de catálogo',Archive],['SUCURSALES ACTIVAS',(catalogs.sucursales||[]).filter(r=>r.activa).length,'Presencia en Costa Rica',Store]];
 else if(route==='ventas'){const valid=rows.filter(r=>r.estado==='registrada');const sum=valid.reduce((s,r)=>s+Number(r.total),0);cards=[['VENTAS REGISTRADAS',valid.length,'En el historial de ventas',ReceiptText],['TOTAL REGISTRADO',money(sum),'Excluye ventas anuladas',Wallet],['VENTA PROMEDIO',money(valid.length?sum/valid.length:0),'Sobre ventas registradas',ShoppingBag],['CLIENTES',(catalogs.clientes||[]).length,'Personas y empresas',Users]];}
 else cards=[['REGISTROS TOTALES',rows.length,'Información de esta sección',Archive],['PRODUCTOS',(catalogs.productos||[]).length,'Nuestro catálogo artesanal',CakeSlice],['SUCURSALES',(catalogs.sucursales||[]).length,'Tiendas en Costa Rica',Store],['CLIENTES',(catalogs.clientes||[]).length,'Momentos para compartir',Users]];
 return <div className="metric-grid">{cards.map(([title,value,note,Icon])=><article className="metric" key={title}><div><span>{title}</span><Icon size={19}/></div><strong>{value}</strong><small>{note}</small></article>)}</div>;
}
