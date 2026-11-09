import React,{useEffect,useRef,useState} from 'react';
import {CheckCircle2,TriangleAlert,CircleAlert,Info,WifiOff,X,ArrowRight,RotateCcw} from 'lucide-react';
import {statusDetails} from '../services/status';
export default function StatusAlert({error,status,message,onClose,onRetry,onLogin,compact=false,autoDismiss=true}) {
 const detail=statusDetails(error||{status,message});
 const [dismissed,setDismissed]=useState(false),[paused,setPaused]=useState(false);
 const remaining=useRef(30000);
 useEffect(()=>{remaining.current=30000;setDismissed(false);},[error,status,message]);
 useEffect(()=>{
  if(!autoDismiss||paused||dismissed)return;
  const start=Date.now(),timer=setTimeout(()=>setDismissed(true),remaining.current);
  return()=>{clearTimeout(timer);remaining.current=Math.max(0,remaining.current-(Date.now()-start));};
 },[autoDismiss,paused,dismissed,error,status,message]);
 const [now,setNow]=useState(Date.now());
 useEffect(()=>{if(!error?.retryAt)return;const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[error?.retryAt]);
 const seconds=Math.max(0,Math.ceil(((error?.retryAt||0)-now)/1000));
 const Icon=['offline','network'].includes(detail.code)?WifiOff:({success:CheckCircle2,warning:TriangleAlert,error:CircleAlert,info:Info})[detail.tone];
 if(dismissed)return null;
 return <div onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocusCapture={()=>setPaused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setPaused(false);}} className={`status-alert status-${detail.tone}${compact?' status-compact':''}`} role={detail.tone==='error'||detail.tone==='warning'?'alert':'status'} aria-atomic="true"><span className="status-icon" aria-hidden="true"><Icon size={22}/></span><div className="status-copy"><div className="status-heading"><strong>{detail.title}</strong>{typeof detail.code==='number'&&<span className="status-code" aria-label={`Código HTTP ${detail.code}`}>{detail.code}</span>}</div><p>{detail.message}</p>{detail.hint&&<small>{detail.hint}</small>}{(onRetry||onLogin)&&<div className="status-actions">{onRetry&&<button type="button" disabled={seconds>0} onClick={onRetry}><RotateCcw size={14}/>{seconds?`Espera ${seconds} s`:'Reintentar consulta'}</button>}{onLogin&&<button type="button" onClick={onLogin}>Iniciar sesión <ArrowRight size={14}/></button>}</div>}{seconds>0&&!onRetry&&<small>Podrás volver a intentarlo en {seconds} s.</small>}</div>{onClose&&<button type="button" className="status-close" onClick={onClose} aria-label="Cerrar aviso"><X size={18}/></button>}</div>;
}
