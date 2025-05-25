import { useEffect, useState } from 'react';
import { searchMovies } from '../services/movieService';
import SearchBar from '../components/SearchBar';
import MovieList from '../components/MovieList';
import FeaturedCarousel from '../components/FeaturedCarousel';
import FeaturedSidebar from '../components/FeaturedSidebar';
import { Link } from 'react-router-dom';

const Home = () => {
  // Estado para guardar la consulta actual del buscador
  const [query, setQuery] = useState('');
  // Estado para guardar las películas que se obtienen de la búsqueda
  const [movies, setMovies] = useState([]);
  // Estado para manejar la página actual en la paginación
  const [page, setPage] = useState(1);
  // Estado para el total de resultados devueltos por la búsqueda
  const [totalResults, setTotalResults] = useState(0);
  // Estado para saber si el usuario está realizando una búsqueda o no
  const [isSearching, setIsSearching] = useState(false);

  // Función que maneja la búsqueda de películas
  const handleSearch = async (searchQuery, newPage = 1) => {
    setQuery(searchQuery);     // Actualiza la consulta
    setPage(newPage);          // Actualiza la página
    setIsSearching(true);      // Marca que se está buscando
    
    try {
      // Llama al servicio para buscar películas según la consulta y página
      const data = await searchMovies(searchQuery, newPage);
      setMovies(data.movies);           // Guarda las películas obtenidas
      setTotalResults(data.totalResults); // Guarda el total de resultados
    } catch (error) {
      console.error('Error searching movies:', error);
      // En caso de error limpia la lista y total
      setMovies([]);
      setTotalResults(0);
    }
  };

  // useEffect para actualizar las películas cuando cambia la página,
  // siempre que haya una consulta activa
  useEffect(() => {
    if (query) {
      searchMovies(query, page).then(data => {
        setMovies(data.movies);
        setTotalResults(data.totalResults);
      });
    }
  }, [page]);

  // Calcula el total de páginas según los resultados (10 por página)
  const totalPages = Math.ceil(totalResults / 10);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 shadow-md border-b border-blue-200">
      {/* Sección de encabezado con título y buscador */}
      <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 shadow-md border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🎬 <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CineSearch
              </span>
            </h1>
            <p className="text-gray-600">Descubre las mejores películas de todos los tiempos</p>
          </div>
          
          {/* Componente del buscador, que ejecuta handleSearch al enviar */}
          <SearchBar onSearch={(q) => handleSearch(q, 1)} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Si no está buscando, muestra contenido destacado */}
        {!isSearching && (
          <>
            {/* Carrusel de películas destacadas */}
            <section className="mb-12">
              <FeaturedCarousel />
            </section>

            {/* Contenido principal con barra lateral */}
            <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 shadow-md border-b border-blue-200">
              {/* Área principal con invitación a buscar por categorías */}
              <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 shadow-md border-b border-blue-200">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    🌟 Explora Nuestro Catálogo
                  </h2>
                  <p className="text-gray-600">
                    Usa el buscador para encontrar tus películas favoritas
                  </p>
                  
                  {/* Botones para búsquedas rápidas por género */}
                  <div className="mt-6 flex justify-center gap-4">
                    <button
                      onClick={() => handleSearch('action', 1)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
                    >
                      🎯 Acción
                    </button>
                    <button
                      onClick={() => handleSearch('comedy', 1)}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
                    >
                      😄 Comedia
                    </button>
                    <button
                      onClick={() => handleSearch('drama', 1)}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
                    >
                      🎭 Drama
                    </button>
                    <button
                      onClick={() => handleSearch('horror', 1)}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
                    >
                      👻 Terror
                    </button>
                  </div>
                </div>
              </div>

              {/* Barra lateral visible solo en pantallas grandes */}
              <aside className="hidden lg:block">
                <div className="sticky top-8">
                  <FeaturedSidebar />
                </div>
              </aside>
            </div>
          </>
        )}

        {/* Si está buscando y hay resultados, muestra la lista con paginación */}
        {isSearching && movies.length > 0 && (
          <div className="flex gap-8">
            {/* Sección principal de resultados */}
            <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 shadow-md border-b border-blue-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    Resultados para "{query}"
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {totalResults} películas encontradas
                  </p>
                </div>
                
                {/* Botones para limpiar búsqueda y acceso a favoritos */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setQuery('');
                      setMovies([]);
                      setIsSearching(false);
                      setPage(1);
                      setTotalResults(0);
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    🏠 Volver al Inicio
                  </button>
                  
                  <Link 
                    to="/favorites" 
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    ❤️ Ver Favoritos
                  </Link>
                </div>
              </div>

              {/* Componente que muestra la lista de películas */}
              <MovieList movies={movies} />

              {/* Paginación para navegar entre páginas de resultados */}
              <div className="flex justify-center items-center gap-4 mt-12 rounded-lg shadow-lg p-6 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 border border-blue-200">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(prev => prev - 1)}
                  className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                    page === 1 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
                >
                  ⬅ Anterior
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">
                    Página {page} de {totalPages}
                  </span>
                </div>
                
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(prev => prev + 1)}
                  className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                    page === totalPages 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
                >
                  Siguiente ➡
                </button>
              </div>
            </div>

            {/* Barra lateral para resultados de búsqueda, visible solo en pantallas grandes */}
            <aside className="hidden lg:block">
              <div className="sticky top-8">
                <FeaturedSidebar />
              </div>
            </aside>
          </div>
        )}

        {/* Mensaje cuando no hay resultados en la búsqueda */}
        {isSearching && movies.length === 0 && query && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-gray-500 mb-6">
              Intenta con otros términos de búsqueda
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setQuery('');
                  setMovies([]);
                  setIsSearching(false);
                  setPage(1);
                  setTotalResults(0);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
              >
                🏠 Volver al Inicio
              </button>
              <button
                onClick={() => handleSearch('popular', 1)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
              >
                🌟 Ver Populares
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

