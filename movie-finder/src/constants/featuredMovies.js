/**
 * Configuration file for featured movies
 * Centralized list of movie IDs that are marked as "featured"
 * @module constants/featuredMovies
 */

/**
 * Array of IMDb IDs for movies that should be highlighted as featured
 * These are typically critically acclaimed films with high ratings
 * @type {string[]}
 */
export const FEATURED_MOVIE_IDS = [
  'tt0111161', // The Shawshank Redemption
  'tt0068646', // The Godfather
  'tt0468569', // The Dark Knight
  'tt0071562', // The Godfather Part II
  'tt0050083', // 12 Angry Men
  'tt0108052', // Pulp Fiction
  'tt0110912', // Forrest Gump
  'tt0120737', // The Lord of the Rings: The Fellowship of the Ring
  'tt0167260', // The Lord of the Rings: The Return of the King
  'tt0109830', // The Shawshank Redemption
  'tt0137523', // Fight Club
  'tt10872600', // The Power of the Dog
];

/**
 * Checks if a movie ID is in the featured list
 * @param {string} movieId - The IMDb movie ID
 * @returns {boolean} True if the movie is featured
 */
export const isFeaturedMovie = (movieId) => {
  return FEATURED_MOVIE_IDS.includes(movieId);
};
