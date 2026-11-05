import {api} from './api';
const ruta='categorias';
export const listar=()=>api(ruta);
export const consultar=id=>api(ruta+'/'+id);
export const crear=body=>api(ruta,'POST',body);
export const actualizar=(id,body)=>api(ruta+'/'+id,'PUT',body);
export const eliminar=id=>api(ruta+'/'+id,'DELETE');
