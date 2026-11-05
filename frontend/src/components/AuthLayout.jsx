import ThemeToggle from './ThemeToggle';
import React from 'react';
import {MapPin,Croissant} from 'lucide-react';
import Brand from './Brand';
export default function AuthLayout({children}){return <div className="auth-page"><div className="auth-frame"><aside className="auth-story"><span className="province-chip"><i/> PRESENCIA EN 7 PROVINCIAS</span><div className="story-quote"><div className="stars">☆ ☆ ☆ ☆ ☆</div><blockquote>“El arte de la repostería artesanal en cada rincón de Costa Rica.”</blockquote><h2>Taller Maestro & Casas Dulces</h2><p>San José · Heredia · Alajuela · Cartago · Guanacaste · Puntarenas · Limón</p><Croissant size={30}/></div></aside><main className="auth-main"><div className="auth-theme"><ThemeToggle/></div><Brand/>{children}<div className="auth-foot"><span><MapPin size={14}/> Dulce Encanto · Costa Rica</span><span><i/> Gestión empresarial</span></div></main></div></div>;}

