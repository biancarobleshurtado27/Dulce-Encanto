import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {byEmail,createUser} from '../models/usuario.js';
import {jwtSecret,tokenOptions} from '../config/jwt.js';
import {problem} from '../models/entities.js';

function credentials(body,register=false) {
  if(!body||typeof body!=='object'||Array.isArray(body)) throw problem('Se requiere un objeto JSON');
  const allowed=register?['nombre','correo','password']:['correo','password'];
  if(Object.keys(body).some(k=>!allowed.includes(k))) throw problem('Hay campos no permitidos');
  const {nombre,correo,password}=body;
  if(typeof correo!=='string'||correo.length>120||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) throw problem('Correo electrónico inválido');
  if(typeof password!=='string'||password.length<8||Buffer.byteLength(password,'utf8')>72) throw problem('La contraseña requiere al menos 8 caracteres y un máximo de 72 bytes');
  if(register&&(typeof nombre!=='string'||!nombre.trim()||[...nombre.trim()].length>100)) throw problem('El nombre es obligatorio y admite hasta 100 caracteres');
  return {nombre:nombre?.trim(),correo:correo.trim().toLowerCase(),password};
}
export async function register(req,res,next) {
  try {
    const {nombre,correo,password}=credentials(req.body,true);
    if(await byEmail(correo)) throw problem('El correo ya está registrado');
    const hash=await bcrypt.hash(password,12);
    const usuario=await createUser(nombre,correo,hash);
    res.status(201).json(usuario);
  }catch(error){if(error.code==='ER_DUP_ENTRY') return res.status(400).json({error:'El correo ya está registrado'});next(error);}
}
export async function login(req,res,next) {
  try {
    const {correo,password}=credentials(req.body);
    const row=await byEmail(correo);
    if(!row||!await bcrypt.compare(password,row.password)) return res.status(401).json({error:'Credenciales incorrectas'});
    const token=jwt.sign({},jwtSecret(),{...tokenOptions,subject:String(row.id)});
    const {password:hash,...usuario}=row;
    res.json({token,usuario});
  }catch(error){next(error);}
}
export function me(req,res){res.json(req.usuario);}
