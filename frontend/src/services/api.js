let token=null;
export function setToken(value){token=value;}
export async function downloadAlertReport(){
 const response=await fetch('/api/alertas/informe',{method:'POST',headers:{...(token?{Authorization:`Bearer ${token}`}:{})}});
 if(response.status===401){token=null;window.dispatchEvent(new Event('auth:expired'));}
 if(!response.ok){const error=await response.json();throw new Error(error.error||'No se pudo generar el informe');}
 const url=URL.createObjectURL(await response.blob());const link=document.createElement('a');link.href=url;link.download='Dulce-Encanto-Informe-Alertas.pdf';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export async function api(path,method='GET',body) {
  const response=await fetch(`/api/${path}`,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:body===undefined?undefined:JSON.stringify(body)});
  const data=response.status===204?null:await response.json();
  if(response.status===401&&!['auth/login','auth/register'].includes(path)){
    token=null;
    window.dispatchEvent(new Event('auth:expired'));
  }
  if(!response.ok) throw new Error(data.error || 'No fue posible completar la operación');
  return data;
}
