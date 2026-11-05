import {pool} from '../config/database.js';
export const publicFields = 'id, nombre, correo, fechaCreacion';
export async function byEmail(correo) {
  const [rows]=await pool.query('SELECT * FROM usuario WHERE correo = ?',[correo]);
  return rows[0];
}
export async function byId(id) {
  const [rows]=await pool.query(`SELECT ${publicFields} FROM usuario WHERE id = ?`,[id]);
  return rows[0];
}
export async function createUser(nombre,correo,password) {
  const [result]=await pool.query('INSERT INTO usuario (nombre,correo,password) VALUES (?,?,?)',[nombre,correo,password]);
  return byId(result.insertId);
}
