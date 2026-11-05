import React from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import AssistantWidget from './components/AssistantWidget';
import AppRoutes from './routes/AppRoutes';
import './style.css';
import './atelier.css';
import './legibilidad.css';
import './interacciones.css';
import './tema.css';
import './asistente.css';
import './notificaciones.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <AssistantWidget/>
      <AppRoutes/>
    </AuthProvider>
  </BrowserRouter>
);
