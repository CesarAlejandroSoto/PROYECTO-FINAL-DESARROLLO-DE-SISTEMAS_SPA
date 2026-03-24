const API_URL = 'https://www.omdbapi.com/';
const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

if (!API_KEY) {
  console.warn('⚠️ VITE_OMDB_API_KEY no está configurada en .env');
}

/**
 * Busca películas en OMDB API
 * @param {string} query - Término de búsqueda
 * @param {number} [page=1] - Número de página
 * @returns {Promise<{movies: Array, totalResults: number}>} Películas encontradas o array vacío
 */
export const searchMovies = async (query, page = 1) => {
  if (!query?.trim()) {
    console.warn('Query vacía proporcionada a searchMovies');
    return {
      movies: [],
      totalResults: 0,
    };
  }
  if (!API_KEY) {
    return {
      movies: [],
      totalResults: 0,
    };
  }
  try {
    const res = await fetch(`${API_URL}?s=${query}&page=${page}&apikey=${API_KEY}`);
    
    if (!res.ok) {
      console.error(`HTTP ${res.status}: ${res.statusText}`);
      return {
        movies: [],
        totalResults: 0,
      };
    }
    
    const data = await res.json();
    if (data.Error) {
      console.error('OMDB Error:', data.Error);
      return {
        movies: [],
        totalResults: 0,
      };
    }
    // Validar que Search sea array
    const movies = Array.isArray(data.Search) ? data.Search : [];
    return {
      movies,
      totalResults: parseInt(data.totalResults || '0', 10),
    };
  } catch (error) {
    console.error('Error fetching movies:', error.message);
    return {
      movies: [],
      totalResults: 0,
    };
  }
};

/**
 * Obtiene detalles completos de una película por ID
 * @param {string} id - ID OMDB de la película
 * @returns {Promise<Object>} Datos de la película o objeto fallback
 */
export const getMovieDetails = async (id) => {
  if (!id?.trim()) {
    console.warn('ID vacío proporcionado a getMovieDetails');
    return { Poster: 'N/A' };
  }
  if (!API_KEY) {
    return { Poster: 'N/A' };
  }
  try {
    const res = await fetch(`${API_URL}?i=${id}&apikey=${API_KEY}`);
    
    if (!res.ok) {
      console.error(`HTTP ${res.status}: ${res.statusText}`);
      return { Poster: 'N/A' };
    }
    
    const data = await res.json();
    if (data.Error) {
      console.error('OMDB Error:', data.Error);
      return { Poster: 'N/A' };
    }
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error.message);
    return { Poster: 'N/A' };
  }
};

/**
 * Abre búsqueda de trailer en YouTube en una nueva pestaña
 * @param {string} title - Título de la película
 */
export const mostrarTrailer = (title) => {
  if (!title?.trim()) {
    console.warn('Título vacío en mostrarTrailer');
    return;
  }
  const searchQuery = encodeURIComponent(`${title} trailer`);
  const url = `https://www.youtube.com/results?search_query=${searchQuery}`;
  window.open(url, '_blank');
};
