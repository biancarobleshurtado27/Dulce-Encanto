import jwt from 'jsonwebtoken';
import {jwtSecret} from '../config/jwt.js';
import {byId} from '../models/usuario.js';

export async function authMiddleware(req,res,next) {
  const secret=jwtSecret();
  const match=req.headers.authorization?.match(/^Bearer ([^\s]+)$/);
  if(!match) return res.status(401).json({error:'No autorizado'});
  let payload;
  try {
    payload=jwt.verify(match[1],secret,{algorithms:['HS256'],issuer:'dulce-encanto',audience:'dulce-encanto-web',maxAge:'30m'});
    if(typeof payload.sub!=='string'||!/^\d+$/.test(payload.sub)) throw new Error('Identidad inválida');
  } catch { return res.status(401).json({error:'No autorizado'}); }
  try {
    const user=await byId(payload.sub);
    if(!user) return res.status(401).json({error:'No autorizado'});
    req.usuario=user;
    next();
  }catch(error){next(error);}
}
