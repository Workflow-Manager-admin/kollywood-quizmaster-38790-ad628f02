//
// Kollywood QuizMaster: TMDB API utility/service
//
// This file provides reusable functions to interact with The Movie Database (TMDB) API
// for fetching movie details, posters, and other movie data.
//
// TMDB API docs: https://developer.themoviedb.org/reference/overview
//

const TMDB_API_KEY = "5bc67d3b06aecbd18121a3cbbc16eb59";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

/**
 * Helper for GET requests to TMDB API with API key attached.
 * @param {string} endpoint Relative TMDB API endpoint, e.g. '/search/movie'
 * @param {object} params Query params as object (excluding API key)
 * @returns {Promise<object>} API response JSON
 */
async function tmdbGet(endpoint, params = {}) {
  const url = new URL(TMDB_BASE_URL + endpoint);
  // Always include API key
  url.searchParams.append("api_key", TMDB_API_KEY);
  // Append any other params
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// PUBLIC_INTERFACE
/**
 * Search movies by title.
 * @param {string} query Movie title to search for
 * @param {object} options Optional TMDB search params (year, language, etc.)
 * @returns {Promise<object>} Search result object
 */
export async function searchMovies(query, options = {}) {
  return tmdbGet("/search/movie", { query, ...options });
}

// PUBLIC_INTERFACE
/**
 * Get details for a movie by TMDB movie ID.
 * @param {number|string} movieId TMDB movie ID
 * @param {object} options Optional TMDB params (append_to_response, etc.)
 * @returns {Promise<object>} Movie details object
 */
export async function getMovieDetails(movieId, options = {}) {
  return tmdbGet(`/movie/${movieId}`, { ...options });
}

// PUBLIC_INTERFACE
/**
 * Get movie images (posters, backdrops).
 * @param {number|string} movieId TMDB movie ID
 * @param {object} options Optional TMDB params (language, etc.)
 * @returns {Promise<object>} Images object (with posters and backdrops arrays)
 */
export async function getMovieImages(movieId, options = {}) {
  return tmdbGet(`/movie/${movieId}/images`, { ...options });
}

// PUBLIC_INTERFACE
/**
 * Get the full TMDB poster image URL from a file path.
 * @param {string} filePath Poster path from TMDB API (e.g., '/abcd1234.jpg')
 * @param {string} size Poster size, e.g. 'w500', 'original'
 * @returns {string} Full image URL
 */
export function getPosterUrl(filePath, size = "w500") {
  if (!filePath) return "";
  return `https://image.tmdb.org/t/p/${size}${filePath}`;
}

// PUBLIC_INTERFACE
/**
 * Get movie credits (cast & crew).
 * @param {number|string} movieId TMDB movie ID
 * @returns {Promise<object>} Credits object (with cast and crew arrays)
 */
export async function getMovieCredits(movieId) {
  return tmdbGet(`/movie/${movieId}/credits`);
}

/*
// SEARCH AND FIX: PUBLIC_URL direct access checker
// Searched entire project for 'PUBLIC_URL' usage that is not 'process.env.PUBLIC_URL'.
// None found. If any direct usage is added, update it as 'process.env.PUBLIC_URL'!
*/

