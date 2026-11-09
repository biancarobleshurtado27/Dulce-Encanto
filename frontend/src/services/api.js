import {ApiError,notifyStatus,retryDate} from './status';
let token=null;
export function setToken(value){token=value;}
async function request(path,method,body,{binary=false}={}){
 let response;
 try{response=await fetch(`/api/${path}`,{method,headers:{...(binary?{}:{'Content-Type':'application/json'}),...(token?{Authorization:`Bearer ${token}`}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(path.startsWith('asistente/')?120000:path==='alertas/informe'||path==='alertas/enviar'?90000:30000)});}
 catch(error){throw new ApiError('',undefined,{kind:error.name==='TimeoutError'||error.name==='AbortError'?'timeout':typeof navigator!=='undefined'&&navigator.onLine===false?'offline':'network',path,method});}
 if(response.status===401&&!['auth/login','auth/register'].includes(path)){
  token=null;
  if(typeof window!=='undefined'){notifyStatus(401,'Tu sesión dejó de ser válida. Inicia sesión nuevamente.');window.dispatchEvent(new Event('auth:expired'));}
 }
 let data=null;
 if(!binary||!response.ok){
  const text=response.status===204?'':await response.text();
  try{data=text?JSON.parse(text):null;}catch{if(response.ok)throw new ApiError('El servidor devolvió un formato inesperado.',undefined,{kind:'format',path,method});}
 }
 if(!response.ok)throw new ApiError(typeof data?.error==='string'?data.error:undefined,response.status,{path,method,retryAt:retryDate(response.headers.get('Retry-After'))});
 return {response,data};
}
export async function downloadAlertReport(){
 const {response}=await request('alertas/informe','POST',undefined,{binary:true});
 const url=URL.createObjectURL(await response.blob());const link=document.createElement('a');link.href=url;link.download='Dulce-Encanto-Informe-Alertas.pdf';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export async function api(path,method='GET',body){
 const {response,data}=await request(path,method,body);
 if(method!=='GET'&&!path.startsWith('asistente/')&&!path.startsWith('alertas/')&&!path.startsWith('auth/')){
  notifyStatus(response.status,method==='DELETE'?'El registro se eliminó correctamente.':response.status===201?'El registro se creó correctamente.':'Los cambios se guardaron correctamente.');
 }
 return data;
}
