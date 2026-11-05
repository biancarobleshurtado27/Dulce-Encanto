import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { pool } from '../src/config/database.js';

test('CRUD de las 15 entidades y reglas empresariales', async () => {
  // Ejecutar solo contra una base de pruebas vacía, nunca contra datos personales.
  if (process.env.RUN_DB_TESTS !== '1') throw new Error('Configura una base aislada y RUN_DB_TESTS=1 antes de probar');
  const server = app.listen(0,'127.0.0.1');
  await new Promise(resolve => server.once('listening',resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const created = [];
  async function call(route,method='GET',body,status=200) {
    const response = await fetch(base+route,{method,headers:{'Content-Type':'application/json'},body:body === undefined ? undefined : JSON.stringify(body)});
    const data = response.status === 204 ? null : await response.json();
    assert.equal(response.status,status,`${method} ${route}: ${JSON.stringify(data)}`);
    return data;
  }
  async function create(route,body,pk,update) {
    const row=await call('/'+route,'POST',body,201);
    const id=row[pk];
    created.push([route,id]);
    assert.ok(id);
    assert.ok((await call('/'+route)).some(r=>r[pk]===id));
    await call(`/${route}/${id}`);
    if(update) await call(`/${route}/${id}`,'PUT',update);
    return row;
  }
  try {
    await call('/salud/db');
    await call('/productos','POST',{},400);
    await call('/productos/abc','GET',undefined,400);
    await call('/productos/2147483647','GET',undefined,404);
    const c=await create('categorias',{nombre:'Prueba'},'id_categoria',{descripcion:'Editada'});
    await call('/categorias','POST',{nombre:'Prueba'},409);
    const p=await create('productos',{id_categoria:c.id_categoria,codigo:'TEST',nombre:'Pastel',precio_venta:2500,vida_util_dias:3},'id_producto',{precio_venta:3000});
    await call(`/productos/${p.id_producto}`,'PUT',{precio_venta:-1},400);
    await call(`/productos/${p.id_producto}`,'PUT',{precio_venta:'3000'},400);
    await call('/categorias/'+c.id_categoria,'DELETE',undefined,409);
    const s=await create('sucursales',{nombre:'Centro',provincia:'San José',canton:'Central',direccion:'Centro',telefono:'22222222'},'id_sucursal',{activa:true});
    await create('inventarios',{id_producto:p.id_producto,id_sucursal:s.id_sucursal,cantidad_disponible:10},'id_inventario',{cantidad_disponible:12});
    const cl=await create('clientes',{tipo_cliente:'persona',nombre:'Cliente'},'id_cliente',{correo:'prueba@example.com'});
    const mp=await create('metodos-pago',{nombre:'Efectivo'},'id_metodo_pago',{descripcion:'Contado'});
    const e=await create('empleados',{id_sucursal:s.id_sucursal,identificacion:'TEST-E',nombres:'Ana',apellidos:'Prueba',telefono:'88888888',cargo:'Ventas',fecha_contratacion:'2026-01-01'},'id_empleado',{cargo:'Encargada'});
    const pr=await create('proveedores',{nombre:'Proveedor',identificacion:'TEST-P',telefono:'88888888',direccion:'Centro'},'id_proveedor',{nombre_contacto:'Contacto'});
    const ing=await create('ingredientes',{nombre:'Harina',unidad_medida:'kg'},'id_ingrediente',{descripcion:'Harina de trigo'});
    const v=await create('ventas',{id_sucursal:s.id_sucursal,id_cliente:cl.id_cliente,id_empleado:e.id_empleado,id_metodo_pago:mp.id_metodo_pago,detalles:[{id_producto:p.id_producto,cantidad:2,precio_unitario:3000}]},'id_venta',{estado:'anulada'});
    assert.equal(v.total,6000);
    const dv=await create('detalles-venta',{id_venta:v.id_venta,id_producto:p.id_producto,cantidad:1,precio_unitario:1000},'id_detalle_venta',{cantidad:2});
    assert.equal((await call('/ventas/'+v.id_venta)).total,8000);
    const r=await create('recetas',{id_producto:p.id_producto,nombre:'Pastel',instrucciones:'Mezclar y hornear',rendimiento_unidades:1,tiempo_preparacion_minutos:60,detalles:[{id_ingrediente:ing.id_ingrediente,cantidad:0.5}]},'id_receta',{nombre:'Receta editada'});
    const ing2=await call('/ingredientes','POST',{nombre:'Azúcar',unidad_medida:'kg'},201);
    created.push(['ingredientes',ing2.id_ingrediente]);
    await create('detalles-receta',{id_receta:r.id_receta,id_ingrediente:ing2.id_ingrediente,cantidad:0.2},'id_detalle_receta',{cantidad:0.3});
    const o=await create('ordenes-compra',{id_proveedor:pr.id_proveedor,id_empleado:e.id_empleado,detalles:[{id_ingrediente:ing.id_ingrediente,cantidad:2.5,costo_unitario:1000}]},'id_orden_compra',{estado:'recibida'});
    assert.equal(o.total,2500);
    await create('detalles-compra',{id_orden_compra:o.id_orden_compra,id_ingrediente:ing2.id_ingrediente,cantidad:1,costo_unitario:500},'id_detalle_compra',{cantidad:2});
    assert.equal((await call('/ordenes-compra/'+o.id_orden_compra)).total,3500);
    await call('/ventas','POST',{id_sucursal:s.id_sucursal,id_empleado:e.id_empleado,id_metodo_pago:mp.id_metodo_pago,detalles:[]},400);
    const before=(await call('/ventas')).length;
    await call('/ventas','POST',{id_sucursal:s.id_sucursal,id_empleado:e.id_empleado,id_metodo_pago:mp.id_metodo_pago,detalles:[{id_producto:2147483647,cantidad:1,precio_unitario:1}]},409);
    assert.equal((await call('/ventas')).length,before,'Rollback completo');
    await call(`/detalles-venta/${dv.id_detalle_venta}`,'DELETE',undefined,204);
    const remaining=(await call('/ventas/'+v.id_venta)).detalles[0];
    await call('/detalles-venta/'+remaining.id_detalle_venta,'DELETE',undefined,409);
    await call('/ventas/'+v.id_venta,'PUT',{detalles:[]},400);
    for(const [route,id] of [...created].reverse()) {
      if(route==='detalles-venta' && id===dv.id_detalle_venta) continue;
      // Los padres borran sus propios detalles; el orden de creación se respeta.
      if(route==='ingredientes' && id===ing2.id_ingrediente) continue;
      await call(`/${route}/${id}`,'DELETE',undefined,204);
      await call(`/${route}/${id}`,'GET',undefined,404);
    }
    await call('/ingredientes/'+ing2.id_ingrediente,'DELETE',undefined,204);
    assert.equal((await call('/entidades')).length,15);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await pool.end();
  }
});
