import { useState, useEffect } from 'react';
import { getMovieDetails } from '../services/movieService';
import { Link } from 'react-router-dom';

const FeaturedSidebar = () => {
  // Estado para almacenar películas populares y recientes
  const [popularMovies, setPopularMovies] = useState([]);
  const [recentMovies, setRecentMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // IDs de películas populares (ejemplo actual)
  const popularIds = [
    'tt10872600', 'tt9376612', 'tt6710474', 'tt1877830', 'tt9032400'
  ];

  // IDs de películas clásicas recientes
  const recentIds = [
    'tt0110912', 'tt0120737', 'tt0167260', 'tt0109830', 'tt0137523'
  ];

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Obtener detalles de películas populares y recientes en paralelo
        const [popular, recent] = await Promise.all([
          Promise.all(popularIds.map(id => getMovieDetails(id))),
          Promise.all(recentIds.map(id => getMovieDetails(id)))
        ]);
        // Filtrar películas sin poster y limitar a 3 elementos
        setPopularMovies(popular.filter(movie => movie && movie.Poster !== 'N/A').slice(0, 3));
        setRecentMovies(recent.filter(movie => movie && movie.Poster !== 'N/A').slice(0, 3));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sidebar movies:', error);
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Componente para mostrar cada película en la lista lateral
  const MovieItem = ({ movie }) => (
    <Link
      to={`/movie/${movie.imdbID}`}
      className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-300 border-b border-gray-100 last:border-b-0"
    >
      {/* Imagen del poster de la película */}
      <img
        src={movie.Poster}
        alt={movie.Title}
        className="w-16 h-20 object-cover rounded-md shadow-sm"
      />
      <div className="flex-1 min-w-0">
        {/* Título de la película */}
        <h4 className="font-semibold text-sm text-gray-800 line-clamp-2 mb-1">
          {movie.Title}
        </h4>
        {/* Año de estreno */}
        <p className="text-xs text-gray-500 mb-1">{movie.Year}</p>
        {/* Mostrar rating solo si existe */}
        {movie.imdbRating && (
          <div className="flex items-center gap-1">
            <span className="text-yellow-500 text-xs">⭐</span>
            <span className="text-xs text-gray-600">{movie.imdbRating}</span>
          </div>
        )}
      </div>
    </Link>
  );

  // Mostrar placeholder animado mientras carga la info
  if (loading) {
    return (
      <div className="w-80 bg-white rounded-lg shadow-lg p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3 mb-4">
              <div className="w-16 h-20 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Contenedor principal con dos secciones: Populares y Clásicos */}
      <div className="flex flex-wrap justify-center gap-6">
        {/* Sección de películas populares */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden w-80">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
            <h3 className="text-white font-bold text-lg">🔥 Populares Ahora</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {popularMovies.map(movie => (
              <MovieItem key={movie.imdbID} movie={movie} />
            ))}
          </div>
        </div>

        {/* Sección de películas clásicas */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden w-80">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4">
            <h3 className="text-white font-bold text-lg">🎭 Clásicos Imperdibles</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recentMovies.map(movie => (
              <MovieItem key={movie.imdbID} movie={movie} />
            ))}
          </div>
        </div>
      </div>

      {/* Botón para ver favoritos */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg p-4 text-center">
        <Link
          to="/favorites"
          className="text-white font-bold text-lg hover:text-pink-100 transition-colors duration-300 flex items-center justify-center gap-2"
        >
          ❤️ Ver Mis Favoritos
        </Link>
      </div>
    </div>
  );
};

export default FeaturedSidebar;

