export function errorHandler(error, _req, res, _next) {
  if(error.status===429&&Number.isFinite(error.retryAfter))res.set('Retry-After',String(Math.max(1,Math.ceil(error.retryAfter))));
  if([502,503,504].includes(error.status)&&!error.code)return res.status(error.status).json({error:error.message});
  if (error.status && error.status >= 400 && error.status < 500 && !error.type) return res.status(error.status).json({error:error.message});
  if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({error:'Ya existe un registro con esos datos únicos'});
  if (error.code==='ER_NO_REFERENCED_ROW_2') return res.status(400).json({error:'El registro relacionado no existe'});
  if (error.code==='ER_ROW_IS_REFERENCED_2') return res.status(409).json({error:'El registro está siendo utilizado por otros registros'});
  if (['ER_CHECK_CONSTRAINT_VIOLATED','ER_DATA_TOO_LONG','ER_TRUNCATED_WRONG_VALUE','ER_WARN_DATA_OUT_OF_RANGE','ER_BAD_NULL_ERROR','ER_NO_DEFAULT_FOR_FIELD'].includes(error.code)) return res.status(400).json({error:'Los datos incumplen las reglas de la base de datos'});
  if (['ECONNREFUSED','ER_ACCESS_DENIED_ERROR','ER_BAD_DB_ERROR','ETIMEDOUT'].includes(error.code)) return res.status(503).json({error:'Base de datos no disponible. Revisa la configuración de MySQL'});
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo debe contener JSON válido' });
  }
  if (error.status === 413) {
    return res.status(413).json({ error: 'El cuerpo supera el tamaño permitido' });
  }
  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor' });
}
