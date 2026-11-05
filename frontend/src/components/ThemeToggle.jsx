import React,{useState} from 'react';
import {Moon,Sun} from 'lucide-react';
export default function ThemeToggle(){
 const [theme,setTheme]=useState(()=>typeof document==='undefined'?'light':document.documentElement.dataset.theme||'light');
 function toggle(){const next=theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;document.documentElement.style.colorScheme=next;setTheme(next);try{localStorage.setItem('dulce-encanto-theme',next);}catch{}}
 return <button className="theme-toggle" type="button" onClick={toggle} aria-pressed={theme==='dark'} aria-label={theme==='dark'?'Cambiar a modo claro':'Cambiar a modo oscuro'} title={theme==='dark'?'Cambiar a modo claro':'Cambiar a modo oscuro'}>{theme==='dark'?<Sun size={19}/>:<Moon size={19}/>}<span>{theme==='dark'?'Modo claro':'Modo oscuro'}</span></button>;
}
