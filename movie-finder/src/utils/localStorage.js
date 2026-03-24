/**
 * Utility module for managing favorite movies in localStorage
 * Data structure: Array<{imdbID: string, Title: string, Poster: string, ...}>
 */

const FAVORITES_KEY = 'favorite_movies';

/**
 * Retrieves all favorite movies from localStorage
 * @returns {Array<Object>} Array of movie objects, empty array if none stored or on error
 */
export const getFavorites = () => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading favorites from localStorage:', error);
    return [];
  }
};

/**
 * Adds a movie to favorites if not already present
 * @param {Object} movie - Movie object to add
 * @param {string} movie.imdbID - Unique IMDb identifier
 * @param {string} movie.Title - Movie title
 * @returns {void}
 */
export const addFavorite = (movie) => {
  if (!movie || !movie.imdbID) {
    console.warn('Invalid movie object: missing imdbID');
    return;
  }

  try {
    const favorites = getFavorites();
    if (!favorites.find(fav => fav.imdbID === movie.imdbID)) {
      favorites.push(movie);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Error adding favorite to localStorage:', error);
  }
};

/**
 * Removes a movie from favorites by IMDb ID
 * @param {string} id - IMDb ID of the movie to remove
 * @returns {void}
 */
export const removeFavorite = (id) => {
  try {
    const favorites = getFavorites().filter(fav => fav.imdbID !== id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Error removing favorite from localStorage:', error);
  }
};

/**
 * Checks if a movie is in the favorites list
 * @param {string} id - IMDb ID of the movie to check
 * @returns {boolean} True if movie is in favorites, false otherwise
 */
export const isFavorite = (id) => {
  try {
    const favorites = getFavorites();
    return favorites.some(fav => fav.imdbID === id);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};