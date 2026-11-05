// Lista cerrada: nunca se usan nombres de tablas enviados por el cliente.
export const entities = {
  categorias: 'categoria', productos: 'producto', sucursales: 'sucursal',
  inventarios: 'inventario', clientes: 'cliente', ventas: 'venta',
  'detalles-venta': 'detalle_venta', 'metodos-pago': 'metodo_pago',
  empleados: 'empleado', proveedores: 'proveedor', ingredientes: 'ingrediente',
  recetas: 'receta', 'detalles-receta': 'detalle_receta',
  'ordenes-compra': 'orden_compra', 'detalles-compra': 'detalle_compra',
};

export const parents = {
  venta: { table: 'detalle_venta', fk: 'id_venta', pk: 'id_detalle_venta' },
  receta: { table: 'detalle_receta', fk: 'id_receta', pk: 'id_detalle_receta' },
  orden_compra: { table: 'detalle_compra', fk: 'id_orden_compra', pk: 'id_detalle_compra' },
};
export const children = Object.fromEntries(Object.entries(parents).map(([table, info]) => [info.table, { ...info, parent: table }]));

const metadata = new Map();
export async function columns(db, table) {
  if (!metadata.has(table)) {
    const [rows] = await db.query(`SHOW FULL COLUMNS FROM \`${table}\``);
    metadata.set(table, rows);
  }
  return metadata.get(table);
}

export function problem(message, status = 400) {
  return Object.assign(new Error(message), { status });
}

export async function validate(db, table, input, create = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw problem('Se requiere un objeto JSON');
  const fields = await columns(db, table);
  const editable = fields.filter(f => !f.Extra.includes('auto_increment') && !f.Extra.includes('GENERATED') && !['total','fecha_actualizacion'].includes(f.Field));
  const values = {};
  for (const [key, value] of Object.entries(input)) {
    const field = editable.find(f => f.Field === key);
    if (!field) throw problem(`Campo no permitido: ${key}`);
    if (value === null) {
      if (field.Null !== 'YES') throw problem(`${key} es obligatorio`);
      values[key] = null;
      continue;
    }
    if (/tinyint\(1\)/.test(field.Type)) {
      if (![true,false,0,1].includes(value)) throw problem(`${key} debe ser booleano`);
    } else if (/^(int|decimal)/.test(field.Type)) {
      if (typeof value !== 'number' || !Number.isFinite(value)) throw problem(`${key} debe ser numérico`);
      if (field.Type.startsWith('int') && (!Number.isSafeInteger(value) || value > 2147483647)) throw problem(`${key} debe ser entero válido`);
      if (value < 0 || ((key.startsWith('id_') || ['cantidad','vida_util_dias','rendimiento_unidades','tiempo_preparacion_minutos'].includes(key)) && value === 0)) throw problem(`${key} fuera del rango permitido`);
      if (field.Type.startsWith('decimal')) {
        const [,precision,scale] = field.Type.match(/decimal\((\d+),(\d+)\)/);
        if (value >= 10 ** (Number(precision)-Number(scale)) || Math.abs(value * 10 ** Number(scale) - Math.round(value * 10 ** Number(scale))) > 0.00001) throw problem(`${key} excede la precisión permitida`);
      }
    } else {
      if (typeof value !== 'string' || !value.trim()) throw problem(`${key} debe ser texto no vacío`);
      const max = field.Type.match(/varchar\((\d+)\)/);
      if (max && [...value].length > Number(max[1])) throw problem(`${key} supera ${max[1]} caracteres`);
      if (field.Type.startsWith('date')) {
        const pattern = field.Type === 'date' ? /^\d{4}-\d{2}-\d{2}$/ : /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/;
        const date = new Date(value.slice(0,10) + 'T00:00:00Z');
        if (!pattern.test(value) || Number.isNaN(date.valueOf()) || date.toISOString().slice(0,10) !== value.slice(0,10) || (value.length > 10 && (Number(value.slice(11,13)) > 23 || Number(value.slice(14,16)) > 59 || Number(value.slice(17,19)) > 59))) throw problem(`${key} no es una fecha válida`);
      }
      if (key === 'correo' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw problem('Correo electrónico inválido');
    }
    values[key] = value;
  }
  const enums = { tipo_cliente:['persona','empresa'], unidad_medida:['kg','L','unidad'], estado: table === 'venta' ? ['registrada','anulada'] : ['pendiente','recibida','cancelada'] };
  for (const [key, allowed] of Object.entries(enums)) if (values[key] !== undefined && !allowed.includes(values[key])) throw problem(`${key}: valores permitidos ${allowed.join(', ')}`);
  if (create) for (const field of editable) if (field.Null === 'NO' && field.Default === null && !(field.Field in values)) throw problem(`${field.Field} es obligatorio`);
  return values;
}

export async function insert(db, table, values) {
  const [result] = await db.query(`INSERT INTO \`${table}\` SET ?`, values);
  return result.insertId;
}
export async function find(db, table, id, lock = false) {
  const fields = await columns(db, table);
  const pk = fields.find(f => f.Key === 'PRI').Field;
  const [rows] = await db.query(`SELECT * FROM \`${table}\` WHERE \`${pk}\` = ?${lock ? ' FOR UPDATE' : ''}`, [id]);
  if (!rows.length) throw problem('Registro no encontrado',404);
  return rows[0];
}
export async function total(db, table, id) {
  if (!['venta','orden_compra'].includes(table)) return;
  const info = parents[table];
  await db.query(`UPDATE \`${table}\` SET total = (SELECT COALESCE(SUM(subtotal),0) FROM \`${info.table}\` WHERE \`${info.fk}\` = ?) WHERE \`${info.fk}\` = ?`,[id,id]);
}
