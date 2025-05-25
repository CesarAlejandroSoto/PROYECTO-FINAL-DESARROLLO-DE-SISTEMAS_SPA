import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, logout } from '../services/authService';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Estado para controlar la visibilidad del menú móvil
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Estado para controlar la visibilidad del menú de usuario (desktop)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Verifica si el usuario está autenticado
  const isLoggedIn = isAuthenticated();
  // Obtiene datos del usuario actual
  const currentUser = getCurrentUser();

  // Función para cerrar sesión y redirigir a login
  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsUserMenuOpen(false);
  };

  // Función para determinar si una ruta está activa
  const isActiveRoute = (path) => location.pathname === path;

  // Componente interno para los enlaces de navegación, con estilo dinámico según la ruta activa
  const NavLink = ({ to, children, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
        isActiveRoute(to)
          ? 'bg-blue-700 text-white'
          : 'text-white hover:bg-blue-700 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y título */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🎬</span>
              <h1 className="text-2xl font-bold text-white">CineSearch</h1>
            </Link>
          </div>

          {/* Navegación para pantallas medianas y grandes */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {isLoggedIn ? (
                <>
                  <NavLink to="/">
                    <span className="flex items-center space-x-1">
                      <span>🏠</span>
                      <span>Inicio</span>
                    </span>
                  </NavLink>
                  <NavLink to="/favorites">
                    <span className="flex items-center space-x-1">
                      <span>❤️</span>
                      <span>Mis Favoritos</span>
                    </span>
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/login">Iniciar Sesión</NavLink>
                  <NavLink to="/register">Registrarse</NavLink>
                </>
              )}
            </div>
          </div>

          {/* Menú de usuario para desktop (solo si está logueado) */}
          {isLoggedIn && (
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="bg-blue-700 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-white transition-all duration-200 hover:bg-blue-600"
                    id="user-menu-button"
                  >
                    {/* Avatar con inicial del usuario */}
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {(currentUser?.name || currentUser?.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>

                  {/* Menú desplegable del usuario */}
                  {isUserMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <div className="font-medium">
                          {currentUser?.name || 'Usuario'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {currentUser?.email}
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <span className="flex items-center space-x-2">
                          <span>🚪</span>
                          <span>Cerrar Sesión</span>
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botón menú móvil */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-blue-700 inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              {/* Ícono hamburguesa o cruz según el estado */}
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isLoggedIn ? (
              <>
                <NavLink to="/" onClick={() => setIsMenuOpen(false)}>
                  <span className="flex items-center space-x-1">
                    <span>🏠</span>
                    <span>Inicio</span>
                  </span>
                </NavLink>
                <NavLink to="/favorites" onClick={() => setIsMenuOpen(false)}>
                  <span className="flex items-center space-x-1">
                    <span>❤️</span>
                    <span>Mis Favoritos</span>
                  </span>
                </NavLink>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700 transition"
                >
                  <span className="flex items-center space-x-2">
                    <span>🚪</span>
                    <span>Cerrar Sesión</span>
                  </span>
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={() => setIsMenuOpen(false)}>Iniciar Sesión</NavLink>
                <NavLink to="/register" onClick={() => setIsMenuOpen(false)}>Registrarse</NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;

