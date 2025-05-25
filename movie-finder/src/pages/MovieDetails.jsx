import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getMovieDetails, searchMovies, mostrarTrailer } from '../services/movieService';
import { addFavorite, removeFavorite, isFavorite } from '../utils/localStorage';
import { toast } from 'react-toastify';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await getMovieDetails(id);
        setMovie(data);
        setFavorite(isFavorite(id));
        
        if (data.Genre) {
          const mainGenre = data.Genre.split(',')[0].trim();
          const related = await searchMovies(mainGenre);
          setRelatedMovies(related.movies.filter(m => m.imdbID !== id).slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const toggleFavorite = async () => {
    if (favorite) {
      removeFavorite(id);
      toast.error('❌ Eliminado de Favoritos');
    } else {
      addFavorite(movie);
      toast.success('❤️ Agregado a Favoritos');
    }
    setFavorite(!favorite);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-xl text-gray-600">Cargando detalles de la película...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-gray-600 mb-4">No se pudo cargar la película</p>
          <button
            onClick={handleBackToHome}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
          >
            🏠 Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 shadow-md border-b border-blue-200">
      {/* Encabezado con Navegación */}
      <div className="from-blue-50 via-purple-50 to-pink-50">
        <div className="w-full px-4 py-4 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 shadow-md rounded-lg">
          <div className="flex justify-between items-center">
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-300"
            >
              <span className="text-xl">←</span>
              <span className="font-medium">Volver al Inicio</span>
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={toggleFavorite}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  favorite 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {favorite ? '❤️ En Favoritos' : '🤍 Agregar a Favoritos'}
              </button>
              
              <Link
                to="/favorites"
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300"
              >
                Ver Favoritos
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Detalles de la Película */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="shadow-xl rounded-2xl overflow-hidden bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 border border-blue-200">
          {/* Sección Principal */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-60"></div>
            <div 
              className="h-64 bg-cover bg-center"
              style={{
                backgroundImage: movie.Poster !== 'N/A' ? `url(${movie.Poster})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            ></div>
            
            <div className="absolute inset-0 flex items-end">
              <div className="p-8 text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{movie.Title}</h1>
                <div className="flex items-center gap-4 text-lg">
                  <span>{movie.Year}</span>
                  <span>•</span>
                  <span>⭐ {movie.imdbRating}/10</span>
                  <span>•</span>
                  <span>{movie.Runtime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Póster */}
              <div className="lg:w-1/3">
                <img
                  src={movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.jpg'}
                  alt={movie.Title}
                  className="w-full rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
                
                <button
                  onClick={() => mostrarTrailer(movie.Title)}
                  className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  🎥 Ver Tráiler
                </button>
              </div>

              {/* Información de la Película */}
              <div className="lg:w-2/3 space-y-6">
                {/* Géneros */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">🎭 Géneros</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.Genre.split(',').map((genre, i) => (
                      <span 
                        key={i} 
                        className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full"
                      >
                        {genre.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sinopsis */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">📝 Sinopsis</h3>
                  <p className="text-gray-700 leading-relaxed">{movie.Plot}</p>
                </div>

                {/* Detalles en Cuadrícula */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold text-gray-800">🎬 Director:</span>
                      <p className="text-gray-700">{movie.Director}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">🎭 Actores:</span>
                      <p className="text-gray-700">{movie.Actors}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold text-gray-800">📅 Fecha de lanzamiento:</span>
                      <p className="text-gray-700">{movie.Released}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">🏆 Premios:</span>
                      <p className="text-gray-700">{movie.Awards || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Sección de Calificaciones */}
                <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 Calificaciones</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">⭐ {movie.imdbRating}</div>
                      <div className="text-sm text-gray-600">IMDb</div>
                    </div>
                    {movie.Ratings && movie.Ratings.map((rating, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xl font-bold text-blue-600">{rating.Value}</div>
                        <div className="text-sm text-gray-600">{rating.Source}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Películas Relacionadas */}
        {relatedMovies.length > 0 && (
          <div className="mt-12">
            <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                🎬 Películas Relacionadas
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {relatedMovies.map((rel) => (
                  <Link
                    key={rel.imdbID}
                    to={`/movie/${rel.imdbID}`}
                    className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl overflow-hidden">
                      <img 
                        src={rel.Poster !== 'N/A' ? rel.Poster : '/placeholder.jpg'} 
                        alt={rel.Title} 
                        className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity duration-300" 
                      />
                      <div className="p-3">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                          {rel.Title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{rel.Year}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Botón Volver al Inicio (Abajo) */}
        <div className="mt-8 text-center">
          <button
            onClick={handleBackToHome}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🏠 Explorar Más Películas
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;


