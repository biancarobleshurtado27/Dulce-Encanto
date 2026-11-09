import React,{useEffect,useRef,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import StatusAlert from './StatusAlert';
export default function StatusCenter(){
 const [items,setItems]=useState([]),[offline,setOffline]=useState(false);const serial=useRef(0),navigate=useNavigate();
 useEffect(()=>{
  const receive=event=>{const item={...event.detail,id:++serial.current};setItems(previous=>[...previous.filter(p=>!(p.status===item.status&&p.message===item.message)).slice(-2),item]);};
  const lost=()=>setOffline(true),found=()=>{setOffline(false);receive({detail:{status:'connected'}});};
  setOffline(navigator.onLine===false);
  window.addEventListener('dulce:status',receive);window.addEventListener('offline',lost);window.addEventListener('online',found);
  return()=>{window.removeEventListener('dulce:status',receive);window.removeEventListener('offline',lost);window.removeEventListener('online',found);};
 },[]);
 return <aside className="status-center" aria-label="Avisos de Dulce Encanto">{offline&&<StatusAlert error={{kind:'offline'}}/>}{items.map(item=><StatusToast key={item.id} item={item} onClose={()=>setItems(previous=>previous.filter(p=>p.id!==item.id))} onLogin={()=>navigate('/login')}/>)}</aside>;
}
function StatusToast({item,onClose,onLogin}){
 const [paused,setPaused]=useState(false);const remaining=useRef(30000),closeRef=useRef(onClose);closeRef.current=onClose;
 useEffect(()=>{
  if(paused)return;
  const start=Date.now(),timer=setTimeout(()=>closeRef.current(),remaining.current);
  return()=>{clearTimeout(timer);remaining.current=Math.max(0,remaining.current-(Date.now()-start));};
 },[paused,item.status]);
 return <div onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocusCapture={()=>setPaused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setPaused(false);}}><StatusAlert autoDismiss={false} status={item.status} message={item.message} onClose={onClose} onLogin={item.status===401?onLogin:undefined}/></div>;
}
