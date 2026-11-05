import {Router} from 'express';
import {multiAgentAssistant,assistantStatus} from '../services/deepseek.js';
import {localAssistant} from '../services/asistente.js';
import {historyFor,conversationFrom,saveTurn,redact} from '../services/memoriaAsistente.js';
const router=Router();
const active=new Set();
router.get('/estado',(_req,res)=>res.json(assistantStatus()));
router.get('/historial',async(req,res,next)=>{try{res.json(await historyFor(req.usuario.id));}catch(error){next(error);}});
router.post('/consulta',async(req,res,next)=>{const id=req.usuario.id;if(active.has(id))return res.status(429).json({error:'Espera a que termine tu consulta anterior.'});active.add(id);try{
 if(typeof req.body?.mensaje!=='string'||!req.body.mensaje.trim()||req.body.mensaje.length>1000)return res.status(400).json({error:'Escribe una consulta de entre 1 y 1000 caracteres'});
 const question=redact(req.body.mensaje);
 const history=conversationFrom(await historyFor(id,6));
 const result=await (req.body?.modo==='local'?localAssistant(question):multiAgentAssistant(question,{history}));
 await saveTurn(id,question,result);
 res.json(result);
}catch(error){next(error);}finally{active.delete(id);}});
export default router;
