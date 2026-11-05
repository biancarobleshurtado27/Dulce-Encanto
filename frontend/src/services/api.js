export async function api(path,method='GET',body) {
  const response=await fetch(`/api/${path}`,{method,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
  const data=response.status===204?null:await response.json();
  if(!response.ok) throw new Error(data.error || 'No fue posible completar la operación');
  return data;
}
