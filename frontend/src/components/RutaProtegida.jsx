import React from 'react';
import {Navigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
export default function RutaProtegida({children}){const {usuario,loading}=useAuth();if(loading)return <div className="loading-state" role="status">Restaurando sesión…</div>;return usuario?children:<Navigate to="/login" replace/>;}
