export const statusCatalog = {
  200: {tone:'success',title:'Todo en su punto',message:'La operación se completó correctamente.'},
  201: {tone:'success',title:'Un nuevo detalle, listo',message:'El registro se creó correctamente.'},
  204: {tone:'success',title:'Registro eliminado',message:'La información se eliminó correctamente.'},
  400: {tone:'warning',title:'Revisemos estos datos',message:'Hay datos incompletos o incorrectos.',hint:'Revisa los campos y vuelve a guardar.'},
  401: {tone:'warning',title:'Necesitamos verificar tu acceso',message:'Inicia sesión para continuar.'},
  403: {tone:'warning',title:'Esta acción requiere permiso',message:'Tu cuenta no tiene acceso a esta acción.',hint:'Consulta con la persona encargada. Tus datos no se han cambiado.'},
  404: {tone:'info',title:'No encontramos lo que buscas',message:'El registro o la página ya no están disponibles.',hint:'Actualiza la lista o vuelve al catálogo.'},
  409: {tone:'warning',title:'Hay un detalle por resolver',message:'Los datos entran en conflicto con otro registro.',hint:'Revisa códigos duplicados y registros relacionados antes de continuar.'},
  413: {tone:'warning',title:'La información es demasiado grande',message:'La solicitud supera el tamaño permitido.',hint:'Reduce el contenido e inténtalo de nuevo.'},
  415: {tone:'warning',title:'Necesitamos otro formato',message:'Este formato no es compatible.'},
  422: {tone:'warning',title:'Estos datos necesitan una revisión',message:'La información no cumple una regla del sistema.'},
  429: {tone:'warning',title:'Démosle un momento',message:'Has realizado demasiadas solicitudes.',hint:'Espera antes de volver a intentarlo.'},
  500: {tone:'error',title:'Algo no salió como esperábamos',message:'Ocurrió un problema interno.',hint:'Si estabas guardando, comprueba la lista antes de repetir la operación.'},
  502: {tone:'error',title:'Un servicio externo respondió mal',message:'No pudimos interpretar la respuesta del servicio externo.',hint:'Inténtalo más tarde. Si estabas enviando un correo, revisa antes el registro de envíos.'},
  503: {tone:'warning',title:'Necesitamos una pequeña pausa',message:'Un servicio necesario no está disponible.',hint:'Inténtalo más tarde. Si estabas guardando o enviando, verifica el resultado antes de repetir.'},
  504: {tone:'warning',title:'El servicio está tardando demasiado',message:'El servicio externo no respondió dentro del plazo.',hint:'Comprueba el resultado antes de repetir una operación de guardado o envío.'},
  offline: {tone:'warning',title:'Estás sin conexión',message:'Tu dispositivo indica que no tiene conexión a internet.',hint:'Puedes revisar lo que ya está cargado. Reconéctate para consultar o guardar.'},
  format: {tone:'error',title:'La respuesta no se pudo leer',message:'El servidor devolvió un formato inesperado.',hint:'Si estabas guardando, revisa el resultado antes de volver a intentarlo.'},
  network: {tone:'warning',title:'No logramos conectar',message:'No se pudo contactar con el servidor.',hint:'Comprueba tu conexión y que el backend esté encendido. Verifica el resultado antes de repetir un envío.'},
  timeout: {tone:'warning',title:'La respuesta está tardando',message:'El navegador dejó de esperar la respuesta.',hint:'La operación podría seguir en proceso. Comprueba la lista o el registro de envíos antes de repetirla.'},
  connected: {tone:'success',title:'Conexión del dispositivo recuperada',message:'Ya puedes volver a intentar tus consultas.'},
  validation: {tone:'warning',title:'Revisemos este detalle',message:'Revisa la información antes de continuar.'}
};
export class ApiError extends Error {
  constructor(message,status,{kind,path,method,retryAt}={}) {super(message);this.name='ApiError';this.status=status;this.kind=kind;this.path=path;this.method=method;this.retryAt=retryAt;}
}
export function statusDetails(error) {
  const code=error?.kind||error?.status||'validation';
  const base=statusCatalog[code]||{tone:'error',title:'No se completó la operación',message:'Vuelve a intentarlo más tarde.'};
  // Los errores internos nunca muestran trazas ni mensajes técnicos del proveedor.
  const message=typeof error==='string'?error:Number(error?.status)>=500?base.message:error?.message||base.message;
  return {...base,code,message};
}
export function notifyStatus(status,message){
  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('dulce:status',{detail:{status,message}}));
}
export function retryDate(value){
  if(!value)return undefined;
  const seconds=Number(value);
  const date=Number.isFinite(seconds)?Date.now()+Math.max(0,seconds)*1000:Date.parse(value);
  return Number.isFinite(date)?date:undefined;
}
