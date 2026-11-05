import LoadingScreen from '../components/LoadingScreen';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';
import React,{useState} from 'react';
import {Link,Navigate,useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
export default function Login(){
 const {usuario,login,expired,loading}=useAuth(),navigate=useNavigate();
 const [correo,setCorreo]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 if(loading)return <LoadingScreen message="Restaurando sesión…" description="Estamos recuperando tu sesión de forma segura."/>; if(usuario)return <Navigate to="/" replace/>;
 async function submit(e){e.preventDefault();setBusy(true);setError('');try{await login(correo,password);navigate('/',{replace:true});}catch(err){setError(err.message);}finally{setBusy(false);}}
 return <AuthLayout><form className="auth-card" onSubmit={submit}><div className="eyebrow">BIENVENIDA DE NUEVO</div><h1>Portal de Colaboradores</h1><p>Gestión interna de nuestra pastelería artesanal.</p>{expired&&<div className="alert">Tu sesión venció. Inicia sesión nuevamente.</div>}{error&&<div className="alert error" role="alert">{error}</div>}<label>Correo electrónico<input autoFocus type="email" autoComplete="username" maxLength="120" required value={correo} onChange={e=>setCorreo(e.target.value)}/></label><label>Contraseña<PasswordInput autoComplete="current-password" required minLength="8" value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="primary" disabled={busy} aria-busy={busy}>{busy?'Ingresando…':'Iniciar sesión'}</button><p className="auth-link">¿Aún no tienes cuenta? <Link to="/registro">Regístrate</Link></p><small>Tu sesión se conserva al actualizar y vence 30 minutos después de iniciar sesión.</small></form></AuthLayout>;
}


