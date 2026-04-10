/**
 * Utility module for managing favorite movies in localStorage
 * Handles persistence, validation, and optimization of movie favorites
 * @module localStorage
 */

/**
 * @typedef {Object} Movie
 * @property {string} imdbID - Unique IMDb identifier (required)
 * @property {string} Title - Movie title (required)
 * @property {string} Poster - Poster image URL (required)
 * @property {string} [Year] - Release year (optional)
 * @property {string} [Type] - Media type (optional)
 */

/**
 * @typedef {Object} StorageResult
 * @property {boolean} success - Whether operation succeeded
 * @property {*} data - Operation result or error data
 * @property {string|null} error - Error message if failed
 */

const FAVORITES_KEY = 'favorite_movies';
const STORAGE_QUOTA_ERROR = 'QuotaExceededError';

/**
 * Validates movie object structure
 * @param {*} movie - Object to validate
 * @returns {boolean} True if movie has required fields
 * @private
 */
const validateMovie = (movie) => {
  return (
    movie &&
    typeof movie === 'object' &&
    typeof movie.imdbID === 'string' &&
    movie.imdbID.trim().length > 0 &&
    typeof movie.Title === 'string' &&
    movie.Title.trim().length > 0 &&
    typeof movie.Poster === 'string' &&
    movie.Poster.trim().length > 0
  );
};

/**
 * Validates stored JSON structure
 * @param {*} data - Parsed data from localStorage
 * @returns {Array<Movie>} Valid movie array or empty array
 * @private
 */
const validateStoredData = (data) => {
  if (!Array.isArray(data)) {
    console.warn('Stored data is not an array, returning empty list');
    return [];
  }
  return data.filter(item => validateMovie(item));
};

/**
 * Retrieves all favorite movies from localStorage with validation
 * @returns {StorageResult} Object with success status and movie array
 */
export const getFavorites = () => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    
    if (!stored) {
      return { success: true, data: [], error: null };
    }

    const parsed = JSON.parse(stored);
    const validated = validateStoredData(parsed);
    
    // Fix corrupted data by re-saving cleaned version
    if (validated.length !== parsed.length) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(validated));
      console.warn(`Cleaned ${parsed.length - validated.length} invalid records from favorites`);
    }

    return { success: true, data: validated, error: null };
  } catch (error) {
    const errorMsg = error instanceof SyntaxError 
      ? 'Corrupted storage data' 
      : 'Failed to read favorites';
    console.error(`Error reading favorites: ${errorMsg}`, error);
    return { success: false, data: [], error: errorMsg };
  }
};

/**
 * Adds a movie to favorites if not already present
 * @param {Movie} movie - Movie object to add
 * @returns {StorageResult} Operation result
 */
export const addFavorite = (movie) => {
  // Validate input
  if (!validateMovie(movie)) {
    const errorMsg = 'Invalid movie: must have imdbID, Title, and Poster';
    console.warn(errorMsg, movie);
    return { success: false, data: null, error: errorMsg };
  }

  try {
    const result = getFavorites();
    if (!result.success) {
      return result;
    }

    const favorites = result.data;
    const exists = favorites.some(fav => fav.imdbID === movie.imdbID);
    
    if (exists) {
      return { success: true, data: favorites, error: null };
    }

    favorites.push(movie);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return { success: true, data: favorites, error: null };
  } catch (error) {
    const isQuotaError = error.name === STORAGE_QUOTA_ERROR;
    const errorMsg = isQuotaError 
      ? 'Storage full: cannot add more favorites'
      : 'Failed to add favorite';
    console.error(errorMsg, error);
    return { success: false, data: null, error: errorMsg };
  }
};

/**
 * Removes a movie from favorites by IMDb ID
 * @param {string} id - IMDb ID of the movie to remove
 * @returns {StorageResult} Updated favorites list or error
 */
export const removeFavorite = (id) => {
  if (typeof id !== 'string' || id.trim().length === 0) {
    const errorMsg = 'Invalid ID: must be non-empty string';
    console.warn(errorMsg);
    return { success: false, data: null, error: errorMsg };
  }

  try {
    const result = getFavorites();
    if (!result.success) {
      return result;
    }

    const favorites = result.data;
    const updated = favorites.filter(fav => fav.imdbID !== id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return { success: true, data: updated, error: null };
  } catch (error) {
    console.error('Failed to remove favorite', error);
    return { success: false, data: null, error: 'Failed to remove favorite' };
  }
};

/**
 * Checks if a movie is in the favorites list (O(n) - consider caching for large lists)
 * @param {string} id - IMDb ID of the movie to check
 * @returns {boolean} True if movie is in favorites, false otherwise
 */
export const isFavorite = (id) => {
  if (typeof id !== 'string' || id.trim().length === 0) {
    return false;
  }

  try {
    const result = getFavorites();
    if (!result.success) {
      return false;
    }
    return result.data.some(fav => fav.imdbID === id);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

/**
 * Gets count of favorite movies
 * @returns {number} Number of favorite movies
 */
export const getFavoritesCount = () => {
  const result = getFavorites();
  return result.success ? result.data.length : 0;
};

/**
 * Clears all favorites from storage
 * @returns {StorageResult} Confirmation object
 */
export const clearFavorites = () => {
  try {
    localStorage.removeItem(FAVORITES_KEY);
    return { success: true, data: [], error: null };
  } catch (error) {
    console.error('Failed to clear favorites', error);
    return { success: false, data: null, error: 'Failed to clear favorites' };
  }
};