import React from 'react';
import {CakeSlice} from 'lucide-react';
export default function LoadingScreen({message='Cargando tu espacio de trabajo…',description='Estamos preparando todo para ti.'}){
 return <div className="brand-loading" role="status" aria-live="polite" aria-busy="true"><div className="brand-loading-card"><div className="loading-emblem" aria-hidden="true"><CakeSlice/></div><h1>Dulce Encanto</h1><p className="loading-tagline">Pastelería artesanal · Costa Rica</p><p className="loading-message">{message}</p><p className="loading-description">{description}</p><div className="loading-track" aria-hidden="true"/><span className="loading-signature">Cada detalle, hecho con cariño.</span></div></div>;
}
