/**
 * Authentication Service
 * Maneja registro, login, logout y gestión de sesión del usuario
 * Almacena datos en localStorage (token y info de usuario)
 */

const API_URL = 'https://reqres.in/api';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const API_KEY = import.meta.env.VITE_AUTH_API_KEY || 'reqres-free-v1';

// ============================================================================
// HELPERS: Validación y manejo de errores
// ============================================================================

/**
 * Valida que el email tenga un formato correcto
 * @param {string} email - Email a validar
 * @throws {Error} Si el email no es válido
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    throw new Error('Email inválido. Verifica el formato.');
  }
};

/**
 * Valida que la contraseña cumpla requisitos mínimos
 * @param {string} password - Contraseña a validar
 * @throws {Error} Si la contraseña no cumple requisitos
 */
const validatePassword = (password) => {
  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new Error('Contraseña debe tener mínimo 6 caracteres.');
  }
};

/**
 * Parsea JSON de forma segura desde una respuesta HTTP
 * @param {Response} response - Respuesta HTTP
 * @returns {Promise<object|null>} Objeto parseado o null si falla
 */
const safeParseJSON = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

/**
 * Retorna mensaje de error amigable según código HTTP
 * @param {number} status - Código HTTP de estado
 * @returns {string} Mensaje de error legible
 */
const getHttpErrorMessage = (status) => {
  const messages = {
    400: 'Datos inválidos. Verifica email y contraseña.',
    401: 'Credenciales inválidas.',
    409: 'El email ya está registrado.',
    500: 'Error del servidor. Intenta más tarde.',
  };
  return messages[status] || 'Error en la solicitud.';
};

/**
 * Registra un nuevo usuario
 * @param {string} email - Email del usuario (debe ser válido)
 * @param {string} password - Contraseña (mínimo 6 caracteres)
 * @param {string} [name=''] - Nombre del usuario (opcional)
 * @returns {Promise<{success: boolean, user?: object, message?: string}>}
 *          - success: true y user si el registro es exitoso
 *          - success: false y message si falla
 */
export const register = async (email, password, name = '') => {
  try {
    // Validar inputs antes de enviar al servidor
    validateEmail(email);
    validatePassword(password);

    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    // Parsear respuesta de forma segura
    const data = await safeParseJSON(response);

    // Si no hay respuesta OK, lanzar error con mensaje apropiado
    if (!response.ok) {
      const errorMessage = data?.error || getHttpErrorMessage(response.status);
      throw new Error(errorMessage);
    }

    // Validar que la respuesta tenga el token esperado
    if (!data || !data.token) {
      throw new Error('Respuesta inválida del servidor.');
    }

    localStorage.setItem(TOKEN_KEY, data.token);

    const userInfo = {
      email: email.trim(),
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

/**
 * Autentica un usuario con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<{success: boolean, user?: object, message?: string}>}
 *          - success: true y user si autenticación es exitosa
 *          - success: false y message si falla
 */
export const login = async (email, password) => {
  try {
    // Validar inputs antes de procesar
    validateEmail(email);
    validatePassword(password);

    // Simulamos login local para evitar CORS
    if (email === 'eve.holt@reqres.in' && password === 'cityslicka') {
      const token = 'QpwL5tke4Pnpja7X4'; // Token simulado
      localStorage.setItem(TOKEN_KEY, token);

      const userInfo = {
        email: email.trim(),
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

/**
 * Verifica si hay un usuario autenticado actualmente
 * @returns {boolean} true si hay sesión activa, false en caso contrario
 */
export const isAuthenticated = () => {
  return localStorage.getItem(TOKEN_KEY) !== null;
};

/**
 * Obtiene la información del usuario autenticado actual
 * @returns {object|null} Objeto usuario si está autenticado, null en caso contrario
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem(USER_KEY);
  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch (error) {
    console.error('Error al parsear usuario del almacenamiento:', error);
    // Limpiar datos corruptos
    logout();
    return null;
  }
};

/**
 * Cierra la sesión del usuario y limpia los datos almacenados
 * @returns {void}
 */
export const logout = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error al hacer logout:', error);
  }
};
