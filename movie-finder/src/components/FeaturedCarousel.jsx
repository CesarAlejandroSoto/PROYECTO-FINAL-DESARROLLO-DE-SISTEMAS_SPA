import { useState, useEffect } from 'react';
import { getMovieDetails } from '../services/movieService';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

/**
 * FeaturedCarousel - Hero carousel component showing featured movies
 * 
 * Features:
 * - Auto-rotating carousel (5 second intervals)
 * - Manual navigation (prev/next buttons and dot indicators)
 * - Loading and error states with user feedback
 * - Accessibility support (ARIA labels, keyboard navigation)
 * - Visual counter showing current position
 * 
 * @component
 * @returns {React.ReactElement} Rendered carousel or null if no movies
 */
const FeaturedCarousel = () => {
  // Estado para guardar las películas destacadas
  const [featuredMovies, setFeaturedMovies] = useState([]);
  // Estado para controlar la diapositiva actual que se muestra
  const [currentSlide, setCurrentSlide] = useState(0);
  // Estado para manejar la carga de datos
  const [loading, setLoading] = useState(true);
  // 🆕 Estado para manejar errores
  const [error, setError] = useState(null);

  // IDs de películas destacadas que vamos a mostrar en el carrusel
  const featuredIds = [
    'tt0111161', // The Shawshank Redemption
    'tt0068646', // The Godfather
    'tt0468569', // The Dark Knight
    'tt0071562', // The Godfather Part II
    'tt0050083', // 12 Angry Men
    'tt0108052'  // Schindler's List
  ];

  // useEffect para obtener los detalles de las películas cuando el componente carga
  useEffect(() => {
    const fetchFeaturedMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        // Se hace una promesa para traer todos los detalles de las películas usando sus IDs
        const movies = await Promise.all(
          featuredIds.map(id => getMovieDetails(id))
        );
        // Filtramos para evitar películas sin imagen (Poster 'N/A')
        const validMovies = movies.filter(movie => movie && movie.Poster !== 'N/A');
        
        if (validMovies.length === 0) {
          setError('No se pudieron cargar películas destacadas');
          toast.error('❌ Error: No se encontraron películas destacadas');
          setLoading(false);
          return;
        }
        
        setFeaturedMovies(validMovies);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching featured movies:', error);
        // 🆕 Mostrar error al usuario con toast
        setError('Error cargando películas destacadas');
        toast.error('❌ Error: No pudimos cargar las películas destacadas. Intenta recargar.');
        setLoading(false);
      }
    };

    fetchFeaturedMovies();
  }, []);

  // useEffect para cambiar automáticamente la diapositiva 
  useEffect(() => {
    if (featuredMovies.length > 0) {
      // Se usa setInterval para cambiar la diapositiva 
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % featuredMovies.length);
      }, 5000);
      // Limpiamos el intervalo cuando el componente se desmonta o cambia featuredMovies
      return () => clearInterval(interval);
    }
  }, [featuredMovies.length]);

  // Función para ir a la siguiente diapositiva
  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % featuredMovies.length);
  };

  // Función para ir a la diapositiva anterior
  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  };

  // Si aún estamos cargando, mostramos un mensaje de carga
  if (loading) {
    return (
      <div className="relative w-full h-96 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg flex items-center justify-center" role="status" aria-label="Cargando películas destacadas">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-300 border-t-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Cargando películas destacadas...</div>
        </div>
      </div>
    );
  }

  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <div className="relative w-full h-96 bg-red-50 rounded-lg flex items-center justify-center border-2 border-red-200" role="alert">
        <div className="text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-700 font-semibold">{error}</p>
          <p className="text-red-600 text-sm mt-2">Por favor, intenta recargar la página</p>
        </div>
      </div>
    );
  }

  // Si no hay películas para mostrar, no renderizamos nada
  if (featuredMovies.length === 0) return null;

  const currentMovie = featuredMovies[currentSlide];

  return (
    <div 
      className="relative w-full h-96 mb-8 rounded-lg overflow-hidden shadow-xl"
      role="region"
      aria-label="Carrusel de películas destacadas"
      aria-live="polite"
    >
      {/* Contenedor del carrusel */}
      <div className="relative w-full h-full">
        {featuredMovies.map((movie, index) => (
          <div
            key={movie.imdbID}
            // Solo la diapositiva activa tendrá opacidad completa, las otras estarán ocultas
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            role="tabpanel"
            aria-hidden={index !== currentSlide}
          >
            {/* Imagen de fondo con un overlay para que el texto se lea mejor */}
            <div 
              className="w-full h-full bg-cover bg-center relative"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${movie.Poster})`
              }}
            >
              {/* Contenido textual en la parte inferior */}
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div className="max-w-2xl">
                  {/* Etiquetas de destacado y tipo de contenido */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      DESTACADO
                    </span>
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                      PELÍCULA
                    </span>
                  </div>
                  
                  {/* Título de la película */}
                  <h2 className="text-4xl font-bold mb-2">{movie.Title}</h2>
                  
                  {/* Información adicional (año, rating, duración, género) */}
                  <div className="flex items-center gap-4 mb-3 text-sm">
                    <span>{movie.Year}</span>
                    <span>⭐ {movie.imdbRating}</span>
                    <span>{movie.Runtime}</span>
                    <span>{movie.Genre}</span>
                  </div>
                  
                  {/* Sinopsis corta de la película */}
                  <p className="text-lg mb-4 line-clamp-2">
                    {movie.Plot}
                  </p>
                  
                  {/* Botón para ir a la página de detalles de la película */}
                  <Link
                    to={`/movie/${movie.imdbID}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 inline-block active:bg-blue-800"
                    aria-label={`Ver detalles de ${movie.Title}`}
                  >
                    Ver Película
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botones para navegar entre diapositivas */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-300 active:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Película anterior"
        title="Película anterior"
      >
        &#8249;
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-300 active:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Próxima película"
        title="Próxima película"
      >
        &#8250;
      </button>

      {/* 🆕 Indicador de posición (ej: "3 of 6") */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-semibold" aria-live="polite">
        {currentSlide + 1} de {featuredMovies.length}
      </div>

      {/* Indicadores en forma de puntos para mostrar cuál diapositiva está activa */}
      <div 
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2"
        role="tablist"
        aria-label="Indicadores de diapositivas"
      >
        {featuredMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black ${
              index === currentSlide 
                ? 'bg-white' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            role="tab"
            aria-selected={index === currentSlide}
            aria-label={`Ir a la película ${index + 1}`}
            title={`Película ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * 🆕 PropTypes validation
 */
FeaturedCarousel.propTypes = {
  // Component doesn't accept props, but can be extended in future
};

export default FeaturedCarousel;
