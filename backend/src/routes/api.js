import { Router } from 'express';
import { entities, columns } from '../models/entities.js';
import { pool } from '../config/database.js';
import asistenteRoutes from './asistenteRoutes.js';
import CategoriasRoutes from './CategoriasRoutes.js';
import ProductosRoutes from './ProductosRoutes.js';
import SucursalesRoutes from './SucursalesRoutes.js';
import InventariosRoutes from './InventariosRoutes.js';
import ClientesRoutes from './ClientesRoutes.js';
import VentasRoutes from './VentasRoutes.js';
import DetallesVentaRoutes from './DetallesVentaRoutes.js';
import MetodosPagoRoutes from './MetodosPagoRoutes.js';
import EmpleadosRoutes from './EmpleadosRoutes.js';
import ProveedoresRoutes from './ProveedoresRoutes.js';
import IngredientesRoutes from './IngredientesRoutes.js';
import RecetasRoutes from './RecetasRoutes.js';
import DetallesRecetaRoutes from './DetallesRecetaRoutes.js';
import OrdenesCompraRoutes from './OrdenesCompraRoutes.js';
import DetallesCompraRoutes from './DetallesCompraRoutes.js';

export const api = Router();
api.use('/asistente',asistenteRoutes);
api.get('/entidades', async (_req,res,next) => {
  try {
    const result = [];
    for (const [ruta,tabla] of Object.entries(entities)) {
      const fields = await columns(pool,tabla);
      result.push({ruta,tabla,campos:fields.map(f => ({nombre:f.Field,tipo:f.Type,opcional:f.Null==='YES',predeterminado:f.Default,clave:f.Key,extra:f.Extra}))});
    }
    res.json(result);
  } catch (error) { next(error); }
});
api.get('/salud/db', async (_req,res,next) => {
  try { await pool.query('SELECT 1'); res.json({estado:'ok',base_de_datos:'conectada'}); }
  catch(error) { next(error); }
});
api.use('/categorias',CategoriasRoutes);
api.use('/productos',ProductosRoutes);
api.use('/sucursales',SucursalesRoutes);
api.use('/inventarios',InventariosRoutes);
api.use('/clientes',ClientesRoutes);
api.use('/ventas',VentasRoutes);
api.use('/detalles-venta',DetallesVentaRoutes);
api.use('/metodos-pago',MetodosPagoRoutes);
api.use('/empleados',EmpleadosRoutes);
api.use('/proveedores',ProveedoresRoutes);
api.use('/ingredientes',IngredientesRoutes);
api.use('/recetas',RecetasRoutes);
api.use('/detalles-receta',DetallesRecetaRoutes);
api.use('/ordenes-compra',OrdenesCompraRoutes);
api.use('/detalles-compra',DetallesCompraRoutes);
