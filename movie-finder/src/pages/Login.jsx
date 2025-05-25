import React, { useState } from 'react';
import { login } from '../services/authService';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  // Estados para manejar email, contraseña, error y carga
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validación básica: campos obligatorios
    if (!email || !password) {
      setError('Por favor ingrese email y contraseña');
      return;
    }

    setLoading(true);
    try {
      // Llama al servicio de login con email y contraseña
      const result = await login(email, password);

      if (result.success) {
        // Si es exitoso, limpia el formulario y redirige al inicio
        setEmail('');
        setPassword('');
        navigate('/');
      } else {
        // Si falla, muestra mensaje de error recibido o genérico
        setError(result.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      // Error al conectar con el servidor o falla inesperada
      setError('Error al conectar con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
        
        {/* Mostrar mensaje de error si existe */}
        {error && (
          <div role="alert" className="mb-4 text-red-600 font-semibold text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Input para email */}
          <div>
            <label htmlFor="email" className="block mb-1 font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
              autoComplete="username"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          
          {/* Input para contraseña */}
          <div>
            <label htmlFor="password" className="block mb-1 font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              required
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          
          {/* Botón de submit deshabilitado mientras carga */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition disabled:opacity-50"
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        {/* Link para ir a registro */}
        <p className="mt-6 text-center text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Regístrate aquí
          </Link>
        </p>
        
        {/* Info de prueba para usar con API reqres.in */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Para pruebas en reqres.in:</p>
          <p>Email: eve.holt@reqres.in</p>
          <p>Contraseña: cityslicka</p>
        </div>
      </div>
    </div>
  );
};

export default Login;



