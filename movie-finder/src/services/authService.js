const API_URL = 'https://reqres.in/api';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const API_KEY = 'reqres-free-v1'; // tu API key

export const register = async (email, password, name = '') => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': API_KEY // <-- aquí agregas el header
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
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': API_KEY // <-- aquí también
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error en el login');
    }

    localStorage.setItem(TOKEN_KEY, data.token);

    const userInfo = {
      email,
      id: Date.now().toString(),
    };
    localStorage.setItem(USER_KEY, JSON.stringify(userInfo));

    return { success: true, user: userInfo };
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
