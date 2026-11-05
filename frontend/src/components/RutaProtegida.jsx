import React from 'react';
import {Navigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';
export default function RutaProtegida({children}){const {usuario,loading}=useAuth();if(loading)return <LoadingScreen message="Restaurando sesión…" description="Estamos recuperando tu sesión de forma segura."/>;return usuario?children:<Navigate to="/login" replace/>;}
