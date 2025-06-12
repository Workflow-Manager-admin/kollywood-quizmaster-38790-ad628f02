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

  // Log every network request and response, errors included, regardless of environment
  // so we can debug real API/network issues in frontend environments.
  // (Remove in production for security, if needed)
  try {
    // eslint-disable-next-line no-console
    console.log("[TMDB][REQUEST]", { url: url.toString() });
  } catch (e) {}

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 10000);

  let res;
  try {
    res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(id);

    // Always log status code and response
    try {
      // eslint-disable-next-line no-console
      console.log("[TMDB][FETCH_STATUS]", res.status, res.statusText);
    } catch (e) {}

    if (!res.ok) {
      // Try to include TMDB error body if present
      let tmdbErrorMessage = "";
      try {
        const errBody = await res.clone().json();
        // eslint-disable-next-line no-console
        console.log("[TMDB][ERROR_BODY]", errBody);
        if (errBody && errBody.status_message) {
          tmdbErrorMessage = `: ${errBody.status_message}`;
        }
      } catch (detailsErr) {
        // eslint-disable-next-line no-console
        console.log("[TMDB][ERROR_PARSE]", detailsErr);
      }
      throw new Error(`TMDB API error: ${res.status} ${res.statusText} ${tmdbErrorMessage}`);
    }

    const json = await res.clone().json();
    // Always log data, not just in dev
    try {
      // eslint-disable-next-line no-console
      console.log("[TMDB][RESPONSE]", endpoint, json);
    } catch (e) {}
    return json;
  } catch (error) {
    clearTimeout(id);
    // Always log fetch exceptions
    try {
      // eslint-disable-next-line no-console
      console.log("[TMDB][FETCH_EXCEPTION]", error);
    } catch (e) {}
    throw new Error(
      error?.name === "AbortError"
        ? "TMDB API request timed out"
        : error?.message || "Unknown TMDB API error"
    );
  }
}

// PUBLIC_INTERFACE
/**
 * Search movies by title.
 * @param {string} query Movie title to search for
 * @param {object} options Optional TMDB search params (year, language, etc.)
 * @returns {Promise<object>} Search result object
 */
export async function searchMovies(query, options = {}) {
  // TMDB will return popular movies even with empty query if no query param provided,
  // so always pass a query (even if empty string) to avoid error.
  try {
    // TMDB expects either query or "with_original_language", so merge them cleanly
    const params = query
      ? { query, ...options }
      : { ...options, query: "" };
    return await tmdbGet("/search/movie", params);
  } catch (e) {
    // Standardize broken/malformed results
    return { results: [] };
  }
}

// PUBLIC_INTERFACE
/**
 * Get details for a movie by TMDB movie ID.
 * @param {number|string} movieId TMDB movie ID
 * @param {object} options Optional TMDB params (append_to_response, etc.)
 * @returns {Promise<object>} Movie details object
 */
export async function getMovieDetails(movieId, options = {}) {
  try {
    return await tmdbGet(`/movie/${movieId}`, { ...options });
  } catch (e) {
    return {};
  }
}

// PUBLIC_INTERFACE
/**
 * Get movie images (posters, backdrops).
 * @param {number|string} movieId TMDB movie ID
 * @param {object} options Optional TMDB params (language, etc.)
 * @returns {Promise<object>} Images object (with posters and backdrops arrays)
 */
export async function getMovieImages(movieId, options = {}) {
  try {
    return await tmdbGet(`/movie/${movieId}/images`, { ...options });
  } catch (e) {
    return { posters: [], backdrops: [] };
  }
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
  try {
    return await tmdbGet(`/movie/${movieId}/credits`);
  } catch (e) {
    return { cast: [], crew: [] };
  }
}

/*
// SEARCH AND FIX: PUBLIC_URL direct access checker
// Searched entire project for 'PUBLIC_URL' usage that is not 'process.env.PUBLIC_URL'.
// None found. If any direct usage is added, update it as 'process.env.PUBLIC_URL'!
*/
