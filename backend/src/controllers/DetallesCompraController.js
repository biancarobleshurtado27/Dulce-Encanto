import {crud} from './crud.js';
import {modelo} from '../models/DetallesCompra.js';
const handler=crud(modelo.tabla);
export const crear=handler;
export const listar=handler;
export const consultar=handler;
export const actualizar=handler;
export const eliminar=handler;
