import {pool} from '../config/database.js';
// No conservar ni reenviar credenciales o datos de contacto reconocibles en texto.
export function redact(text){return String(text).replace(/\bsk-[a-zA-Z0-9_-]{20,}\b/g,'[clave omitida]').replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[correo omitido]').replace(/\b(?:password|contrase[nñ]a|api[_ -]?key|clave)\s*[:=]\s*\S+/gi,'[credencial omitida]').replace(/(?:\+\d{1,3}[ -]?)?(?:\d[ -]?){8,15}\b/g,'[número de contacto omitido]');}
export async function historyFor(userId,limit=20){
 const [rows]=await pool.query('SELECT id,pregunta,respuesta,fecha FROM asistente_turno WHERE usuario_id=? ORDER BY id DESC LIMIT ?',[userId,limit]);
 return rows.reverse().map(row=>({id:row.id,pregunta:row.pregunta,...(typeof row.respuesta==='string'?JSON.parse(row.respuesta):row.respuesta)}));
}
export function conversationFrom(history){return history.slice(-6).flatMap(turn=>[{role:'user',content:redact(turn.pregunta)},{role:'assistant',content:redact(turn.mensaje||turn.resultados?.map(r=>r.resumen).join('\n')||'Consulta realizada.')}]);}
export async function saveTurn(userId,question,result){
 await pool.query('INSERT INTO asistente_turno (usuario_id,pregunta,respuesta) VALUES (?,?,?)',[userId,redact(question),JSON.stringify(result)]);
}
