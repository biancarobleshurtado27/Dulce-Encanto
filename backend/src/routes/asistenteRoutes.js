import {Router} from 'express';
import {localAssistant} from '../services/asistente.js';
const router=Router();
router.get('/estado',(_req,res)=>res.json({modo:'consulta_local',iaConectada:false,especialistas:['Búsqueda','Inventario','Ventas','Compras','Recetas','Guía'],nota:'Proveedor de IA pendiente de configurar'}));
router.post('/consulta',async(req,res,next)=>{try{res.json(await localAssistant(req.body?.mensaje));}catch(error){next(error);}});
export default router;
