import React, { useState } from 'react';
import { register } from '../services/authService';

const Register = () => {
  const [email, setEmail] = useState('eve.holt@reqres.in'); // email por defecto válido
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Por favor ingresa email y contraseña');
      return;
    }

    setLoading(true);

    const result = await register(email, password);

    setLoading(false);

    if (result.success) {
      setSuccessMsg('Registro exitoso, ¡bienvenido ' + email + '!');
    } else {
      setError(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Registro</h2>

      <label htmlFor="email" className="block mb-2 font-semibold text-gray-700">
        Email:
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="eve.holt@reqres.in"
        required
        className="w-full px-4 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label htmlFor="password" className="block mb-2 font-semibold text-gray-700">
        Contraseña:
      </label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        className="w-full px-4 py-2 mb-6 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>

      {error && <p className="mt-4 text-red-600 font-semibold">{error}</p>}
      {successMsg && <p className="mt-4 text-green-600 font-semibold">{successMsg}</p>}
    </form>
  );
};

export default Register;


