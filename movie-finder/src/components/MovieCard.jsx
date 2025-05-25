import { useState, useEffect } from 'react';
import { addFavorite, removeFavorite, isFavorite } from '../utils/localStorage';
import { getMovieDetails } from '../services/movieService';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const MovieCard = ({ movie, featured = false, size = 'normal' }) => {
  const [favorite, setFavorite] = useState(false); // Estado para saber si la película está en favoritos
  const [rating, setRating] = useState(null);      // Estado para guardar el rating (imdbRating)
  const [isHovered, setIsHovered] = useState(false); // Estado para controlar el hover de la tarjeta

  // Lista de películas "destacadas" por tener rating alto o relevancia
  const featuredMovieIds = [
    'tt0111161', 'tt0068646', 'tt0468569', 'tt0071562', 
    'tt0050083', 'tt0108052', 'tt0110912', 'tt0120737',
    'tt0167260', 'tt0109830', 'tt0137523', 'tt10872600'
  ];

  // Comprobar si la película actual está marcada como destacada
  const isMovieFeatured = featured || featuredMovieIds.includes(movie.imdbID);

  // Al cargar el componente, verificar si la película ya está en favoritos
  useEffect(() => {
    setFavorite(isFavorite(movie.imdbID));
  }, [movie.imdbID]);

  // Obtener el rating actualizado de la película desde el servicio
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const details = await getMovieDetails(movie.imdbID);
        setRating(details.imdbRating);
      } catch (error) {
        setRating(null); // Si falla, limpiar el rating
      }
    };

    fetchRating();
  }, [movie.imdbID]);

  // Función para agregar o eliminar la película de favoritos
  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (favorite) {
      removeFavorite(movie.imdbID);
      toast.error('❌ Eliminado de Favoritos');
    } else {
      const detailedMovie = await getMovieDetails(movie.imdbID);
      addFavorite(detailedMovie);
      toast.success('❤️ Agregado a Favoritos');
    }

    setFavorite(!favorite);
  };

  // Clases CSS para tamaños de tarjeta
  const cardSizes = {
    small: 'max-w-48 h-80',
    normal: 'max-w-xs h-96',
    large: 'max-w-sm h-[28rem]'
  };

  // Clases CSS para tamaños de imagen según el tamaño de la tarjeta
  const imageSizes = {
    small: 'h-48',
    normal: 'h-64',
    large: 'h-80'
  };

  return (
    <Link
      to={`/movie/${movie.imdbID}`}
      className={`transform hover:scale-105 transition-all duration-300 ${cardSizes[size]} rounded-xl overflow-hidden shadow-lg hover:shadow-2xl bg-white m-2 relative border border-gray-200 group`}
      onMouseEnter={() => setIsHovered(true)}  // Controlar hover para mostrar overlay
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Contenedor de badges en la esquina superior izquierda */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {isMovieFeatured && (
          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
            DESTACADO
          </span>
        )}
        {rating && parseFloat(rating) >= 8.0 && (
          <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
            ⭐ TOP
          </span>
        )}
      </div>

      {/* Botón para agregar o quitar de favoritos */}
      <button
        onClick={toggleFavorite}
        className={`absolute top-2 right-2 z-10 text-2xl transition-all duration-300 transform hover:scale-125 ${
          favorite ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
        } drop-shadow-lg`}
      >
        {favorite ? '❤️' : '🤍'}
      </button>

      {/* Imagen del póster */}
      <div className="relative overflow-hidden">
        <img
          src={movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.jpg'}
          alt={movie.Title}
          className={`w-full ${imageSizes[size]} object-cover transition-transform duration-300 group-hover:scale-110`}
        />
        
        {/* Overlay visible solo al hacer hover */}
        <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="text-white text-center p-4">
            <div className="text-sm font-semibold mb-2">Ver Detalles</div>
            <div className="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center">
              ▶️
            </div>
          </div>
        </div>
      </div>

      {/* Información de la película */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h2 className={`font-bold text-gray-800 mb-2 line-clamp-2 ${
            size === 'small' ? 'text-sm' : size === 'large' ? 'text-xl' : 'text-lg'
          }`}>
            {movie.Title}
          </h2>
          
          <div className="flex justify-between items-center">
            <p className="text-gray-600 text-sm font-medium">{movie.Year}</p>
            {rating && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                <span className="text-sm font-semibold text-gray-700">{rating}</span>
              </div>
            )}
          </div>
        </div>

        {/* Badge con el tipo de contenido (película, serie, etc.) */}
        <div className="mt-2">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
            {movie.Type?.toUpperCase() || 'MOVIE'}
          </span>
        </div>
      </div>

      {/* Efecto de brillo animado al hacer hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:animate-pulse transition-opacity duration-700"></div>
    </Link>
  );
};

export default MovieCard;








