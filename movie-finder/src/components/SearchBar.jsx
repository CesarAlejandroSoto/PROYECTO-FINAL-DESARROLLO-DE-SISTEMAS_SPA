import { useState, useEffect } from 'react';

const SearchBar = ({ onSearch }) => {
  // Estado para almacenar el texto ingresado en la barra de búsqueda
  const [query, setQuery] = useState('');
  
  // Estado para almacenar el historial de búsquedas previas
  const [history, setHistory] = useState([]);

  // useEffect para cargar el historial guardado en localStorage al montar el componente
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    setHistory(savedHistory);
  }, []);

  // Función que se ejecuta al enviar el formulario de búsqueda
  const handleSubmit = (e) => {
    e.preventDefault();
    // Ignorar si la búsqueda está vacía o solo espacios
    if (!query.trim()) return;

    // Ejecutar la función onSearch pasada por props con el texto de búsqueda
    onSearch(query);

    // Actualizar el historial: nueva búsqueda al inicio y eliminar duplicados
    const newHistory = [query, ...history.filter(item => item !== query)].slice(0, 5);
    setHistory(newHistory);

    // Guardar el historial actualizado en localStorage para persistencia
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-10 px-4">
      {/* Formulario con input para ingresar búsqueda y botón para enviar */}
      <form onSubmit={handleSubmit} className="flex shadow-lg rounded-lg overflow-hidden">
        <input
          type="text"
          value={query}  // valor controlado por el estado query
          onChange={(e) => setQuery(e.target.value)}  // actualizar estado con cada tecla
          placeholder="Buscar película..."
          className="flex-1 p-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 text-sm font-semibold transition-colors"
        >
          Buscar
        </button>
      </form>

      {/* Mostrar historial de búsquedas si existe alguno */}
      {history.length > 0 && (
        <div className="mt-6 text-sm text-gray-700">
          <p className="mb-2 font-medium">Últimas búsquedas:</p>
          <ul className="flex gap-2 flex-wrap">
            {/* Cada item del historial es clickeable para buscar nuevamente */}
            {history.map((item, index) => (
              <li
                key={index}
                onClick={() => onSearch(item)} // disparar búsqueda al hacer click
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full cursor-pointer hover:bg-blue-200 transition"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;


