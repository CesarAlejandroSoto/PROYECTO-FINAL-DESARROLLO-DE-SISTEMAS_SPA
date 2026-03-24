const API_URL = 'https://www.omdbapi.com/';
const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

if (!API_KEY) {
  console.warn('⚠️ VITE_OMDB_API_KEY no está configurada en .env');
}

export const searchMovies = async (query, page = 1) => {
  if (!API_KEY) {
    return {
      movies: [],
      totalResults: 0,
    };
  }
  try {
    const res = await fetch(`${API_URL}?s=${query}&page=${page}&apikey=${API_KEY}`);
    const data = await res.json();
    if (data.Error) {
      console.error('OMDB Error:', data.Error);
      return {
        movies: [],
        totalResults: 0,
      };
    }
    return {
      movies: data.Search || [],
      totalResults: parseInt(data.totalResults || '0'),
    };
  } catch (error) {
    console.error('Error fetching movies:', error);
    return {
      movies: [],
      totalResults: 0,
    };
  }
};

export const getMovieDetails = async (id) => {
  if (!API_KEY) {
    return { Poster: 'N/A' };
  }
  try {
    const res = await fetch(`${API_URL}?i=${id}&apikey=${API_KEY}`);
    const data = await res.json();
    if (data.Error) {
      console.error('OMDB Error:', data.Error);
      return { Poster: 'N/A' };
    }
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return { Poster: 'N/A' };
  }
};

// Función corregida para abrir búsqueda en YouTube
export const mostrarTrailer = (title) => {
  const searchQuery = encodeURIComponent(`${title} trailer`);
  const url = `https://www.youtube.com/results?search_query=${searchQuery}`;
  window.open(url, '_blank');
};
