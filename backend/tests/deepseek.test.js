import test from 'node:test';
import assert from 'node:assert/strict';
import {multiAgentAssistant,deepseekChat} from '../src/services/deepseek.js';
test('Coordinador, especialista y síntesis usan únicamente herramientas permitidas',async()=>{
 const calls=[];
 const chat=async(messages,extra)=>{
  calls.push(messages);
  if(extra?.tools)return {content:null,tool_calls:[{id:'tool1',type:'function',function:{name:'busqueda',arguments:JSON.stringify({filtro:'chocolate',bajos:false})}}]};
  return {content:'Hay un pastel de chocolate en el resultado.'};
 };
 const query=async(message,options)=>{assert.deepEqual(options.agentes,['busqueda']);assert.equal(options.termino,'chocolate');return {resultados:[{agente:'Búsqueda',resumen:'Un resultado',ruta:'/productos',registros:[{id:1,nombre:'Pastel de chocolate'}]}]};};
 const result=await multiAgentAssistant('Busca chocolate',{chat,query});
 assert.equal(result.iaConectada,true);assert.equal(calls.length,3);assert.equal(calls[2][3].role,'tool');assert.equal(result.resultados[0].registros.length,1);
});
test('Rechaza herramientas desconocidas, entradas vacías y errores del proveedor',async()=>{
 await assert.rejects(()=>multiAgentAssistant(''),/consulta/);
 await assert.rejects(()=>multiAgentAssistant('Borrar datos',{chat:async()=>({tool_calls:[{id:'bad',function:{name:'sql',arguments:'{}'}}]})}),/no permitida/);
 const original=process.env.DEEPSEEK_API_KEY;process.env.DEEPSEEK_API_KEY='clave-ficticia-de-prueba';
 try{
  for(const status of [401,402,429,500])await assert.rejects(()=>deepseekChat([] ,{},async()=>({ok:false,status})),error=>error.status===(status===429?429:503)&&!error.message.includes('clave-ficticia'));
  await assert.rejects(()=>deepseekChat([],{},async()=>{throw Object.assign(new Error('timeout ficticio'),{name:'TimeoutError'});}),error=>error.status===504);
  await assert.rejects(()=>deepseekChat([],{},async()=>({ok:true,json:async()=>{throw new Error('JSON incorrecto');}})),error=>error.status===502);
  await assert.rejects(()=>deepseekChat([],{},async()=>({ok:true,json:async()=>({choices:[]})})),error=>error.status===502);
 }
 finally{if(original===undefined)delete process.env.DEEPSEEK_API_KEY;else process.env.DEEPSEEK_API_KEY=original;}
});
