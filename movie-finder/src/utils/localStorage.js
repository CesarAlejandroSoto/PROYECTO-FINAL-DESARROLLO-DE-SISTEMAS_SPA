const FAVORITES_KEY = 'favorite_movies';

export const getFavorites = () => {
  const stored = localStorage.getItem(FAVORITES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addFavorite = (movie) => {
  const favorites = getFavorites();
  if (!favorites.find(fav => fav.imdbID === movie.imdbID)) {
    favorites.push(movie);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
};

export const removeFavorite = (id) => {
  const favorites = getFavorites().filter(fav => fav.imdbID !== id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

export const isFavorite = (id) => {
  const favorites = getFavorites();
  return favorites.some(fav => fav.imdbID === id);
};