import React,{useState} from 'react';
import {Link,Navigate,useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
export default function Login(){
 const {usuario,login,expired}=useAuth(),navigate=useNavigate();
 const [correo,setCorreo]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 if(usuario)return <Navigate to="/" replace/>;
 async function submit(e){e.preventDefault();setBusy(true);setError('');try{await login(correo,password);navigate('/',{replace:true});}catch(err){setError(err.message);}finally{setBusy(false);}}
 return <div className="auth-page"><aside className="auth-story"><div className="auth-flower">✿</div><h1>Dulce Encanto</h1><p>Los grandes momentos<br/>empiezan con un pequeño detalle.</p><span>PASTELERÍA Y REPOSTERÍA · COSTA RICA</span></aside><main className="auth-main"><form className="auth-card" onSubmit={submit}><div className="eyebrow">BIENVENIDA DE NUEVO</div><h1>Un gusto tenerte aquí.</h1><p>Inicia sesión para gestionar Dulce Encanto.</p>{expired&&<div className="alert">Tu sesión venció. Inicia sesión nuevamente.</div>}{error&&<div className="alert error" role="alert">{error}</div>}<label>Correo electrónico<input autoFocus type="email" autoComplete="username" maxLength="120" required value={correo} onChange={e=>setCorreo(e.target.value)}/></label><label>Contraseña<input type="password" autoComplete="current-password" required minLength="8" value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="primary" disabled={busy}>{busy?'Ingresando…':'Iniciar sesión'}</button><p className="auth-link">¿Aún no tienes cuenta? <Link to="/registro">Regístrate</Link></p><small>Por seguridad, al recargar la página debes iniciar sesión nuevamente.</small></form></main></div>;
}
