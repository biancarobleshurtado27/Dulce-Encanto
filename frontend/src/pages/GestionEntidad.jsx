import StatusAlert from '../components/StatusAlert';
import {normalizeSearch,sortRecords,matchesStock,csvCell} from '../utils/table';
import NotificationsPanel from '../components/NotificationsPanel';
import ThemeToggle from '../components/ThemeToggle';
import Brand from '../components/Brand';
import EntityIcon from '../components/EntityIcon';
import SummaryCards from '../components/SummaryCards';
import SalesWorkspace from '../components/SalesWorkspace';
import {Pencil,Trash2,LogOut,MapPin,Plus,Download,RefreshCw,Search,X,Filter,ArrowUp,ArrowUpDown,ArrowDown} from 'lucide-react';
import React, {useEffect,useState,useRef,useLayoutEffect} from 'react';

import {api} from '../services/api';
import {notifyStatus} from '../services/status';
import {servicios} from '../services/entidades';

import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';




const names={'categorias':'Categorías','productos':'Productos','sucursales':'Sucursales','inventarios':'Inventario','clientes':'Clientes','ventas':'Ventas','detalles-venta':'Detalles de venta','metodos-pago':'Métodos de pago','empleados':'Empleados','proveedores':'Proveedores','ingredientes':'Ingredientes','recetas':'Recetas','detalles-receta':'Ingredientes de recetas','ordenes-compra':'Órdenes de compra','detalles-compra':'Detalles de compra'};
const groups=[['Catálogo y tiendas',['productos','categorias','sucursales','inventarios']],['Ventas y personas',['ventas','clientes','empleados','metodos-pago','detalles-venta']],['Producción y compras',['recetas','ingredientes','proveedores','ordenes-compra','detalles-receta','detalles-compra']]];
const links={id_categoria:'categorias',id_producto:'productos',id_sucursal:'sucursales',id_cliente:'clientes',id_empleado:'empleados',id_metodo_pago:'metodos-pago',id_proveedor:'proveedores',id_ingrediente:'ingredientes',id_venta:'ventas',id_receta:'recetas',id_orden_compra:'ordenes-compra'};
const nested={ventas:['detalles-venta','id_venta'],recetas:['detalles-receta','id_receta'],'ordenes-compra':['detalles-compra','id_orden_compra']};
const choices={tipo_cliente:['persona','empresa'],unidad_medida:['kg','L','unidad'],provincia:['San José','Alajuela','Cartago','Heredia','Guanacaste','Puntarenas','Limón']};
const label=key=>({id_metodo_pago:'Método de pago',vida_util_dias:'Vida útil (días)',tiempo_preparacion_minutos:'Preparación (minutos)',rendimiento_unidades:'Rendimiento (unidades)',identificacion:'Identificación',descripcion:'Descripción',direccion:'Dirección',telefono:'Teléfono',codigo:'Código',cantidad_disponible:'Unidades disponibles',stock_minimo:'Existencias mínimas',fecha_contratacion:'Fecha de contratación',fecha_actualizacion:'Última actualización',fecha_orden:'Fecha de orden',fecha_entrega_estimada:'Entrega estimada',precio_venta:'Precio de venta',costo_unitario:'Costo unitario',precio_unitario:'Precio unitario',unidad_medida:'Unidad de medida'}[key] || key.replace(/^id_/,'').replaceAll('_',' ').replace(/^./,c=>c.toUpperCase()));
const editable=field=>!field.extra.includes('auto_increment')&&!/(VIRTUAL|STORED) GENERATED/.test(field.extra)&&!['total','fecha_actualizacion'].includes(field.nombre);
const primary=meta=>meta.campos.find(f=>f.clave==='PRI').nombre;
const display=row=>row.nombre || row.nombres && `${row.nombres} ${row.apellidos}` || row.codigo || `Registro ${Object.values(row)[0]}`;
const money=value=>new Intl.NumberFormat('es-CR',{style:'currency',currency:'CRC'}).format(value);
// Memoria compartida entre las páginas: no contiene información de la sesión.
let sidebarScrollTop=0;

