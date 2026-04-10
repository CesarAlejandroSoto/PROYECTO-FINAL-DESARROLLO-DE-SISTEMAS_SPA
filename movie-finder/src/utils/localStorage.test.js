/**
 * Test suite for localStorage utility module
 * Tests all CRUD operations, validation, and error handling
 */

import {
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  getFavoritesCount,
  clearFavorites,
} from './localStorage';

// Mock data
const mockMovie1 = {
  imdbID: 'tt0068646',
  Title: 'The Godfather',
  Poster: 'https://example.com/godfather.jpg',
  Year: '1972',
  Type: 'movie',
};

const mockMovie2 = {
  imdbID: 'tt0071562',
  Title: 'The Godfather Part II',
  Poster: 'https://example.com/godfather2.jpg',
  Year: '1974',
  Type: 'movie',
};

const invalidMovie1 = {
  Title: 'No IMDb ID',
  Poster: 'url',
};

const invalidMovie2 = {
  imdbID: 'tt123',
  // Missing Title
  Poster: 'url',
};

const invalidMovie3 = {
  imdbID: 'tt123',
  Title: 'Valid Title',
  // Missing Poster
};

// Helper to clear localStorage before each test
const clearStorage = () => {
  localStorage.clear();
};

describe('localStorage utilities', () => {
  beforeEach(clearStorage);
  afterEach(clearStorage);

  describe('getFavorites()', () => {
    test('returns empty list when no favorites stored', () => {
      const result = getFavorites();
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    test('returns stored favorites', () => {
      localStorage.setItem('favorite_movies', JSON.stringify([mockMovie1]));
      const result = getFavorites();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].imdbID).toBe('tt0068646');
    });

    test('handles corrupted JSON gracefully', () => {
      localStorage.setItem('favorite_movies', 'INVALID JSON{]');
      const result = getFavorites();
      expect(result.success).toBe(false);
      expect(result.error).toContain('Corrupted');
      expect(result.data).toEqual([]);
    });

    test('cleans invalid movie records from storage', () => {
      const mixed = [mockMovie1, { invalid: 'movie' }, mockMovie2];
      localStorage.setItem('favorite_movies', JSON.stringify(mixed));
      const result = getFavorites();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].imdbID).toBe('tt0068646');
      expect(result.data[1].imdbID).toBe('tt0071562');
    });

    test('handles non-array stored data', () => {
      localStorage.setItem('favorite_movies', JSON.stringify({ invalid: 'object' }));
      const result = getFavorites();
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('addFavorite()', () => {
    test('adds a valid movie to empty list', () => {
      const result = addFavorite(mockMovie1);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].imdbID).toBe('tt0068646');
    });

    test('prevents duplicate movies', () => {
      addFavorite(mockMovie1);
      const result = addFavorite(mockMovie1);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    test('adds multiple different movies', () => {
      addFavorite(mockMovie1);
      const result = addFavorite(mockMovie2);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    test('rejects movie without imdbID', () => {
      const result = addFavorite(invalidMovie1);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid movie');
      expect(result.data).toBeNull();
    });

    test('rejects movie without Title', () => {
      const result = addFavorite(invalidMovie2);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid movie');
    });

    test('rejects movie without Poster', () => {
      const result = addFavorite(invalidMovie3);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid movie');
    });

    test('rejects null input', () => {
      const result = addFavorite(null);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid movie');
    });

    test('rejects undefined input', () => {
      const result = addFavorite(undefined);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid movie');
    });

    test('rejects empty string imdbID', () => {
      const movie = { ...mockMovie1, imdbID: '   ' };
      const result = addFavorite(movie);
      expect(result.success).toBe(false);
    });

    test('rejects empty string Title', () => {
      const movie = { ...mockMovie1, Title: '   ' };
      const result = addFavorite(movie);
      expect(result.success).toBe(false);
    });

    test('persists data to localStorage', () => {
      addFavorite(mockMovie1);
      const stored = JSON.parse(localStorage.getItem('favorite_movies'));
      expect(stored).toHaveLength(1);
      expect(stored[0].imdbID).toBe('tt0068646');
    });
  });

  describe('removeFavorite()', () => {
    beforeEach(() => {
      addFavorite(mockMovie1);
      addFavorite(mockMovie2);
    });

    test('removes existing movie', () => {
      const result = removeFavorite('tt0068646');
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].imdbID).toBe('tt0071562');
    });

    test('handles removal of non-existent movie', () => {
      const result = removeFavorite('tt9999999');
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    test('removes all movies when called sequentially', () => {
      removeFavorite('tt0068646');
      const result = removeFavorite('tt0071562');
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });

    test('rejects null ID', () => {
      const result = removeFavorite(null);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid ID');
    });

    test('rejects empty string ID', () => {
      const result = removeFavorite('   ');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid ID');
    });

    test('rejects non-string ID', () => {
      const result = removeFavorite(12345);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid ID');
    });

    test('persists changes to localStorage', () => {
      removeFavorite('tt0068646');
      const stored = JSON.parse(localStorage.getItem('favorite_movies'));
      expect(stored).toHaveLength(1);
      expect(stored[0].imdbID).toBe('tt0071562');
    });
  });

  describe('isFavorite()', () => {
    beforeEach(() => {
      addFavorite(mockMovie1);
      addFavorite(mockMovie2);
    });

    test('returns true for existing movie', () => {
      expect(isFavorite('tt0068646')).toBe(true);
    });

    test('returns false for non-existent movie', () => {
      expect(isFavorite('tt9999999')).toBe(false);
    });

    test('returns false for empty list', () => {
      clearFavorites();
      expect(isFavorite('tt0068646')).toBe(false);
    });

    test('returns false for null ID', () => {
      expect(isFavorite(null)).toBe(false);
    });

    test('returns false for empty string ID', () => {
      expect(isFavorite('   ')).toBe(false);
    });

    test('returns false for undefined ID', () => {
      expect(isFavorite(undefined)).toBe(false);
    });

    test('handles corrupted storage gracefully', () => {
      localStorage.setItem('favorite_movies', 'INVALID');
      expect(isFavorite('tt0068646')).toBe(false);
    });
  });

  describe('getFavoritesCount()', () => {
    test('returns 0 for empty list', () => {
      expect(getFavoritesCount()).toBe(0);
    });

    test('returns correct count after adding movies', () => {
      addFavorite(mockMovie1);
      expect(getFavoritesCount()).toBe(1);
      addFavorite(mockMovie2);
      expect(getFavoritesCount()).toBe(2);
    });

    test('returns correct count after removing movies', () => {
      addFavorite(mockMovie1);
      addFavorite(mockMovie2);
      removeFavorite('tt0068646');
      expect(getFavoritesCount()).toBe(1);
    });

    test('returns 0 for corrupted storage', () => {
      localStorage.setItem('favorite_movies', 'INVALID JSON');
      expect(getFavoritesCount()).toBe(0);
    });
  });

  describe('clearFavorites()', () => {
    beforeEach(() => {
      addFavorite(mockMovie1);
      addFavorite(mockMovie2);
    });

    test('clears all favorites', () => {
      const result = clearFavorites();
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(getFavorites().data).toHaveLength(0);
    });

    test('returns success result', () => {
      const result = clearFavorites();
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    test('can add movies after clearing', () => {
      clearFavorites();
      const result = addFavorite(mockMovie1);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('Integration tests', () => {
    test('complete workflow: add, check, count, remove, verify', () => {
      // Add
      addFavorite(mockMovie1);
      addFavorite(mockMovie2);

      // Check and count
      expect(isFavorite('tt0068646')).toBe(true);
      expect(getFavoritesCount()).toBe(2);

      // Remove
      removeFavorite('tt0068646');

      // Verify
      expect(isFavorite('tt0068646')).toBe(false);
      expect(getFavoritesCount()).toBe(1);
      expect(isFavorite('tt0071562')).toBe(true);
    });

    test('handles rapid operations', () => {
      const operations = [];
      for (let i = 0; i < 5; i++) {
        operations.push(
          addFavorite({
            imdbID: `tt${i}`,
            Title: `Movie ${i}`,
            Poster: `url${i}`,
          })
        );
      }

      expect(getFavoritesCount()).toBe(5);
      expect(isFavorite('tt2')).toBe(true);

      removeFavorite('tt2');
      expect(getFavoritesCount()).toBe(4);
      expect(isFavorite('tt2')).toBe(false);
    });
  });
});
