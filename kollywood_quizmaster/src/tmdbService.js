//
// TMDB API integration utility for Kollywood QuizMaster
//
// Provides secure and reusable functions to fetch Kollywood movies (Tamil-language/India-origin)
// and grab posters, cast, release date, and other useful metadata for quiz usage.
//

const TMDB_API_KEY = '5bc67d3b06aecbd18121a3cbbc16eb59'; // In production, secure or obfuscate further
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// PUBLIC_INTERFACE
/**
 * Fetches movies tagged as Kollywood (Tamil-language/India-origin) from TMDB.
 * @param {number} [page=1] - Which result page to fetch.
 * @param {string} [query]  - Optional search query for movie titles (for filtered search).
 * @returns {Promise<Array>} Array of movie objects with id, title, poster, release date, etc.
 */
export async function fetchKollywoodMovies({ page = 1, query } = {}) {
  // TMDB "with_original_language=ta" restricts to Tamil-language movies.
  let url;
  if (query && query.length > 0) {
    // Search endpoint for more filtered results
    url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${page}&with_original_language=ta&region=IN`;
  } else {
    // Discover endpoint for general Tamil movie listing
    url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&region=IN&sort_by=popularity.desc&with_original_language=ta&page=${page}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch Kollywood movies');
  const data = await res.json();
  if (!data.results) return [];
  return data.results.map((movie) => ({
    id: movie.id,
    title: movie.title,
    poster: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
    release_date: movie.release_date,
    overview: movie.overview,
    vote_average: movie.vote_average,
    original_language: movie.original_language,
  }));
}

// PUBLIC_INTERFACE
/**
 * Fetches full movie details including cast/crew given a TMDB movie id.
 * @param {number|string} movieId
 * @returns {Promise<Object>} Movie details (poster, cast, director, etc.)
 */
export async function fetchMovieDetails(movieId) {
  const url = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch movie details');
  const movie = await res.json();

  // Extract top billed cast (main actors), director from crew
  const cast = movie.credits && Array.isArray(movie.credits.cast)
    ? movie.credits.cast.slice(0, 6).map((actor) => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        profile: actor.profile_path ? `${TMDB_IMAGE_BASE}${actor.profile_path}` : null,
      }))
    : [];

  const director = movie.credits && Array.isArray(movie.credits.crew)
    ? movie.credits.crew.find((c) => c.job === 'Director')?.name
    : undefined;

  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    poster: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
    backdrop: movie.backdrop_path ? `${TMDB_IMAGE_BASE}${movie.backdrop_path}` : null,
    release_date: movie.release_date,
    genres: movie.genres?.map((g) => g.name),
    cast,
    director,
    runtime: movie.runtime,
    vote_average: movie.vote_average,
  };
}

// PUBLIC_INTERFACE
/**
 * Example fetch logic for quiz usage: gets a random Kollywood movie and details for quiz content.
 * @returns {Promise<Object>} Kollywood movie data suitable for quiz (with cast, poster, etc).
 */
export async function getRandomKollywoodQuizResource() {
  // Pick a random page (TMDB allows up to 500 for discover endpoint)
  const page = Math.floor(Math.random() * 30) + 1;
  const movieList = await fetchKollywoodMovies({ page });
  if (!movieList.length) throw new Error("No Kollywood movies found");
  const randomMovie = movieList[Math.floor(Math.random() * movieList.length)];
  const movieDetails = await fetchMovieDetails(randomMovie.id);

  // Only return if has poster & at least one cast for quiz usability
  if (!movieDetails.poster || !movieDetails.cast.length) return getRandomKollywoodQuizResource();
  return movieDetails;
}
