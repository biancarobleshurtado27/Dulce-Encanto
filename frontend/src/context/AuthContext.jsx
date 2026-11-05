import React,{createContext,useContext,useEffect,useState} from 'react';
import {api,setToken} from '../services/api';
const AuthContext=createContext(null);
export function AuthProvider({children}){
 const [session,setSession]=useState(null),[expired,setExpired]=useState(false);
 function logout(expiration=false){setToken(null);setSession(null);setExpired(expiration);}
 useEffect(()=>{const handler=()=>logout(true);window.addEventListener('auth:expired',handler);return()=>window.removeEventListener('auth:expired',handler);},[]);
 useEffect(()=>{if(!session)return;const timer=setTimeout(()=>logout(true),session.expiresAt-Date.now());return()=>clearTimeout(timer);},[session]);
 async function login(correo,password){const result=await api('auth/login','POST',{correo,password});setToken(result.token);setExpired(false);setSession({usuario:result.usuario,expiresAt:Date.now()+3600000});}
 return <AuthContext.Provider value={{usuario:session?.usuario,login,logout,expired}}>{children}</AuthContext.Provider>;
}
export function useAuth(){return useContext(AuthContext);}
