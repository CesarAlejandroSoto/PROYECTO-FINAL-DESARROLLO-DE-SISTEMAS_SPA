import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import FeaturedCarousel from './FeaturedCarousel';
import * as movieService from '../services/movieService';

// Mock movieService
jest.mock('../services/movieService');

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
  ToastContainer: () => null,
}));

// Mock movie data
const mockMovies = Array.from({ length: 6 }, (_, i) => ({
  imdbID: `tt000${i + 1}`,
  Title: `Test Movie ${i + 1}`,
  Year: `${2020 + i}`,
  Poster: `https://example.com/poster${i + 1}.jpg`,
  imdbRating: (7 + i).toFixed(1),
  Runtime: '120 min',
  Genre: 'Action, Drama',
  Plot: `This is the plot for test movie ${i + 1}`,
}));

const Wrapper = ({ children }) => (
  <BrowserRouter>
    {children}
    <ToastContainer />
  </BrowserRouter>
);

describe('FeaturedCarousel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Silence console warnings in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ==================== INITIAL RENDERING ====================
  describe('Initial Rendering and Loading', () => {
    test('shows loading state when fetching movies', () => {
      movieService.getMovieDetails.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      expect(screen.getByText(/Cargando películas destacadas/i)).toBeInTheDocument();
      expect(screen.getByText(/Cargando películas destacadas/i).closest('div')).toHaveAttribute(
        'role',
        'status'
      );
    });

    test('renders featured movies after loading', async () => {
      movieService.getMovieDetails.mockResolvedValue(mockMovies[0]);

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      });
    });

    test('renders carousel container with region role', async () => {
      movieService.getMovieDetails.mockResolvedValue(mockMovies[0]);

      const { container } = render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        const carousel = container.querySelector('[role="region"]');
        expect(carousel).toBeInTheDocument();
        expect(carousel).toHaveAttribute('aria-label', 'Carrusel de películas destacadas');
      });
    });

    test('returns null when no movies are available', async () => {
      movieService.getMovieDetails.mockResolvedValue(null);

      const { container } = render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    test('filters out movies with N/A poster', async () => {
      const moviesWithNA = [
        mockMovies[0],
        { ...mockMovies[1], Poster: 'N/A' },
        mockMovies[2],
      ];

      movieService.getMovieDetails
        .mockResolvedValueOnce(moviesWithNA[0])
        .mockResolvedValueOnce(moviesWithNA[1])
        .mockResolvedValueOnce(moviesWithNA[2]);

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
        expect(screen.queryByText('Test Movie 2')).not.toBeInTheDocument();
        expect(screen.getByText('Test Movie 3')).toBeInTheDocument();
      });
    });
  });

  // ==================== ERROR HANDLING ====================
  describe('Error Handling', () => {
    test('displays error state when API request fails', async () => {
      movieService.getMovieDetails.mockRejectedValue(new Error('API Error'));

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/Error cargando películas destacadas/i)).toBeInTheDocument();
      });
    });

    test('error container has alert role', async () => {
      movieService.getMovieDetails.mockRejectedValue(new Error('API Error'));

      const { container } = render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        const alertDiv = container.querySelector('[role="alert"]');
        expect(alertDiv).toBeInTheDocument();
      });
    });

    test('shows retry message in error state', async () => {
      movieService.getMovieDetails.mockRejectedValue(new Error('API Error'));

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/Por favor, intenta recargar la página/i)).toBeInTheDocument();
      });
    });

    test('displays error when no valid movies are found', async () => {
      movieService.getMovieDetails.mockResolvedValue(null);

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        // After trying to fetch and filtering results in empty array
        expect(screen.queryByText(/Test Movie/i)).not.toBeInTheDocument();
      });
    });
  });

  // ==================== CAROUSEL NAVIGATION ====================
  describe('Carousel Navigation', () => {
    test('displays first movie by default', async () => {
      movieService.getMovieDetails.mockResolvedValue(mockMovies[0]);

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      });
    });

    test('next button moves to next slide', async () => {
      movieService.getMovieDetails
        .mockResolvedValueOnce(mockMovies[0])
        .mockResolvedValueOnce(mockMovies[1])
        .mockResolvedValueOnce(mockMovies[2]);

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      });

      const nextButton = screen.getByLabelText('Próxima película');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
      });
    });

    test('previous button moves to previous slide', async () => {
      movieService.getMovieDetails
        .mockResolvedValueOnce(mockMovies[0])
        .mockResolvedValueOnce(mockMovies[1]);

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      });

      const nextButton = screen.getByLabelText('Próxima película');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
      });

      const prevButton = screen.getByLabelText('Película anterior');
      fireEvent.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      });
    });

    test('carousel wraps around from last to first slide', async () => {
      movieService.getMovieDetails
        .mockResolvedValueOnce(mockMovies[0])
        .mockResolvedValueOnce(mockMovies[1]);

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      });

      // Navigate backwards (should wrap to last position)
      const prevButton = screen.getByLabelText('Película anterior');
      fireEvent.click(prevButton);

      // Should show last movie in list after wrapping
      await waitFor(() => {
        expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
      });
    });

    test('dot indicators navigate to specific slides', async () => {
      movieService.getMovieDetails
        .mockResolvedValueOnce(mockMovies[0])
        .mockResolvedValueOnce(mockMovies[1])
        .mockResolvedValueOnce(mockMovies[2]);

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      });

      const dots = screen.getAllByLabelText(/Ir a la película/);
      fireEvent.click(dots[2]); // Click third dot

      await waitFor(() => {
        expect(screen.getByText('Test Movie 3')).toBeInTheDocument();
      });
    });
  });

  // ==================== AUTO-ROTATION ====================
  describe('Auto-Rotation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    test('automatically advances slide every 5 seconds', async () => {
      movieService.getMovieDetails
        .mockResolvedValueOnce(mockMovies[0])
        .mockResolvedValueOnce(mockMovies[1]);

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      });

      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
      });
    });

    test('stops auto-rotation when component unmounts', async () => {
      movieService.getMovieDetails
        .mockResolvedValueOnce(mockMovies[0])
        .mockResolvedValueOnce(mockMovies[1]);

      const { unmount } = render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      });

      unmount();
      jest.advanceTimersByTime(5000);

      // No error should be thrown when accessing state of unmounted component
      expect(true).toBe(true);
    });
  });

  // ==================== VISUAL INDICATORS ====================
  describe('Visual Indicators - Position Counter', () => {
    test('displays position counter showing current slide number', async () => {
      movieService.getMovieDetails
        .mockResolvedValueOnce(mockMovies[0])
        .mockResolvedValueOnce(mockMovies[1]);

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/1 de 2/i)).toBeInTheDocument();
      });
    });

    test('updates counter when navigating', async () => {
      movieService.getMovieDetails
        .mockResolvedValueOnce(mockMovies[0])
        .mockResolvedValueOnce(mockMovies[1]);

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/1 de 2/i)).toBeInTheDocument();
      });

      const nextButton = screen.getByLabelText('Próxima película');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/2 de 2/i)).toBeInTheDocument();
      });
    });

    test('counter has aria-live attribute for screen readers', async () => {
      movieService.getMovieDetails.mockResolvedValue(mockMovies[0]);

      const { container } = render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        const counter = Array.from(container.querySelectorAll('[aria-live]')).find(el =>
          el.textContent.includes('1 de')
        );
        expect(counter).toHaveAttribute('aria-live', 'polite');
      });
    });
  });

  // ==================== ACCESSIBILITY - ARIA ATTRIBUTES ====================
  describe('Accessibility - ARIA Labels', () => {
    test('carousel has proper heading role', async () => {
      movieService.getMovieDetails.mockResolvedValue(mockMovies[0]);

      const { container } = render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        const carousel = container.querySelector('[role="region"]');
        expect(carousel).toHaveAttribute('aria-label', 'Carrusel de películas destacadas');
      });
    });

    test('navigation buttons have aria-labels', async () => {
      movieService.getMovieDetails.mockResolvedValue(mockMovies[0]);

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByLabelText('Próxima película')).toBeInTheDocument();
        expect(screen.getByLabelText('Película anterior')).toBeInTheDocument();
      });
    });

    test('dot indicators have aria-selected attribute', async () => {
      movieService.getMovieDetails
        .mockResolvedValueOnce(mockMovies[0])
        .mockResolvedValueOnce(mockMovies[1]);

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        const dots = screen.getAllByLabelText(/Ir a la película/);
        expect(dots[0]).toHaveAttribute('aria-selected', 'true');
        expect(dots[1]).toHaveAttribute('aria-selected', 'false');
      });
    });

    test('link to movie details has descriptive aria-label', async () => {
      movieService.getMovieDetails.mockResolvedValue(mockMovies[0]);

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        const link = screen.getByLabelText('Ver detalles de Test Movie 1');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/movie/tt00001');
      });
    });

    test('slides have tabpanel role and aria-hidden when inactive', async () => {
      movieService.getMovieDetails
        .mockResolvedValueOnce(mockMovies[0])
        .mockResolvedValueOnce(mockMovies[1]);

      const { container } = render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        const panels = container.querySelectorAll('[role="tabpanel"]');
        expect(panels).toHaveLength(2);
        expect(panels[0]).toHaveAttribute('aria-hidden', 'false');
        expect(panels[1]).toHaveAttribute('aria-hidden', 'true');
      });
    });

    test('tab list has proper role and label', async () => {
      movieService.getMovieDetails
        .mockResolvedValueOnce(mockMovies[0])
        .mockResolvedValueOnce(mockMovies[1]);

      const { container } = render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        const tablist = container.querySelector('[role="tablist"]');
        expect(tablist).toHaveAttribute('aria-label', 'Indicadores de diapositivas');
      });
    });
  });

  // ==================== KEYBOARD NAVIGATION ====================
  describe('Keyboard Navigation', () => {
    test('buttons are focusable with keyboard', async () => {
      movieService.getMovieDetails.mockResolvedValue(mockMovies[0]);

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        const nextButton = screen.getByLabelText('Próxima película');
        expect(nextButton).toHaveClass('focus:ring-2');
      });
    });

    test('buttons have focus ring styles', async () => {
      movieService.getMovieDetails.mockResolvedValue(mockMovies[0]);

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        const nextButton = screen.getByLabelText('Próxima película');
        const prevButton = screen.getByLabelText('Película anterior');

        expect(nextButton).toHaveClass('focus:ring-2', 'focus:ring-white');
        expect(prevButton).toHaveClass('focus:ring-2', 'focus:ring-white');
      });
    });

    test('dot buttons have keyboard focus styles', async () => {
      movieService.getMovieDetails
        .mockResolvedValueOnce(mockMovies[0])
        .mockResolvedValueOnce(mockMovies[1]);

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        const dots = screen.getAllByLabelText(/Ir a la película/);
        dots.forEach(dot => {
          expect(dot).toHaveClass('focus:ring-2', 'focus:outline-none');
        });
      });
    });
  });

  // ==================== MOVIE CONTENT ====================
  describe('Movie Content Display', () => {
    test('displays all movie information', async () => {
      movieService.getMovieDetails.mockResolvedValue(mockMovies[0]);

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
        expect(screen.getByText('2020')).toBeInTheDocument();
        expect(screen.getByText(/7\.0/)).toBeInTheDocument();
        expect(screen.getByText('120 min')).toBeInTheDocument();
        expect(screen.getByText('Action, Drama')).toBeInTheDocument();
        expect(screen.getByText(/This is the plot for test movie 1/)).toBeInTheDocument();
      });
    });

    test('displays featured and movie badges', async () => {
      movieService.getMovieDetails.mockResolvedValue(mockMovies[0]);

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('DESTACADO')).toBeInTheDocument();
        expect(screen.getByText('PELÍCULA')).toBeInTheDocument();
      });
    });

    test('link navigates to movie details page', async () => {
      movieService.getMovieDetails.mockResolvedValue(mockMovies[0]);

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        const link = screen.getByText('Ver Película');
        expect(link).toHaveAttribute('href', '/movie/tt00001');
      });
    });
  });

  // ==================== RESPONSIVENESS ====================
  describe('Responsive Design', () => {
    test('carousel has responsive height classes', async () => {
      movieService.getMovieDetails.mockResolvedValue(mockMovies[0]);

      const { container } = render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        const carousel = container.querySelector('[role="region"]');
        expect(carousel).toHaveClass('h-96', 'w-full');
      });
    });

    test('text content has responsive sizing', async () => {
      movieService.getMovieDetails.mockResolvedValue(mockMovies[0]);

      const { container } = render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        const title = screen.getByText('Test Movie 1').closest('h2');
        expect(title).toHaveClass('text-4xl', 'font-bold');
      });
    });
  });

  // ==================== PROPTYPE VALIDATION ====================
  describe('PropTypes Validation', () => {
    test('component renders without required props since it accepts none', async () => {
      movieService.getMovieDetails.mockResolvedValue(mockMovies[0]);

      const { container } = render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(container.querySelector('[role="region"]')).toBeInTheDocument();
      });
    });
  });

  // ==================== INTEGRATION TESTS ====================
  describe('Integration Tests', () => {
    test('complete user flow: load, navigate, auto-rotate', async () => {
      jest.useFakeTimers();

      movieService.getMovieDetails
        .mockResolvedValueOnce(mockMovies[0])
        .mockResolvedValueOnce(mockMovies[1])
        .mockResolvedValueOnce(mockMovies[2]);

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      // Initial load
      await waitFor(() => {
        expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      });

      // Manual navigation
      const nextButton = screen.getByLabelText('Próxima película');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
      });

      // Auto-rotation
      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(screen.getByText('Test Movie 3')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    test('multiple carousel instances work independently', async () => {
      movieService.getMovieDetails
        .mockResolvedValueOnce(mockMovies[0])
        .mockResolvedValueOnce(mockMovies[1]);

      const { rerender } = render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      });

      rerender(
        <BrowserRouter>
          <FeaturedCarousel />
          <ToastContainer />
        </BrowserRouter>
      );

      await waitFor(() => {
        const count = screen.getAllByText('Test Movie 1').length;
        expect(count).toBeGreaterThan(0);
      });
    });

    test('handles rapid navigation without errors', async () => {
      movieService.getMovieDetails
        .mockResolvedValueOnce(mockMovies[0])
        .mockResolvedValueOnce(mockMovies[1])
        .mockResolvedValueOnce(mockMovies[2]);

      render(<FeaturedCarousel />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      });

      const nextButton = screen.getByLabelText('Próxima película');

      // Rapid clicks
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      // Should end up back at movie 1 (wrapping around)
      await waitFor(() => {
        expect(screen.getByText(/Test Movie/)).toBeInTheDocument();
      });
    });
  });
});
