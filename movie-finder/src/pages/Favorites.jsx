import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { getFavorites } from '../utils/localStorage'; 
import MovieList from '../components/MovieList'; 

const Favorites = () => {
  // Estado para almacenar las películas favoritas
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Hook para cambiar de ruta programáticamente
  const navigate = useNavigate();

  // Cargar las películas favoritas al montar el componente
  useEffect(() => {
    const result = getFavorites(); // Obtener favoritos guardados en localStorage
    if (result.success) {
      setFavorites(result.data); // Actualizar estado con favoritos
      setError(null);
    } else {
      setFavorites([]);
      setError(result.error || 'Error al cargar favoritos');
    }
    setLoading(false);
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
      
      {/* Mostrar estado de carga */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Cargando tus favoritos...</p>
        </div>
      )}
      
      {/* Mostrar error si ocurrió */}
      {error && !loading && (
        <div className="text-center py-8">
          <p className="text-red-600">⚠️ {error}</p>
        </div>
      )}
      
      {/* Mostrar la lista de películas favoritas */}
      {!loading && !error && (
        <>
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No tienes favoritos aún</p>
              <p className="text-gray-500 text-sm mt-2">Añade películas desde la página principal</p>
            </div>
          ) : (
            <MovieList movies={favorites} />
          )}
        </>
      )}
    </div>
  );
};


export default Favorites;
