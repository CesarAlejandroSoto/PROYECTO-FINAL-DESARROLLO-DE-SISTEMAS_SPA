import MovieCard from './MovieCard';

// Componente para mostrar una lista de películas en formato grilla
const MovieList = ({ movies }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 px-4">
    {/* Recorremos el arreglo de películas y renderizamos una MovieCard para cada una */}
    {movies.map(movie => (
      <MovieCard key={movie.imdbID} movie={movie} />
    ))}
  </div>
);

export default MovieList;

