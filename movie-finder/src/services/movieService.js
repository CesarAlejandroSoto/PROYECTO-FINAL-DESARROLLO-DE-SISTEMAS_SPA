const API_URL = 'https://www.omdbapi.com/';
const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

export const searchMovies = async (query, page = 1) => {
  const res = await fetch(`${API_URL}?s=${query}&page=${page}&apikey=${API_KEY}`);
  const data = await res.json();
  return {
    movies: data.Search || [],
    totalResults: parseInt(data.totalResults || '0'),
  };
};

export const getMovieDetails = async (id) => {
  const res = await fetch(`${API_URL}?i=${id}&apikey=${API_KEY}`);
  const data = await res.json();
  return data;
};

// Función corregida para abrir búsqueda en YouTube
export const mostrarTrailer = (title) => {
  const searchQuery = encodeURIComponent(`${title} trailer`);
  const url = `https://www.youtube.com/results?search_query=${searchQuery}`;
  window.open(url, '_blank');
};
