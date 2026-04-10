import { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { addFavorite, removeFavorite, isFavorite } from '../utils/localStorage';
import { getMovieDetails } from '../services/movieService';
import { isFeaturedMovie } from '../constants/featuredMovies';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

/**
 * MovieCard - Interactive card component displaying movie information
 * 
 * Features:
 * - Display poster, title, year, and IMDb rating
 * - Add/remove movies from favorites with localStorage persistence
 * - Highlight featured movies and top-rated films (8.0+)
 * - Responsive sizing (small, normal, large)
 * - Hover effects with details overlay
 * - Memoized rating fetches to prevent redundant API calls
 * 
 * @component
 * @example
 * const movie = {
 *   imdbID: 'tt0468569',
 *   Title: 'The Dark Knight',
 *   Poster: 'https://example.com/poster.jpg',
 *   Year: '2008',
 *   Type: 'movie'
 * };
 * return <MovieCard movie={movie} featured={false} size="normal" />;
 * 
 * @param {Object} props - Component props
 * @param {Movie} props.movie - Movie object with IMDb data
 * @param {boolean} [props.featured=false] - Force featured state
 * @param {('small'|'normal'|'large')} [props.size='normal'] - Card size variant
 * @returns {React.ReactElement} Rendered movie card component
 */
const MovieCard = ({ movie, featured = false, size = 'normal' }) => {
  // Validate movie prop exists and has required fields
  if (!movie || typeof movie !== 'object' || !movie.imdbID) {
    console.warn('MovieCard: Invalid movie prop', movie);
    return null;
  }

  const [favorite, setFavorite] = useState(false);
  const [rating, setRating] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [ratingError, setRatingError] = useState(null);

  // Determine if movie should be displayed as featured
  const isMovieFeatured = useMemo(
    () => featured || isFeaturedMovie(movie.imdbID),
    [featured, movie.imdbID]
  );

  // Check favorite status on mount
  useEffect(() => {
    if (!movie.imdbID) return;
    setFavorite(isFavorite(movie.imdbID));
  }, [movie.imdbID]);

  // Fetch movie rating with timeout and memoization
  useEffect(() => {
    if (!movie.imdbID) return;

    let isMounted = true;
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 5000); // 5 second timeout

    const fetchRating = async () => {
      try {
        const details = await getMovieDetails(movie.imdbID);
        
        if (!isMounted) return;

        // Validate rating is a valid number or N/A
        if (details.imdbRating && details.imdbRating !== 'N/A') {
          setRating(details.imdbRating);
          setRatingError(null);
        } else {
          setRating(null);
        }
      } catch (error) {
        if (!isMounted) return;

        // Only log if not an abort error
        if (error.name !== 'AbortError') {
          console.warn(`Failed to fetch rating for ${movie.imdbID}:`, error.message);
          setRatingError('Rating unavailable');
        }
        setRating(null);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    fetchRating();

    // Cleanup function
    return () => {
      isMounted = false;
      abortController.abort();
      clearTimeout(timeoutId);
    };
  }, [movie.imdbID]);

  // Memoized toggle favorite handler
  const toggleFavorite = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!movie.imdbID) {
      console.warn('Cannot toggle favorite: missing movie.imdbID');
      toast.error('Error: Invalid movie');
      return;
    }

    try {
      if (favorite) {
        const result = removeFavorite(movie.imdbID);
        if (result.success) {
          setFavorite(false);
          toast.error('❌ Eliminado de Favoritos');
        } else {
          toast.error(`Error: ${result.error}`);
        }
      } else {
        const detailedMovie = await getMovieDetails(movie.imdbID);
        
        // Validate movie has required fields before saving
        if (!detailedMovie.Poster) {
          detailedMovie.Poster = '/placeholder.jpg';
        }

        const result = addFavorite(detailedMovie);
        if (result.success) {
          setFavorite(true);
          toast.success('❤️ Agregado a Favoritos');
        } else {
          toast.error(`Error: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Error al actualizar favorito');
    }
  }, [favorite, movie.imdbID]);

  // CSS size variants
  const cardSizes = {
    small: 'max-w-48 h-80',
    normal: 'max-w-xs h-96',
    large: 'max-w-sm h-[28rem]'
  };

  const imageSizes = {
    small: 'h-48',
    normal: 'h-64',
    large: 'h-80'
  };

  // Safe poster URL with fallback
  const posterUrl = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.jpg';
  const safeTitle = movie.Title || 'Unknown Title';
  const safeYear = movie.Year || 'Unknown Year';
  const safeType = movie.Type ? movie.Type.toUpperCase() : 'MOVIE';

  // Safe rating display
  const ratingValue = rating && rating !== 'N/A' ? parseFloat(rating) : null;
  const isTopRated = ratingValue && ratingValue >= 8.0;

  return (
    <Link
      to={`/movie/${movie.imdbID}`}
      className={`transform hover:scale-105 transition-all duration-300 ${cardSizes[size]} rounded-xl overflow-hidden shadow-lg hover:shadow-2xl bg-white m-2 relative border border-gray-200 group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges: Featured & Top-Rated */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {isMovieFeatured && (
          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
            DESTACADO
          </span>
        )}
        {isTopRated && (
          <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
            ⭐ TOP
          </span>
        )}
      </div>

      {/* Favorite Button */}
      <button
        onClick={toggleFavorite}
        className={`absolute top-2 right-2 z-10 text-2xl transition-all duration-300 transform hover:scale-125 ${
          favorite ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
        } drop-shadow-lg`}
        aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        {favorite ? '❤️' : '🤍'}
      </button>

      {/* Poster Image with Overlay */}
      <div className="relative overflow-hidden">
        <img
          src={posterUrl}
          alt={safeTitle}
          className={`w-full ${imageSizes[size]} object-cover transition-transform duration-300 group-hover:scale-110`}
          loading="lazy"
        />

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="text-white text-center p-4">
            <div className="text-sm font-semibold mb-2">Ver Detalles</div>
            <div className="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center">
              ▶️
            </div>
          </div>
        </div>
      </div>

      {/* Movie Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h2
            className={`font-bold text-gray-800 mb-2 line-clamp-2 ${
              size === 'small' ? 'text-sm' : size === 'large' ? 'text-xl' : 'text-lg'
            }`}
            title={safeTitle}
          >
            {safeTitle}
          </h2>

          <div className="flex justify-between items-center">
            <p className="text-gray-600 text-sm font-medium">{safeYear}</p>
            {ratingValue && (
              <div className="flex items-center gap-1" title={`IMDb Rating: ${rating}`}>
                <span className="text-yellow-500">⭐</span>
                <span className="text-sm font-semibold text-gray-700">{rating}</span>
              </div>
            )}
            {ratingError && !ratingValue && (
              <span className="text-gray-400 text-xs" title={ratingError}>
                —
              </span>
            )}
          </div>
        </div>

        {/* Content Type Badge */}
        <div className="mt-2">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
            {safeType}
          </span>
        </div>
      </div>

      {/* Shine Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:animate-pulse transition-opacity duration-700"></div>
    </Link>
  );
};

/**
 * PropTypes validation for MovieCard
 * Ensures movie prop has required structure
 */
MovieCard.propTypes = {
  /**
   * Movie object with IMDb data
   */
  movie: PropTypes.shape({
    imdbID: PropTypes.string.isRequired,
    Title: PropTypes.string.isRequired,
    Poster: PropTypes.string,
    Year: PropTypes.string,
    Type: PropTypes.string,
    imdbRating: PropTypes.string,
  }).isRequired,
  /**
   * Whether to force featured state (ignores FEATURED_MOVIE_IDS)
   */
  featured: PropTypes.bool,
  /**
   * Card size variant
   */
  size: PropTypes.oneOf(['small', 'normal', 'large']),
};

export default MovieCard;








