# kollywood-quizmaster-38790-ad628f02

## TMDB API Integration Usage

Kollywood QuizMaster now provides a utility at `src/tmdbService.js` for fetching Kollywood (Tamil-cinema) movie data from TMDB.

**How to use in quiz/game logic:**

```js
import { getRandomKollywoodQuizResource } from './src/tmdbService';

// Example: Get movie + quiz resource (poster, cast, release date, etc)
getRandomKollywoodQuizResource().then((movie) => {
  // movie has: title, poster, cast (array), director, overview, release_date, etc
  console.log(movie);
  // Use in quiz display, question generation, etc.
});
```

**To fetch movie lists or detailed info:**

```js
import { fetchKollywoodMovies, fetchMovieDetails } from './src/tmdbService';

// Get a list of Kollywood movies (paginated, sorted by popularity)
fetchKollywoodMovies().then(list => { /*...*/ });

// Get full detail and cast for a movie by id
fetchMovieDetails(123).then(movie => { /*...*/ });
```

Refer to the `src/tmdbService.js` file for all exported functions and options.
