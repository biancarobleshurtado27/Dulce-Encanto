import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';
import React,{useState} from 'react';
import {Link,Navigate,useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {api} from '../services/api';
export default function Registro(){
 const {usuario}=useAuth(),navigate=useNavigate();
 const [nombre,setNombre]=useState(''),[correo,setCorreo]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[done,setDone]=useState(false);
 if(usuario)return <Navigate to="/" replace/>;
 async function submit(e){e.preventDefault();setError('');if(password!==confirm){setError('Las contraseñas no coinciden');return;}if(new TextEncoder().encode(password).length>72){setError('La contraseña no puede superar 72 bytes');return;}setBusy(true);try{await api('auth/register','POST',{nombre,correo,password});setPassword('');setConfirm('');setDone(true);}catch(err){setError(err.message);}finally{setBusy(false);}}
 return <AuthLayout><form className="auth-card" onSubmit={submit}><div className="eyebrow">UN NUEVO COMIENZO</div><h1>Crea tu cuenta.</h1><p>Tu espacio para gestionar Dulce Encanto.</p>{done?<><div className="alert success" role="status">Tu cuenta se creó correctamente.</div><button className="primary" type="button" onClick={()=>navigate('/login')}>Ir a iniciar sesión</button></>:<>{error&&<div className="alert error" role="alert">{error}</div>}<label>Nombre<input autoFocus autoComplete="name" required maxLength="100" value={nombre} onChange={e=>setNombre(e.target.value)}/></label><label>Correo electrónico<input type="email" autoComplete="username" required maxLength="120" value={correo} onChange={e=>setCorreo(e.target.value)}/></label><label>Contraseña<PasswordInput autoComplete="new-password" required minLength="8" value={password} onChange={e=>setPassword(e.target.value)}/><small>Mínimo 8 caracteres, máximo 72 bytes.</small></label><label>Confirmar contraseña<PasswordInput autoComplete="new-password" required minLength="8" value={confirm} onChange={e=>setConfirm(e.target.value)}/></label><button className="primary" disabled={busy} aria-busy={busy}>{busy?'Creando cuenta…':'Crear cuenta'}</button></>}<p className="auth-link">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p></form></AuthLayout>;
}
