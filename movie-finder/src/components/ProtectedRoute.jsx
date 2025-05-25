import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';

/**
 * Componente para proteger rutas que requieren autenticación
 * Redirige a la página de login si el usuario no está autenticado
 */
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    // Redirigir al login si no hay autenticación
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;