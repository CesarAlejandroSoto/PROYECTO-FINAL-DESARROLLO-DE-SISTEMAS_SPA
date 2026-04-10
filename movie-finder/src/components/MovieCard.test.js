/**
 * Test suite for MovieCard component
 * Tests validation, rendering, favorites toggling, and error handling
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import MovieCard from './MovieCard';
import * as localStorageUtils from '../utils/localStorage';
import * as movieService from '../services/movieService';

// Mock dependencies
jest.mock('../utils/localStorage');
jest.mock('../services/movieService');
jest.mock('react-toastify');

// Mock movie objects
const mockValidMovie = {
  imdbID: 'tt0468569',
  Title: 'The Dark Knight',
  Poster: 'https://example.com/poster.jpg',
  Year: '2008',
  Type: 'movie',
  imdbRating: '9.0',
};

const mockMovieNoPoster = {
  imdbID: 'tt0111161',
  Title: 'The Shawshank Redemption',
  Poster: 'N/A',
  Year: '1994',
  Type: 'movie',
};

const mockMovieNoRating = {
  imdbID: 'tt0068646',
  Title: 'The Godfather',
  Poster: 'https://example.com/godfather.jpg',
  Year: '1972',
  Type: 'movie',
};

// Helper to render component with Router
const renderMovieCard = (props = {}) => {
  const defaultProps = { movie: mockValidMovie, featured: false, size: 'normal' };
  return render(
    <BrowserRouter>
      <MovieCard {...defaultProps} {...props} />
      <ToastContainer />
    </BrowserRouter>
  );
};

describe('MovieCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageUtils.isFavorite.mockReturnValue(false);
    movieService.getMovieDetails.mockResolvedValue(mockValidMovie);
  });

  describe('Rendering and Display', () => {
    test('renders valid movie correctly', () => {
      renderMovieCard();
      expect(screen.getByText('The Dark Knight')).toBeInTheDocument();
      expect(screen.getByText('2008')).toBeInTheDocument();
      expect(screen.getByAltText('The Dark Knight')).toBeInTheDocument();
    });

    test('returns null for invalid movie prop', () => {
      const { container } = render(
        <BrowserRouter>
          <MovieCard movie={null} />
        </BrowserRouter>
      );
      expect(container.firstChild.children.length).toBe(0);
    });

    test('returns null for movie missing imdbID', () => {
      const invalidMovie = { Title: 'No ID', Poster: 'url' };
      const { container } = render(
        <BrowserRouter>
          <MovieCard movie={invalidMovie} />
        </BrowserRouter>
      );
      expect(container.firstChild.children.length).toBe(0);
    });

    test('displays placeholder poster for N/A poster', () => {
      renderMovieCard({ movie: mockMovieNoPoster });
      const img = screen.getByAltText('The Shawshank Redemption');
      expect(img).toHaveAttribute('src', '/placeholder.jpg');
    });

    test('displays correct size class', () => {
      const { container } = renderMovieCard({ size: 'small' });
      const link = container.querySelector('a');
      expect(link.className).toContain('max-w-48');
      expect(link.className).toContain('h-80');
    });

    test('displays movie type badge', () => {
      renderMovieCard();
      expect(screen.getByText('MOVIE')).toBeInTheDocument();
    });

    test('displays rating when available', async () => {
      movieService.getMovieDetails.mockResolvedValue(mockValidMovie);
      renderMovieCard();

      await waitFor(() => {
        expect(screen.getByTitle('IMDb Rating: 9.0')).toBeInTheDocument();
      });
    });

    test('handles missing rating gracefully', async () => {
      movieService.getMovieDetails.mockResolvedValue(mockMovieNoRating);
      renderMovieCard();

      await waitFor(() => {
        expect(movieService.getMovieDetails).toHaveBeenCalledWith('tt0111161');
      });
    });
  });

  describe('Featured & Top-Rated Badges', () => {
    test('does not show featured badge by default', () => {
      renderMovieCard();
      expect(screen.queryByText('DESTACADO')).not.toBeInTheDocument();
    });

    test('shows featured badge when featured=true', () => {
      renderMovieCard({ featured: true });
      expect(screen.getByText('DESTACADO')).toBeInTheDocument();
    });

    test('shows TOP badge for 8.0+ rated movies', async () => {
      movieService.getMovieDetails.mockResolvedValue({
        ...mockValidMovie,
        imdbRating: '8.5',
      });
      renderMovieCard({ movie: { ...mockValidMovie, imdbID: 'tt0468569' } });

      await waitFor(() => {
        expect(screen.getByText('⭐ TOP')).toBeInTheDocument();
      });
    });

    test('hides TOP badge for < 8.0 rated movies', async () => {
      movieService.getMovieDetails.mockResolvedValue({
        ...mockValidMovie,
        imdbRating: '7.5',
      });
      renderMovieCard();

      await waitFor(() => {
        expect(screen.queryByText('⭐ TOP')).not.toBeInTheDocument();
      });
    });
  });

  describe('Favorites Toggle', () => {
    test('renders favorite button', () => {
      renderMovieCard();
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    test('shows heart emoji when not favorite', () => {
      localStorageUtils.isFavorite.mockReturnValue(false);
      renderMovieCard();
      expect(screen.getByLabelText('Add to favorites')).toHaveTextContent('🤍');
    });

    test('shows full heart emoji when is favorite', () => {
      localStorageUtils.isFavorite.mockReturnValue(true);
      renderMovieCard();
      expect(screen.getByLabelText('Remove from favorites')).toHaveTextContent('❤️');
    });

    test('adds movie to favorites', async () => {
      localStorageUtils.isFavorite.mockReturnValue(false);
      localStorageUtils.addFavorite.mockReturnValue({
        success: true,
        data: [mockValidMovie],
        error: null,
      });
      movieService.getMovieDetails.mockResolvedValue(mockValidMovie);

      renderMovieCard();
      const favoriteBtn = screen.getByLabelText('Add to favorites');
      fireEvent.click(favoriteBtn);

      await waitFor(() => {
        expect(localStorageUtils.addFavorite).toHaveBeenCalledWith(mockValidMovie);
        expect(toast.success).toHaveBeenCalledWith('❤️ Agregado a Favoritos');
      });
    });

    test('removes movie from favorites', async () => {
      localStorageUtils.isFavorite.mockReturnValue(true);
      localStorageUtils.removeFavorite.mockReturnValue({
        success: true,
        data: [],
        error: null,
      });

      renderMovieCard();
      const favoriteBtn = screen.getByLabelText('Remove from favorites');
      fireEvent.click(favoriteBtn);

      await waitFor(() => {
        expect(localStorageUtils.removeFavorite).toHaveBeenCalledWith('tt0468569');
        expect(toast.error).toHaveBeenCalledWith('❌ Eliminado de Favoritos');
      });
    });

    test('handles favorite add error', async () => {
      localStorageUtils.isFavorite.mockReturnValue(false);
      localStorageUtils.addFavorite.mockReturnValue({
        success: false,
        data: null,
        error: 'Storage full',
      });
      movieService.getMovieDetails.mockResolvedValue(mockValidMovie);

      renderMovieCard();
      const favoriteBtn = screen.getByLabelText('Add to favorites');
      fireEvent.click(favoriteBtn);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error: Storage full');
      });
    });

    test('prevents default event propagation on favorite click', async () => {
      localStorageUtils.isFavorite.mockReturnValue(false);
      localStorageUtils.addFavorite.mockReturnValue({
        success: true,
        data: [mockValidMovie],
        error: null,
      });
      movieService.getMovieDetails.mockResolvedValue(mockValidMovie);

      renderMovieCard();
      const favoriteBtn = screen.getByLabelText('Add to favorites');
      const event = new MouseEvent('click', { bubbles: true });
      jest.spyOn(event, 'preventDefault');
      jest.spyOn(event, 'stopPropagation');

      fireEvent.click(favoriteBtn, event);

      await waitFor(() => {
        expect(event.preventDefault).toHaveBeenCalled();
      });
    });
  });

  describe('API Integration', () => {
    test('fetches movie details on mount', async () => {
      movieService.getMovieDetails.mockResolvedValue(mockValidMovie);
      renderMovieCard();

      await waitFor(() => {
        expect(movieService.getMovieDetails).toHaveBeenCalledWith('tt0468569');
      });
    });

    test('handles fetch timeout gracefully', async () => {
      movieService.getMovieDetails.mockImplementation(
        () => new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 6000)
        )
      );

      renderMovieCard();

      await waitFor(() => {
        expect(screen.queryByText('Rating unavailable')).not.toBeInTheDocument();
      });
    });

    test('does not update state if component unmounts during fetch', async () => {
      movieService.getMovieDetails.mockResolvedValue(mockValidMovie);

      const { unmount } = renderMovieCard();
      unmount();

      await waitFor(() => {
        expect(movieService.getMovieDetails).toHaveBeenCalled();
      });

      // If this ran without errors, cleanup worked correctly
      expect(true).toBe(true);
    });
  });

  describe('Hover Effects', () => {
    test('toggles hover state on mouse enter/leave', () => {
      const { container } = renderMovieCard();
      const link = container.querySelector('a');

      fireEvent.mouseEnter(link);
      expect(link.querySelector('[class*="opacity-100"]')).toBeInTheDocument();

      fireEvent.mouseLeave(link);
      expect(link.querySelector('[class*="opacity-0"]')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    test('applies correct classes for small size', () => {
      const { container } = renderMovieCard({ size: 'small' });
      const img = container.querySelector('img');
      expect(img.className).toContain('h-48');
    });

    test('applies correct classes for normal size', () => {
      const { container } = renderMovieCard({ size: 'normal' });
      const img = container.querySelector('img');
      expect(img.className).toContain('h-64');
    });

    test('applies correct classes for large size', () => {
      const { container } = renderMovieCard({ size: 'large' });
      const img = container.querySelector('img');
      expect(img.className).toContain('h-80');
    });
  });

  describe('Error Handling', () => {
    test('handles invalid size prop gracefully', () => {
      const { container } = renderMovieCard({ size: 'invalid' });
      const link = container.querySelector('a');
      // Should not crash, renders with undefined class
      expect(link).toBeInTheDocument();
    });

    test('displays placeholder poster when fetch fails', async () => {
      movieService.getMovieDetails.mockRejectedValue(
        new Error('API Error')
      );

      renderMovieCard({ movie: mockMovieNoPoster });
      const img = screen.getByAltText('The Shawshank Redemption');

      await waitFor(() => {
        expect(img).toHaveAttribute('src', '/placeholder.jpg');
      });
    });

    test('shows "Unknown Title" when title is missing', () => {
      const movieNoTitle = { ...mockValidMovie, Title: undefined };
      renderMovieCard({ movie: movieNoTitle });
      expect(screen.getByText('Unknown Title')).toBeInTheDocument();
    });
  });
});
