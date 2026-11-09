import React from 'react';
import {Link} from 'react-router-dom';
import {CakeSlice,ArrowLeft,Home} from 'lucide-react';
import Brand from '../components/Brand';
import ThemeToggle from '../components/ThemeToggle';
import StatusAlert from '../components/StatusAlert';
export default function NoEncontrado(){return <main className="missing-page"><header><Brand/><ThemeToggle/></header><section className="missing-card"><div className="missing-illustration" aria-hidden="true"><CakeSlice size={62}/><span>404</span></div><p className="eyebrow">UN PEQUEÑO DESVÍO</p><h1>Esta página no está en nuestra receta.</h1><p>La dirección puede haber cambiado o estar escrita de otra manera. Tu próximo destino está a un clic.</p><StatusAlert status={404}/><div className="missing-actions"><button className="secondary" onClick={()=>window.history.length>1?window.history.back():window.location.assign('/productos')}><ArrowLeft size={17}/> Volver</button><Link className="primary" to="/productos"><Home size={17}/> Ir al catálogo</Link></div></section></main>;}
