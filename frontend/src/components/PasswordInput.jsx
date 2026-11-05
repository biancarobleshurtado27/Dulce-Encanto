import React,{useState} from 'react';
import {Eye,EyeOff} from 'lucide-react';
export default function PasswordInput(props){const [show,setShow]=useState(false);return <span className="password-field"><input {...props} type={show?'text':'password'}/><button type="button" aria-label={show?'Ocultar contraseña':'Mostrar contraseña'} onClick={()=>setShow(!show)}>{show?<EyeOff size={19}/>:<Eye size={19}/>}</button></span>;}