export default function GestionEntidad({entidad}){
 const sidebarRef=useRef(null);
 useLayoutEffect(()=>{
   const sidebar=sidebarRef.current;
   if(sidebar) sidebar.scrollTop=sidebarScrollTop;
   return ()=>{if(sidebar) sidebarScrollTop=sidebar.scrollTop;};
 },[]);
 const navigate=useNavigate();
 const route=entidad;
 const setRoute=value=>navigate('/'+value);
 const servicio=servicios[route];
 const {usuario,logout}=useAuth();
 const [metas,setMetas]=useState([]),[rows,setRows]=useState([]),[catalogs,setCatalogs]=useState({}),[loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState(''),[search,setSearch]=useState(''),[form,setForm]=useState(null),[saving,setSaving]=useState(false),[deleting,setDeleting]=useState(null),[menu,setMenu]=useState(false);
 const [category,setCategory]=useState(''),[status,setStatus]=useState(''),[page,setPage]=useState(1),[pageSize,setPageSize]=useState(10);
 const [showTop,setShowTop]=useState(false);
 const [sort,setSort]=useState({key:'',direction:'asc'}),[stockFilter,setStockFilter]=useState(''),[updatedAt,setUpdatedAt]=useState(null);
 const toggleSort=key=>setSort(previous=>({key,direction:previous.key===key&&previous.direction==='asc'?'desc':'asc'}));
 const modalOpen=Boolean(form||deleting);
 useEffect(()=>{
   if(!modalOpen)return;
   const opener=document.activeElement;
   const dialog=document.querySelector('.dialog[role="dialog"],.dialog[role="alertdialog"]');
   if(!dialog)return;
   const selector='button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]';
   (dialog.querySelector('input,select,textarea')||dialog.querySelector('button'))?.focus();
   const trap=event=>{
     if(event.key!=='Tab')return;
     const items=[...dialog.querySelectorAll(selector)].filter(item=>item.getClientRects().length);
     const first=items[0],last=items.at(-1);
     if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
     else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
   };
   dialog.addEventListener('keydown',trap);
   return()=>{dialog.removeEventListener('keydown',trap);if(opener?.isConnected)opener.focus();};
 },[modalOpen]);
 useEffect(()=>{
   const onScroll=()=>setShowTop(window.scrollY>350);
   window.addEventListener('scroll',onScroll,{passive:true});
   onScroll();
   return()=>window.removeEventListener('scroll',onScroll);
 },[]);
 useEffect(()=>{
   if(!notice)return;
   const timer=setTimeout(()=>setNotice(''),6000);
   return()=>clearTimeout(timer);
 },[notice]);
 useEffect(()=>{
   const onKey=event=>{
     if(event.key==='Escape'&&!saving){setForm(null);setDeleting(null);setMenu(false);}
     if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'&&!form&&!deleting){
       const search=document.querySelector('[aria-label="Buscar registros"], [aria-label="Buscar venta"]');
       if(search){event.preventDefault();search.focus();}
     }
   };
   document.addEventListener('keydown',onKey);
   return()=>document.removeEventListener('keydown',onKey);
 },[saving,form,deleting]);
 useEffect(()=>{
   if(!form&&!deleting&&!menu)return;
   const previous=document.body.style.overflow;
   document.body.style.overflow='hidden';
   return()=>{document.body.style.overflow=previous;};
 },[form,deleting,menu]);
 useEffect(()=>setPage(1),[search,category,status,pageSize,stockFilter,sort]);
 const meta=metas.find(m=>m.ruta===route);
 async function refresh(showNotice=false){
   setLoading(true);setError('');
   try {if(!metas.length){setMetas(await api('entidades'));return;}const [data,all]=await Promise.all([servicio.listar(),Promise.all(metas.map(async m=>[m.ruta,await servicios[m.ruta].listar()]))]);setRows(data);setCatalogs(Object.fromEntries(all));setUpdatedAt(new Date());if(showNotice)notifyStatus(200,'La lista se actualizó con la información de MySQL.');}
   catch(e){setError(e);}finally{setLoading(false);}
 }
 useEffect(()=>{api('entidades').then(setMetas).catch(e=>{setError(e);setLoading(false);});},[]);
 useEffect(()=>{if(metas.length){setRows([]);setForm(null);setDeleting(null);setSearch('');setNotice('');refresh();}},[route,metas]);
 const fkText=(key,value)=>{const target=metas.find(m=>m.ruta===links[key]);const record=target&&catalogs[target.ruta]?.find(r=>r[primary(target)]===value);return record?`${display(record)} · #${value}`:value;};
 function initial(m,row={}) {return Object.fromEntries(m.campos.filter(editable).map(f=>[f.nombre,row[f.nombre]??(f.tipo==='tinyint(1)'?(f.predeterminado==='1'):f.predeterminado && !String(f.predeterminado).includes('CURRENT_TIMESTAMP')?f.predeterminado:'')]));}
 async function open(row){setError('');try{let data=row?await servicio.consultar(row[primary(meta)]):{};setForm({id:row?.[primary(meta)],values:initial(meta,data),details:nested[route]?(data.detalles || [{}]).map(d=>initial(metas.find(m=>m.ruta===nested[route][0]),d)):[]});}catch(e){setError(e);}}
 function serialize(m,values,omit){const result={};for(const f of m.campos.filter(editable)){if(f.nombre===omit)continue;let value=values[f.nombre];if(value===''||value===undefined){if(f.opcional)result[f.nombre]=null;continue;}if(/^(int|decimal|tinyint)/.test(f.tipo))value=Number(value);result[f.nombre]=value;}return result;}
 async function save(event){event.preventDefault();setSaving(true);setError('');try{const body=serialize(meta,form.values);if(nested[route]){const [child,fk]=nested[route];body.detalles=form.details.map(d=>serialize(metas.find(m=>m.ruta===child),d,fk));}await (form.id?servicio.actualizar(form.id,body):servicio.crear(body));setForm(null);setNotice('Registro guardado correctamente.');await refresh();}catch(e){setError(e);}finally{setSaving(false);}}
 async function remove(){setSaving(true);setError('');try{await servicio.eliminar(deleting[primary(meta)]);setDeleting(null);setNotice('Registro eliminado.');await refresh();}catch(e){setError(e);setDeleting(null);}finally{setSaving(false);}}
 function field(f,values,change,child=false){const key=f.nombre;let opts=choices[key] || (key==='estado'?(route==='ventas'?['registrada','anulada']:['pendiente','recibida','cancelada']):null);const ref=metas.find(m=>m.ruta===links[key]);const required=!f.opcional&&f.predeterminado===null;
  const common={id:`${child?'detalle-':''}${key}`,value:values[key]??'',onChange:e=>change(key,e.target.value),required};
  return <label className={f.tipo==='text'?'wide':''} key={key}><span>{label(key)}{required&&' *'}</span>{f.tipo==='tinyint(1)'?<select {...common} value={Number(values[key]||0)}><option value="1">Sí</option><option value="0">No</option></select>:ref?<select {...common}><option value="">{f.opcional?'Sin asignar':'Selecciona una opción'}</option>{(catalogs[ref.ruta]||[]).map(r=><option key={r[primary(ref)]} value={r[primary(ref)]}>{display(r)} · #{r[primary(ref)]}</option>)}</select>:opts?<select {...common}><option value="">Selecciona una opción</option>{opts.map(o=><option key={o}>{o}</option>)}</select>:f.tipo==='text'?<textarea {...common} rows="3"/>:<input {...common} type={/^(int|decimal)/.test(f.tipo)?'number':f.tipo==='date'?'date':key==='correo'?'email':'text'} step={f.tipo.startsWith('decimal')?f.tipo.includes(',3)')?'0.001':'0.01':'1'} min={/^(int|decimal)/.test(f.tipo)?(['cantidad','vida_util_dias','rendimiento_unidades','tiempo_preparacion_minutos'].includes(key)?f.tipo.startsWith('decimal')?'0.001':'1':'0'):undefined} maxLength={Number(f.tipo.match(/varchar\((\d+)\)/)?.[1])||undefined} placeholder={f.tipo==='datetime'?'AAAA-MM-DD HH:mm:ss':undefined}/>}</label>;
 }
 const matching=rows.filter(r=>(!category||String(r.id_categoria)===category)&&(!status||String(Number(r.activo))===status)&&(route!=='inventarios'||matchesStock(r,stockFilter))).filter(r=>Object.entries(r).some(([k,v])=>normalizeSearch(fkText(k,v)).includes(normalizeSearch(search))));
 const filtered=sortRecords(matching,meta?.campos.find(f=>f.nombre===sort.key),sort.direction,fkText);
 const totalPages=Math.max(1,Math.ceil(filtered.length/pageSize));
 const currentPage=Math.min(page,totalPages);
 const pageRows=filtered.slice((currentPage-1)*pageSize,currentPage*pageSize);
 useEffect(()=>{setPage(previous=>Math.min(previous,totalPages));},[totalPages]);
 function exportCsv(){const cols=meta.campos.map(f=>f.nombre);const csv='\uFEFF'+[cols,...filtered.map(r=>cols.map(k=>r[k]))].map(row=>row.map(csvCell).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=route+'.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

 return <div className={'shell route-'+route}>{menu&&<button className="mobile-menu-backdrop" aria-label="Cerrar menú" onClick={()=>setMenu(false)}/>} <aside ref={sidebarRef} onScroll={event=>{sidebarScrollTop=event.currentTarget.scrollTop;}} className={menu?'sidebar open':'sidebar'}><a className="brand" href="#" onClick={e=>e.preventDefault()}><Brand/></a><div className="side-caption">ESPACIO DE GESTIÓN</div>{groups.map(([title,routes])=><section key={title}><h2>{title}</h2>{routes.map(r=><button key={r} onClick={()=>{setRoute(r);setMenu(false);}} className={r===route?'nav active':'nav'}><EntityIcon entity={r}/>{names[r]}</button>)}</section>)}<div className="side-foot"><span><i/> Sistema Dulce Encanto</span><small>₡ CRC · Costa Rica</small></div></aside><main><header className="topbar"><button className="menu" onClick={()=>setMenu(!menu)} aria-label="Abrir navegación" aria-expanded={menu}>☰</button><span className="location-tag"><MapPin size={16}/> Dulce Encanto <b>·</b> Costa Rica</span><div className="session-tools"><NotificationsPanel/><ThemeToggle/><span className="user-avatar">{usuario.nombre.charAt(0)}</span><span className="user-name">{usuario.nombre}</span><button className="secondary" onClick={()=>logout()}><LogOut size={15}/> Cerrar sesión</button></div></header><div className="content"><div className="eyebrow"><EntityIcon entity={route} size={14}/> {route==='ventas'?'MÓDULO DE VENTAS · COSTA RICA':'CATÁLOGO & REPOSTERÍA CENTRAL'}</div><div className="page-title"><div><h1>{route==='productos'?'Catálogo de Productos':route==='ventas'?'Registro y Control de Ventas':names[route]}</h1><p>{route==='productos'?'Administra nuestros postres, pasteles y repostería artesanal en las sucursales de Costa Rica.':route==='ventas'?'Atención de mostrador y ventas para nuestras tiendas en las 7 provincias.':'Cada detalle en su lugar, para seguir creando momentos dulces.'}</p></div><div className="page-actions"><button className="secondary" disabled={!meta||loading} onClick={()=>refresh(true)}><RefreshCw size={15}/> Actualizar lista</button><button className="secondary" disabled={!meta||loading} onClick={exportCsv}><Download size={15}/> Exportar</button><button className="primary" disabled={!meta||loading} onClick={()=>open()}><Plus size={17}/> {route==='productos'?'Nuevo producto':'Nuevo registro'}</button></div></div><div className="data-freshness" role="status">{loading?'Actualizando datos de MySQL...':updatedAt?`Datos consultados a las ${updatedAt.toLocaleTimeString('es-CR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}`:'Esperando datos'}</div><SummaryCards route={route} rows={rows} catalogs={catalogs}/>{error&&!form&&<StatusAlert error={error} onClose={()=>setError('')} onRetry={!form&&error?.method==='GET'?()=>refresh():undefined}/>}{route==='ventas'&&!loading?<SalesWorkspace rows={rows} catalogs={catalogs} onEdit={open} onDelete={setDeleting} onSaved={async()=>{setNotice('Venta guardada correctamente.');await refresh();}}/>:(<section className="panel"><div className="toolbar"><div><h2>Listado de {names[route]?.toLowerCase()}</h2><span>{filtered.length} registros encontrados</span></div><div className="tools"><Search size={17}/><input type="search" aria-label="Buscar registros" placeholder="Buscar… (Ctrl + K)" value={search} onChange={e=>setSearch(e.target.value)}/>{route==='inventarios'&&<select aria-label="Filtrar por existencias" value={stockFilter} onChange={e=>setStockFilter(e.target.value)}><option value="">Todas las existencias</option><option value="bajo">En el mínimo o por debajo</option><option value="agotado">Agotados</option><option value="disponible">Por encima del mínimo</option></select>}{route==='productos'&&<><select aria-label="Filtrar por categoría" value={category} onChange={e=>setCategory(e.target.value)}><option value="">Todas las categorías</option>{(catalogs.categorias||[]).map(c=><option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}</select><select aria-label="Filtrar por estado" value={status} onChange={e=>setStatus(e.target.value)}><option value="">Todos los estados</option><option value="1">Activo</option><option value="0">En pausa</option></select><button className="icon-button" aria-label="Limpiar filtros" onClick={()=>{setCategory('');setStatus('');setSearch('');}}><Filter size={17}/></button></>}</div></div>{loading?<div className="loading-state" role="status" aria-live="polite"><span>Cargando información…</span><i aria-hidden="true"/><i aria-hidden="true"/><i aria-hidden="true"/></div>:!filtered.length?<div className="empty"><span>✿</span><h3>{search||category||status||stockFilter?'No encontramos coincidencias':'Aquí comienza algo dulce'}</h3><p>{search||category||status||stockFilter?'Prueba con otro nombre o ajusta los filtros.':'Agrega el primer registro para organizar esta sección.'}</p>{(search||category||status||stockFilter)?<button className="secondary" onClick={()=>{setSearch('');setCategory('');setStatus('');setStockFilter('');}}>Limpiar filtros</button>:<button className="secondary" onClick={()=>open()} disabled={!meta}>Crear primer registro</button>}</div>:<div className="table-wrap"><table><thead><tr>{meta.campos.map(f=><th key={f.nombre} aria-sort={sort.key===f.nombre?(sort.direction==='asc'?'ascending':'descending'):'none'}><button className="column-sort" onClick={()=>toggleSort(f.nombre)} title={`Ordenar por ${label(f.nombre)}`}><span>{f.clave==='PRI'?'N.º':label(f.nombre)}</span>{sort.key!==f.nombre?<ArrowUpDown size={14}/>:sort.direction==='asc'?<ArrowUp size={14}/>:<ArrowDown size={14}/>}</button></th>)}<th>Acciones</th></tr></thead><tbody>{pageRows.map(row=><tr key={row[primary(meta)]}>{meta.campos.map(f=><td key={f.nombre} className={f.nombre==='nombre'?'product-name':f.nombre==='descripcion'?'description-cell':''}>{route==='productos'&&f.nombre==='nombre'?<div className="product-cell">{['DE-DEMO-001','DE-DEMO-002'].includes(row.codigo)?<img src={row.codigo==='DE-DEMO-001'?'/assets/pastel.jpg':'/assets/galleta.jpg'} alt=""/>:<span className="product-placeholder"><EntityIcon entity="productos"/></span>}<span>{row.nombre}</span></div>:row[f.nombre]===null?'—':route==='inventarios'&&f.nombre==='cantidad_disponible'?<span className={'stock-level '+(Number(row[f.nombre])===0?'stock-empty':Number(row[f.nombre])<=Number(row.stock_minimo)?'stock-low':'stock-ok')}>{row[f.nombre]} <small>{Number(row[f.nombre])===0?'Agotado':Number(row[f.nombre])<=Number(row.stock_minimo)?'En mínimo o por debajo':'Disponible'}</small></span>:f.tipo==='tinyint(1)'?<span className={'badge '+(row[f.nombre]?'yes':'')}>{row[f.nombre]?'Activo':'En pausa'}</span>:['total','subtotal','precio_venta','precio_unitario','costo_unitario'].includes(f.nombre)?money(row[f.nombre]):String(f.clave==='PRI'?row[f.nombre]:fkText(f.nombre,row[f.nombre]))}</td>)}<td className="actions"><button aria-label="Editar registro" title="Editar" onClick={()=>open(row)}><Pencil size={15}/></button><button className="danger-text" aria-label="Eliminar registro" title="Eliminar" onClick={()=>setDeleting(row)}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div>}<div className="pagination"><span>Mostrando {filtered.length?((currentPage-1)*pageSize+1):0} a {Math.min(currentPage*pageSize,filtered.length)} de {filtered.length} registros</span><label>Filas por página <select value={pageSize} onChange={e=>setPageSize(Number(e.target.value))}><option>10</option><option>25</option><option>50</option></select></label><button disabled={currentPage<=1} onClick={()=>setPage(currentPage-1)}>Anterior</button><span className="current-page">{currentPage} / {totalPages}</span><button disabled={currentPage>=totalPages} onClick={()=>setPage(currentPage+1)}>Siguiente</button></div></section>)}<footer>Dulce Encanto <span>Un espacio para hacer crecer lo que nos encanta.</span></footer></div></main>{form&&<div className="overlay editor-overlay"><section className={'dialog '+(route==='productos'?'product-drawer':'')} role="dialog" aria-modal="true" aria-label={`${form.id?'Editar':'Crear'} ${names[route]}`}><div className="dialog-head"><div><div className="eyebrow">{names[route]}</div><h2>{route==='productos'?'Ficha de Producto':form.id?'Editar registro':'Nuevo registro'}</h2></div><button className="close" onClick={()=>!saving&&setForm(null)} aria-label="Cerrar formulario"><X size={19}/></button></div><form onSubmit={save}><p className="hint">Los campos con * son obligatorios.</p>{error&&<StatusAlert error={error}/>}<div className="fields">{meta.campos.filter(editable).map(f=>field(f,form.values,(k,v)=>setForm(prev=>({...prev,values:{...prev.values,[k]:v}}))))}</div>{nested[route]&&<section className="details"><h3>{route==='recetas'?'Ingredientes de la receta':'Detalle de productos o ingredientes'}</h3>{form.details.map((d,index)=><div className="detail" key={index}><div className="detail-head"><b>Línea {index+1}</b><button type="button" disabled={form.details.length===1||saving} onClick={()=>setForm(prev=>({...prev,details:prev.details.filter((_,i)=>i!==index)}))}>Quitar</button></div><div className="fields">{metas.find(m=>m.ruta===nested[route][0]).campos.filter(editable).filter(f=>f.nombre!==nested[route][1]).map(f=>field(f,d,(k,v)=>setForm(prev=>({...prev,details:prev.details.map((item,i)=>i===index?{...item,[k]:v}:item)})),true))}</div></div>)}<button className="secondary" type="button" onClick={()=>setForm(prev=>({...prev,details:[...prev.details,{}]}))}>＋ Agregar línea</button><p className="hint">Los subtotales y el total se calculan al guardar.</p></section>}<div className="form-actions"><button type="button" className="secondary" disabled={saving} onClick={()=>setForm(null)}>Cancelar</button><button className="primary" disabled={saving} aria-busy={saving}>{saving?'Guardando…':'Guardar registro'}</button></div></form></section></div>}{deleting&&<div className="overlay"><section className="dialog small" role="alertdialog" aria-modal="true" aria-labelledby="delete-title"><h2 id="delete-title">¿Eliminar este registro?</h2><p>Vas a eliminar <b>{display(deleting)}</b>. Esta acción no se puede deshacer. Si contiene detalles, también se eliminarán.</p><div className="form-actions"><button className="secondary" disabled={saving} onClick={()=>setDeleting(null)}>Cancelar</button><button className="danger" disabled={saving} aria-busy={saving} onClick={remove}>{saving?'Eliminando…':'Sí, eliminar'}</button></div></section></div>}{showTop&&!notice&&<button className="back-to-top" aria-label="Volver arriba" title="Volver arriba" onClick={()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}><ArrowUp size={21}/></button>}</div>;
}




