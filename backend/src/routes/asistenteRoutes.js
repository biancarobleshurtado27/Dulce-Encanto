import {Router} from 'express';
import {multiAgentAssistant,assistantStatus} from '../services/deepseek.js';
import {localAssistant} from '../services/asistente.js';
const router=Router();
const active=new Set();
router.get('/estado',(_req,res)=>res.json(assistantStatus()));
router.post('/consulta',async(req,res,next)=>{const id=req.usuario.id;if(active.has(id))return res.status(429).json({error:'Espera a que termine tu consulta anterior.'});active.add(id);try{res.json(await (req.body?.modo==='local'?localAssistant(req.body?.mensaje):multiAgentAssistant(req.body?.mensaje)));}catch(error){next(error);}finally{active.delete(id);}});
export default router;
