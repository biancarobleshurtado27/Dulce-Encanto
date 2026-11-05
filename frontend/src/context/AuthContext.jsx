import React,{createContext,useContext,useEffect,useState} from 'react';
import {api,setToken} from '../services/api';
const AuthContext=createContext(null);
const STORAGE_KEY='dulce-encanto-session';
function expiration(token){
 const payload=JSON.parse(atob(token.split('.')[1].replaceAll('-','+').replaceAll('_','/')));
 if(!Number.isFinite(payload.exp)||!Number.isFinite(payload.iat))throw new Error('Sesión inválida');
 return Math.min(payload.exp*1000,(payload.iat+1800)*1000);
}
function removeStored(){try{sessionStorage.removeItem(STORAGE_KEY);}catch{}}
export function AuthProvider({children}){
 const [session,setSession]=useState(null),[expired,setExpired]=useState(false),[loading,setLoading]=useState(true);
 function logout(expiration=false){removeStored();setToken(null);setSession(null);setExpired(expiration);}
 useEffect(()=>{const handler=()=>logout(true);window.addEventListener('auth:expired',handler);return()=>window.removeEventListener('auth:expired',handler);},[]);
 useEffect(()=>{
  let active=true;
  async function restore(){
   try{
    const token=sessionStorage.getItem(STORAGE_KEY);
    if(!token)return;
    const expiresAt=expiration(token);
    if(expiresAt<=Date.now()){logout(true);return;}
    setToken(token);
    const usuario=await api('auth/me');
    if(active)setSession({usuario,expiresAt});
   }catch{if(active)logout();}
   finally{if(active)setLoading(false);}
  }
  restore();return()=>{active=false;};
 },[]);
 useEffect(()=>{
  if(!session)return;
  const check=()=>{if(Date.now()>=session.expiresAt)logout(true);};
  const timer=setTimeout(()=>logout(true),Math.max(0,session.expiresAt-Date.now()));
  window.addEventListener('focus',check);document.addEventListener('visibilitychange',check);
  return()=>{clearTimeout(timer);window.removeEventListener('focus',check);document.removeEventListener('visibilitychange',check);};
 },[session]);
 async function login(correo,password){
  const result=await api('auth/login','POST',{correo,password});
  const expiresAt=expiration(result.token);
  try{sessionStorage.setItem(STORAGE_KEY,result.token);}catch{throw new Error('Permite el almacenamiento de esta pestaña para conservar la sesión al actualizar.');}
  setToken(result.token);setExpired(false);setSession({usuario:result.usuario,expiresAt});
 }
 return <AuthContext.Provider value={{usuario:session?.usuario,login,logout,expired,loading}}>{children}</AuthContext.Provider>;
}
export function useAuth(){return useContext(AuthContext);}
