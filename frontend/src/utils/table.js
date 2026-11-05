const collator = new Intl.Collator('es-CR', {numeric: true, sensitivity: 'base'});
export const normalizeSearch = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
export function sortRecords(rows, field, direction = 'asc', resolve = (_key, value) => value) {
  if (!field) return rows;
  const numeric = /^(int|bigint|smallint|tinyint|decimal|float|double)/.test(field.tipo);
  return [...rows].sort((a, b) => {
    const x = a[field.nombre], y = b[field.nombre];
    if (x == null || y == null) return x == null && y == null ? 0 : x == null ? 1 : -1;
    const order = numeric && !field.nombre.startsWith('id_') || field.clave === 'PRI'
      ? Number(x) - Number(y)
      : collator.compare(String(resolve(field.nombre, x)), String(resolve(field.nombre, y)));
    return direction === 'desc' ? -order : order;
  });
}
export function matchesStock(row, filter) {
  const quantity = Number(row.cantidad_disponible), minimum = Number(row.stock_minimo);
  return !filter || (filter === 'agotado' ? quantity === 0 : filter === 'bajo' ? quantity <= minimum : quantity > minimum);
}
export function csvCell(value) {
  let text = String(value ?? '');
  if (typeof value === 'string' && /^[\s]*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
