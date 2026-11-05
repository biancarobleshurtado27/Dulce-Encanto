// Datos exclusivamente ficticios. Ejecutar con el backend encendido.
const base = process.env.API_URL || 'http://127.0.0.1:3001/api';
async function request(route, method='GET', body) {
  const response = await fetch(`${base}/${route}`, {method,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
  const value = await response.json();
  if (!response.ok) throw new Error(`${route}: ${value.error}`);
  return value;
}
async function ensure(route, body, match) {
  const rows=await request(route);
  const found=rows.find(match);
  if(found) return found;
  return request(route,'POST',body);
}
const category=await ensure('categorias',{nombre:'Pasteles de celebración',descripcion:'Pasteles completos para compartir'},r=>r.nombre==='Pasteles de celebración');
const cookies=await ensure('categorias',{nombre:'Galletas y bocados',descripcion:'Pequeños detalles para acompañar el café'},r=>r.nombre==='Galletas y bocados');
const cake=await ensure('productos',{id_categoria:category.id_categoria,codigo:'DE-DEMO-001',nombre:'Pastel de chocolate',descripcion:'Pastel de chocolate con cobertura cremosa',precio_venta:12500,vida_util_dias:3},r=>r.codigo==='DE-DEMO-001');
const cookie=await ensure('productos',{id_categoria:cookies.id_categoria,codigo:'DE-DEMO-002',nombre:'Galleta de chispas',descripcion:'Galleta individual con chispas de chocolate',precio_venta:1200,vida_util_dias:7},r=>r.codigo==='DE-DEMO-002');
const provinces=['San José','Alajuela','Cartago','Heredia','Guanacaste','Puntarenas','Limón'];
const cantons=['San José','Alajuela','Cartago','Heredia','Liberia','Puntarenas','Limón'];
const branches=[];
for(let i=0;i<provinces.length;i++) branches.push(await ensure('sucursales',{nombre:`Dulce Encanto ${provinces[i]}`,provincia:provinces[i],canton:cantons[i],direccion:'Ubicación ficticia para demostración académica',telefono:'00000000',correo:`tienda${i+1}@example.com`},r=>r.nombre===`Dulce Encanto ${provinces[i]}`));
for(const branch of branches) for(const product of [cake,cookie]) await ensure('inventarios',{id_sucursal:branch.id_sucursal,id_producto:product.id_producto,cantidad_disponible:product.id_producto===cake.id_producto?8:30,stock_minimo:3},r=>r.id_sucursal===branch.id_sucursal&&r.id_producto===product.id_producto);
const client=await ensure('clientes',{tipo_cliente:'persona',nombre:'Cliente de demostración',identificacion:'DEMO-CLIENTE-001',correo:'cliente@example.com'},r=>r.identificacion==='DEMO-CLIENTE-001');
const payment=await ensure('metodos-pago',{nombre:'Efectivo',descripcion:'Pago en tienda'},r=>r.nombre==='Efectivo');
for(const nombre of ['Tarjeta','SINPE Móvil']) await ensure('metodos-pago',{nombre},r=>r.nombre===nombre);
const employee=await ensure('empleados',{id_sucursal:branches[0].id_sucursal,identificacion:'DEMO-EMPLEADO-001',nombres:'Ana',apellidos:'Demostración',telefono:'00000000',correo:'empleada@example.com',cargo:'Atención al cliente',fecha_contratacion:'2026-01-15'},r=>r.identificacion==='DEMO-EMPLEADO-001');
const supplier=await ensure('proveedores',{nombre:'Ingredientes del Valle (ficticio)',identificacion:'DEMO-PROVEEDOR-001',nombre_contacto:'Contacto de demostración',telefono:'00000000',correo:'proveedor@example.com',direccion:'Dirección ficticia para demostración'},r=>r.identificacion==='DEMO-PROVEEDOR-001');
const flour=await ensure('ingredientes',{nombre:'Harina de trigo',unidad_medida:'kg'},r=>r.nombre==='Harina de trigo');
const sugar=await ensure('ingredientes',{nombre:'Azúcar blanca',unidad_medida:'kg'},r=>r.nombre==='Azúcar blanca');
const chocolate=await ensure('ingredientes',{nombre:'Chocolate de repostería',unidad_medida:'kg'},r=>r.nombre==='Chocolate de repostería');
await ensure('recetas',{id_producto:cake.id_producto,nombre:'Pastel de chocolate',instrucciones:'Receta ficticia para demostración: mezclar los ingredientes, hornear y decorar.',rendimiento_unidades:1,tiempo_preparacion_minutos:60,detalles:[{id_ingrediente:flour.id_ingrediente,cantidad:0.5},{id_ingrediente:sugar.id_ingrediente,cantidad:0.25},{id_ingrediente:chocolate.id_ingrediente,cantidad:0.3}]},r=>r.id_producto===cake.id_producto);
// La fecha fija distingue las transacciones de demostración y evita duplicarlas.
const sale=await ensure('ventas',{id_sucursal:branches[0].id_sucursal,id_cliente:client.id_cliente,id_empleado:employee.id_empleado,id_metodo_pago:payment.id_metodo_pago,fecha_venta:'2026-11-05 09:00:00',detalles:[{id_producto:cake.id_producto,cantidad:1,precio_unitario:12500},{id_producto:cookie.id_producto,cantidad:4,precio_unitario:1200}]},r=>r.id_cliente===client.id_cliente&&r.fecha_venta==='2026-11-05 09:00:00');
const order=await ensure('ordenes-compra',{id_proveedor:supplier.id_proveedor,id_empleado:employee.id_empleado,fecha_orden:'2026-11-05 09:00:00',fecha_entrega_estimada:'2026-11-10',observaciones:'Compra ficticia para demostración académica',detalles:[{id_ingrediente:flour.id_ingrediente,cantidad:10,costo_unitario:1200},{id_ingrediente:sugar.id_ingrediente,cantidad:5,costo_unitario:1000}]},r=>r.id_proveedor===supplier.id_proveedor&&r.fecha_orden==='2026-11-05 09:00:00');
if(sale.total!==17300||order.total!==17000) throw new Error('Revisar los totales de los registros de demostración existentes');
for(const {ruta} of await request('entidades')) console.log(`${ruta}: ${(await request(ruta)).length} registros`);
console.log('Demostración lista. Venta: CRC 17 300. Compra: CRC 17 000. No se modificaron registros existentes.');
