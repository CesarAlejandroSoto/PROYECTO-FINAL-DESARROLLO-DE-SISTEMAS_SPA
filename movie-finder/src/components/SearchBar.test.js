/**
 * Test suite for SearchBar component
 * Tests search functionality, history management, and UI interactions
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('SearchBar Component', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Basic Rendering', () => {
    test('renders search input with correct placeholder', () => {
      render(<SearchBar onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText('🔍 Buscar película...');
      expect(input).toBeInTheDocument();
    });

    test('renders search button', () => {
      render(<SearchBar onSearch={mockOnSearch} />);
      expect(screen.getByRole('button', { name: /buscar/i })).toBeInTheDocument();
    });

    test('input is initially empty', () => {
      render(<SearchBar onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText('🔍 Buscar película...');
      expect(input.value).toBe('');
    });
  });

  describe('Search Functionality', () => {
    test('calls onSearch with query when form is submitted', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText('🔍 Buscar película...');
      const button = screen.getByRole('button', { name: /buscar/i });

      await userEvent.type(input, 'avatar');
      fireEvent.click(button);

      expect(mockOnSearch).toHaveBeenCalledWith('avatar');
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
    });

    test('clears input after successful search', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText('🔍 Buscar película...');
      const form = input.closest('form');

      await userEvent.type(input, 'batman');
      fireEvent.submit(form);

      expect(input.value).toBe('');
    });

    test('ignores empty search query', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);
      const button = screen.getByRole('button', { name: /buscar/i });

      fireEvent.click(button);

      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    test('ignores whitespace-only search query', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText('🔍 Buscar película...');
      const form = input.closest('form');

      await userEvent.type(input, '   ');
      fireEvent.submit(form);

      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    test('allows search on Enter key press', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText('🔍 Buscar película...');

      await userEvent.type(input, 'matrix{enter}');

      expect(mockOnSearch).toHaveBeenCalledWith('matrix');
    });
  });

  describe('Search History', () => {
    test('shows history after first search', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText('🔍 Buscar película...');

      await userEvent.type(input, 'avatar{enter}');

      // Focus input to show history
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('avatar')).toBeInTheDocument();
      });
    });

    test('limits history to 5 items', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText('🔍 Buscar película...');

      // Add 6 searches
      for (let i = 1; i <= 6; i++) {
        await userEvent.clear(input);
        await userEvent.type(input, `movie${i}{enter}`);
      }

      fireEvent.focus(input);

      await waitFor(() => {
        // Only last 5 should be visible (movie6, movie5, movie4, movie3, movie2)
        expect(screen.getByText('movie6')).toBeInTheDocument();
        expect(screen.queryByText('movie1')).not.toBeInTheDocument();
      });
    });

    test('prevents duplicate entries in history', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText('🔍 Buscar película...');

      // Search same term twice
      await userEvent.type(input, 'avatar{enter}');
      await userEvent.type(input, 'avatar{enter}');

      fireEvent.focus(input);

      await waitFor(() => {
        const avatarItems = screen.getAllByText('avatar');
        // Should only have 1 avatar in history (+ maybe in other elements)
        const historyItems = avatarItems.filter(el => 
          el.textContent.includes('🔍 avatar')
        );
        expect(historyItems.length).toBe(1);
      });
    });

    test('persists history to localStorage', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText('🔍 Buscar película...');

      await userEvent.type(input, 'inception{enter}');

      const saved = JSON.parse(localStorage.getItem('searchHistory'));
      expect(saved).toContain('inception');
    });

    test('loads history from localStorage on mount', () => {
      localStorage.setItem('searchHistory', JSON.stringify(['matrix', 'avatar']));
      render(<SearchBar onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText('🔍 Buscar película...');

      fireEvent.focus(input);

      expect(screen.getByText('matrix')).toBeInTheDocument();
      expect(screen.getByText('avatar')).toBeInTheDocument();
    });
  });

  describe('History Interaction', () => {
    test('searches when history item is clicked', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText('🔍 Buscar película...');

      // Add to history
      await userEvent.type(input, 'avatar{enter}');
      fireEvent.focus(input);

      // Click history item
      await waitFor(() => {
        const historyItem = screen.getByText('avatar');
        fireEvent.click(historyItem);
      });

      expect(mockOnSearch).toHaveBeenCalledWith('avatar');
    });

    test('removes individual history item when delete button clicked', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText('🔍 Buscar película...');

      // Add two searches
      await userEvent.type(input, 'avatar{enter}');
      await userEvent.type(input, 'matrix{enter}');

      fireEvent.focus(input);

      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle(/eliminar esta búsqueda/i);
        expect(deleteButtons.length).toBe(2);
        // Click first delete button
        fireEvent.click(deleteButtons[0]);
      });

      // One item should be gone
      expect(screen.queryByText('avatar')).not.toBeInTheDocument();
      expect(screen.getByText('matrix')).toBeInTheDocument();
    });

    test('clears all history when clear button clicked', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText('🔍 Buscar película...');

      // Add searches
      await userEvent.type(input, 'avatar{enter}');
      await userEvent.type(input, 'matrix{enter}');

      fireEvent.focus(input);

      await waitFor(() => {
        const clearButton = screen.getByRole('button', { name: /limpiar/i });
        fireEvent.click(clearButton);
      });

      // History should be empty now
      expect(localStorage.getItem('searchHistory')).toBeNull();
    });

    test('shows message when history is empty', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText('🔍 Buscar película...');

      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/sin búsquedas previas/i)).toBeInTheDocument();
      });
    });
  });

  describe('UI State Management', () => {
    test('shows history dropdown on input focus', () => {
      localStorage.setItem('searchHistory', JSON.stringify(['avatar']));
      render(<SearchBar onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText('🔍 Buscar película...');

      fireEvent.focus(input);

      expect(screen.getByText('avatar')).toBeInTheDocument();
    });

    test('closes history when clicking outside', async () => {
      localStorage.setItem('searchHistory', JSON.stringify(['avatar']));
      const { container } = render(<SearchBar onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText('🔍 Buscar película...');

      fireEvent.focus(input);
      expect(screen.getByText('avatar')).toBeInTheDocument();

      // Click on backdrop
      const backdrop = container.querySelector('.fixed.inset-0');
      fireEvent.click(backdrop);

      expect(screen.queryByText('avatar')).not.toBeInTheDocument();
    });
  });

  describe('PropTypes', () => {
    test('requires onSearch prop', () => {
      // Should warn if onSearch is missing
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      render(<SearchBar />);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Input Changes', () => {
    test('updates input value as user types', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText('🔍 Buscar película...');

      await userEvent.type(input, 'avatar');

      expect(input.value).toBe('avatar');
    });

    test('input updates are reflected in real-time', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);
      const input = screen.getByPlaceholderText('🔍 Buscar película...');

      await userEvent.type(input, 'a');
      expect(input.value).toBe('a');

      await userEvent.type(input, 'v');
      expect(input.value).toBe('av');
    });
  });
});
