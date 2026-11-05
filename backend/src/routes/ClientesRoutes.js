import {Router} from 'express';
import {crear,listar,consultar,actualizar,eliminar} from '../controllers/ClientesController.js';
const router=Router();
router.route('/').get(listar).post(crear);
router.route('/:id').get(consultar).put(actualizar).delete(eliminar);
export default router;
