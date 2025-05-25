import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { getFavorites } from '../utils/localStorage'; 
import MovieList from '../components/MovieList'; 

const Favorites = () => {
  // Estado para almacenar las películas favoritas
  const [favorites, setFavorites] = useState([]);
  
  // Hook para cambiar de ruta programáticamente
  const navigate = useNavigate();

  // Cargar las películas favoritas al montar el componente
  useEffect(() => {
    const favs = getFavorites(); // Obtener favoritos guardados en localStorage
    setFavorites(favs);          // Actualizar estado con favoritos
  }, []);

  // Función para navegar a la página principal al hacer click en el botón
  const handleGoHome = () => {
    navigate('/'); 
  };

  return (
    <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 shadow-md border-b border-blue-200">
      {/* Contenedor del header con botón para volver y título */}
      <div className="flex items-center justify-between mb-6">
        {/* Botón para volver al inicio */}
        <button 
          onClick={handleGoHome}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
        >
          <span>🏠</span>
          Volver al Inicio
        </button>
        
        {/* Título de la página */}
        <h2 className="text-2xl font-bold text-gray-800">Mis Favoritos ❤️</h2>
      </div>
      
      {/* Mostrar la lista de películas favoritas */}
      <MovieList movies={favorites} />
    </div>
  );
};

export default Favorites;
