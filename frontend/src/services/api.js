let token=null;
export function setToken(value){token=value;}
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
