import React, { createContext, useState, useContext, useEffect } from 'react';
import { logout as logoutService, isAuthenticated as checkAuth, getCurrentUser } from '../services/authService';

/**
 * Contexto de Autenticación
 * Proporciona estado de autenticación y funciones para toda la app
 */
const AuthContext = createContext();

/**
 * Proveedor del contexto de autenticación
 * Debe envolver el componente Router en App.jsx
 */
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verifica el estado de autenticación al montar el componente
  useEffect(() => {
    const checkAuthStatus = () => {
      if (checkAuth()) {
        setIsLoggedIn(true);
        setCurrentUser(getCurrentUser());
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  /**
   * Función para cerrar sesión
   * Actualiza el estado y limpia la sesión
   */
  const handleLogout = () => {
    logoutService();
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  /**
   * Función para actualizar el estado cuando hay login
   */
  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
  };

  const value = {
    isLoggedIn,
    currentUser,
    loading,
    logout: handleLogout,
    login: handleLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personalizado para usar el contexto de autenticación
 * @returns {object} Objeto con isLoggedIn, currentUser, loading, logout, login
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
