const API_URL = 'https://reqres.in/api';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const API_KEY = import.meta.env.VITE_AUTH_API_KEY || 'reqres-free-v1';

export const register = async (email, password, name = '') => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error en el registro');
    }

    localStorage.setItem(TOKEN_KEY, data.token);

    const userInfo = {
      email,
      name,
      id: data.id || Date.now().toString(),
    };
    localStorage.setItem(USER_KEY, JSON.stringify(userInfo));

    return { success: true, user: userInfo };
  } catch (error) {
    console.error('Error en registro:', error);
    return { success: false, message: error.message };
  }
};

export const login = async (email, password) => {
  try {
    // Simulamos login local para evitar CORS
    if (email === 'eve.holt@reqres.in' && password === 'cityslicka') {
      const token = 'QpwL5tke4Pnpja7X4'; // Token simulado
      localStorage.setItem(TOKEN_KEY, token);

      const userInfo = {
        email,
        id: Date.now().toString(),
      };
      localStorage.setItem(USER_KEY, JSON.stringify(userInfo));

      return { success: true, user: userInfo };
    } else {
      return { success: false, message: 'Email o contraseña inválidos' };
    }
  } catch (error) {
    console.error('Error en login:', error);
    return { success: false, message: error.message };
  }
};

export const isAuthenticated = () => {
  return localStorage.getItem(TOKEN_KEY) !== null;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
