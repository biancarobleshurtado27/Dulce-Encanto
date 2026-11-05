import { pool } from '../config/database.js';
import { columns, parents, children, validate, problem, insert, find, total } from '../models/entities.js';

export function crud(table) {
  return async (req, res, next) => {
    let db;
    try {
      const id = req.params.id === undefined ? null : Number(req.params.id);
      if (id !== null && (!Number.isSafeInteger(id) || id < 1 || id > 2147483647)) throw problem('Identificador inválido');
      db = await pool.getConnection();
      const fields = await columns(db, table);
      const pk = fields.find(f => f.Key === 'PRI').Field;
      const info = parents[table];
      const child = children[table];
      if (req.method === 'GET') {
        if (id === null) {
          const [rows] = await db.query(`SELECT * FROM \`${table}\` ORDER BY \`${pk}\` DESC`);
          return res.json(rows);
        }
        const row = await find(db,table,id);
        if (info) {
          const [details] = await db.query(`SELECT * FROM \`${info.table}\` WHERE \`${info.fk}\` = ? ORDER BY \`${info.pk}\``,[id]);
          row.detalles = details;
        }
        return res.json(row);
      }
      await db.beginTransaction();
      // Bloquear primero el padre serializa modificaciones de detalles y totales.
      let parentId;
      if (child) {
        if (req.method === 'POST') parentId = req.body?.[child.fk];
        else parentId = (await find(db,table,id))[child.fk];
        if (!Number.isInteger(parentId) || parentId < 1) throw problem(`${child.fk} inválido`);
        await find(db,child.parent,parentId,true);
      }
      if (id !== null) await find(db,table,id,true);
      if (req.method === 'DELETE') {
        if (child) {
          const [rows] = await db.query(`SELECT COUNT(*) AS n FROM \`${table}\` WHERE \`${child.fk}\` = ?`,[parentId]);
          if (rows[0].n <= 1) throw problem('No se puede eliminar el último detalle',409);
        }
        if (info) await db.query(`DELETE FROM \`${info.table}\` WHERE \`${info.fk}\` = ?`,[id]);
        await db.query(`DELETE FROM \`${table}\` WHERE \`${pk}\` = ?`,[id]);
        if (child) await total(db,child.parent,parentId);
        await db.commit();
        return res.status(204).end();
      }
      const input = req.body;
      if (!input || typeof input !== 'object' || Array.isArray(input)) throw problem('Se requiere un objeto JSON');
      const { detalles, ...body } = input;
      if (!info && detalles !== undefined) throw problem('Esta entidad no acepta detalles anidados');
      if (child && req.method === 'PUT' && body[child.fk] !== undefined && body[child.fk] !== parentId) throw problem('No se permite cambiar el padre de un detalle');
      if (info && ((req.method === 'POST' && detalles === undefined) || (detalles !== undefined && (!Array.isArray(detalles) || !detalles.length)))) throw problem('Se requiere al menos un detalle');
      const values = await validate(db,table,body,req.method === 'POST');
      if (req.method === 'PUT' && !Object.keys(values).length && detalles === undefined) throw problem('No hay campos para actualizar');
      let savedId = id;
      if (req.method === 'POST') savedId = await insert(db,table,values);
      else if (Object.keys(values).length) await db.query(`UPDATE \`${table}\` SET ? WHERE \`${pk}\` = ?`,[values,id]);
      if (info && detalles !== undefined) {
        await db.query(`DELETE FROM \`${info.table}\` WHERE \`${info.fk}\` = ?`,[savedId]);
        for (const detail of detalles) {
          if (!detail || typeof detail !== 'object' || Array.isArray(detail)) throw problem('Detalle inválido');
          if (info.fk in detail) throw problem('No envíes el identificador del padre en detalles anidados');
          const values = await validate(db,info.table,{...detail,[info.fk]:savedId},true);
          await insert(db,info.table,values);
        }
        await total(db,table,savedId);
      }
      if (child) await total(db,child.parent,parentId);
      const row = await find(db,table,savedId);
      if (info) [row.detalles] = await db.query(`SELECT * FROM \`${info.table}\` WHERE \`${info.fk}\` = ?`,[savedId]);
      await db.commit();
      return res.status(req.method === 'POST' ? 201 : 200).json(row);
    } catch (error) {
      if (db) await db.rollback();
      next(error);
    } finally {
      db?.release();
    }
  };
}
