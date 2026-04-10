import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * SearchBar - Componente de búsqueda con historial persistente
 * 
 * Features:
 * - Input de búsqueda controlado
 * - Historial de últimas 5 búsquedas guardadas en localStorage
 * - Borrado de items individuales del historial
 * - Limpieza completa del historial
 * - Auto-limpieza de input tras búsqueda
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onSearch - Callback ejecutado cuando se realiza una búsqueda
 * @returns {React.ReactElement} Rendered search bar with history
 */
const SearchBar = ({ onSearch }) => {
  // Estado para almacenar el texto ingresado en la barra de búsqueda
  const [query, setQuery] = useState('');
  
  // Estado para almacenar el historial de búsquedas previas
  const [history, setHistory] = useState([]);
  // Estado para controlar si el historial está siendo mostrado
  const [showHistory, setShowHistory] = useState(false);

  // useEffect para cargar el historial guardado en localStorage al montar el componente
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    setHistory(savedHistory);
  }, []);

  /**
   * Ejecuta búsqueda y actualiza historial
   * @param {string} searchQuery - Texto a buscar
   */
  const performSearch = (searchQuery) => {
    if (!searchQuery.trim()) return;

    // Ejecutar la función onSearch pasada por props
    onSearch(searchQuery);

    // Actualizar historial: nueva búsqueda al inicio y eliminar duplicados
    const newHistory = [searchQuery, ...history.filter(item => item !== searchQuery)].slice(0, 5);
    setHistory(newHistory);

    // Guardar en localStorage
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // Función que se ejecuta al enviar el formulario de búsqueda
  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch(query);
    setQuery(''); // 🆕 Limpiar input automáticamente tras buscar
  };

  /**
   * 🆕 Elimina un item individual del historial
   * @param {string} item - Búsqueda a eliminar
   */
  const removeFromHistory = (item) => {
    const newHistory = history.filter(h => h !== item);
    setHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  /**
   * 🆕 Limpia todo el historial
   */
  const clearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem('searchHistory');
    setShowHistory(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-10 px-4 relative">
      {/* Formulario con input para ingresar búsqueda y botón para enviar */}
      <form onSubmit={handleSubmit} className="flex shadow-lg rounded-lg overflow-hidden">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowHistory(true)} // 🆕 Mostrar historial al enfocar
          placeholder="🔍 Buscar película..."
          className="flex-1 p-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 text-sm font-semibold transition-colors duration-300 active:bg-blue-800"
        >
          Buscar
        </button>
      </form>

      {/* 🆕 Historial interactivo con opciones de borrado */}
      {showHistory && history.length > 0 && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 max-w-xs sm:max-w-sm">
          {/* Encabezado con título y botón de limpiar */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">📋 Últimas búsquedas:</p>
            <button
              onClick={clearAllHistory}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors"
              title="Eliminar todo el historial"
            >
              🗑 Limpiar
            </button>
          </div>

          {/* Lista de búsquedas con opción de borrado individual */}
          <ul className="space-y-2">
            {history.map((item, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded transition-colors group"
              >
                <button
                  onClick={() => {
                    performSearch(item);
                    setShowHistory(false);
                  }}
                  className="flex-1 text-left text-blue-700 hover:text-blue-900 font-medium cursor-pointer"
                >
                  🔍 {item}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromHistory(item);
                  }}
                  className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-lg font-bold"
                  title="Eliminar esta búsqueda"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 🆕 Mensaje cuando historial está vacío */}
      {showHistory && history.length === 0 && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 max-w-xs sm:max-w-sm text-center">
          <p className="text-sm text-gray-500">
            📭 Sin búsquedas previas
          </p>
        </div>
      )}

      {/* Cerrar historial al hacer click fuera */}
      {showHistory && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowHistory(false)}
        />
      )}
    </div>
  );
};

/**
 * 🆕 PropTypes validación
 * Asegura que onSearch sea una función requerida
 */
SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;


