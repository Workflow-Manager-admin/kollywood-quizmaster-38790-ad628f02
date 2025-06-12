import React, { useEffect, useState } from "react";
import {
  searchMovies,
  getMovieDetails,
  getMovieImages,
  getPosterUrl
} from "../../tmdbApi";

/*
 * Utility: filter only Kollywood (Tamil) movies, based on TMDB's language and metadata.
 */
const isKollywoodMovie = (movie) => {
  // At minimum: original_language is "ta"
  return movie?.original_language === "ta";
};

/**
 * Blurred Poster Quiz
 * 10 random Tamil movies (from TMDB API). Show blurred poster; clues: year, genre.
 *
 * PUBLIC_INTERFACE
 * @param {string} username
 * @param {function} onComplete(results)
 * @param {function} onExit
 */
function BlurredPosterQuiz({ username, onComplete, onExit }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [showReveal, setShowReveal] = useState(false);
  const [score, setScore] = useState(0);
  const [usedClues, setUsedClues] = useState([]);
  const [results, setResults] = useState([]);

  // On mount, prepare 10 random Tamil (Kollywood) movies
  useEffect(() => {
    async function prepareQuiz() {
      setLoading(true);
      // Find popular tamil movies with poster
      let result = await searchMovies("", {
        with_original_language: "ta",
        sort_by: "popularity.desc",
        include_adult: false,
        region: "IN",
        page: Math.floor(Math.random() * 25) + 1
      });
      let tamilMovies = (result.results || []).filter(isKollywoodMovie).filter(m => !!m.poster_path);

      // get unique random samples
      const shuffled = tamilMovies.sort(() => 0.5 - Math.random());
      let selected = [];
      let usedTitles = new Set();
      for (const movie of shuffled) {
        if (selected.length >= 10) break;
        const title = movie.title || movie.original_title;
        if (!usedTitles.has(title)) {
          usedTitles.add(title);
          selected.push(movie);
        }
      }

      // For each, retrieve details (year/genre etc)
      const questionsPromises = selected.map(async m => {
        const details = await getMovieDetails(m.id);
        // get poster path, possibly blur
        const images = await getMovieImages(m.id);
        const posterPath = (images?.posters?.[0]?.file_path) || m.poster_path;
        return {
          id: m.id,
          title: m.title,
          year: details.release_date?.slice(0, 4) || "Unknown",
          genres: details.genres?.map(g => g.name) || [],
          posterPath,
        };
      });
      const questionsList = await Promise.all(questionsPromises);
      setQuestions(questionsList);
      setUsedClues(Array(questionsList.length).fill({ year: false, genre: false }));
      setLoading(false);
    }
    prepareQuiz();
    // eslint-disable-next-line
  }, []);

  const handleAnswer = () => {
    if (!questions[activeIdx]) return;
    const guess = answer.trim().toLowerCase();
    const correct = questions[activeIdx].title.trim().toLowerCase();
    const isCorrect = guess === correct;
    setScore(s => isCorrect ? s + 1 : s);
    setResults(r => [...r, isCorrect
      ? `Q${activeIdx + 1}: Correct – “${questions[activeIdx].title}”`
      : `Q${activeIdx + 1}: Incorrect (You guessed “${answer}”, correct was “${questions[activeIdx].title}”)`
    ]);
    setAnswer("");
    setShowReveal(false);
    goToNext();
  };

  const goToNext = () => {
    if (activeIdx >= 9) {
      onComplete({ score: score + 0, total: 10, details: results });
    } else {
      setActiveIdx(i => i + 1);
    }
  };

  const handleReveal = () => {
    setShowReveal(true);
    setResults(r => [
      ...r,
      `Q${activeIdx + 1}: Revealed — “${questions[activeIdx].title}”`
    ]);
    setAnswer("");
    setTimeout(goToNext, 2100);
  };

  const handleClue = clueType => {
    setUsedClues(list => {
      const updated = [...list];
      updated[activeIdx] = { ...updated[activeIdx], [clueType]: true };
      return updated;
    });
  };

  if (loading || !questions.length) {
    return (
      <div className="container" style={{ marginTop: 140 }}>
        <div>Loading Kollywood movie posters...</div>
      </div>
    );
  }

  const q = questions[activeIdx];
  const posterUrl = getPosterUrl(q.posterPath, "w500");

  return (
    <div className="container" style={{ paddingTop: 95, maxWidth: 500 }}>
      <div style={{ color: "#fc037b", fontWeight: 600, fontSize: 19, marginBottom: 3 }}>
        Blurred Poster Quiz
      </div>
      <div style={{ marginTop: 3, fontWeight: 400, color: "#2a0b28" }}>
        Question {activeIdx + 1} / 10
      </div>
      <div style={{ textAlign: "center", margin: "18px auto 6px" }}>
        <img
          src={posterUrl}
          alt={`Blurred poster for Kollywood movie`}
          style={{
            borderRadius: "1rem",
            width: 290,
            height: 430,
            objectFit: "cover",
            filter: "blur(9px) contrast(0.98)",
            boxShadow: "0 2px 20px #fc037b33",
            background: "#eee"
          }}
        />
      </div>
      {/* Clues section */}
      <div style={{ margin: "10px 0 4px", display: "flex", gap: 8, justifyContent: "center" }}>
        <button className="btn" style={{ background: "#fb08b7" }}
          disabled={usedClues[activeIdx]?.year}
          onClick={() => handleClue("year")}
        >
          {usedClues[activeIdx]?.year ? `Year: ${q.year}` : "Get Year Clue"}
        </button>
        <button className="btn" style={{ background: "#00c9db" }}
          disabled={usedClues[activeIdx]?.genre}
          onClick={() => handleClue("genre")}
        >
          {usedClues[activeIdx]?.genre ? `Genre: ${q.genres[0] || "N/A"}` : "Get Genre Clue"}
        </button>
      </div>
      <form
        style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}
        onSubmit={e => {
          e.preventDefault();
          handleAnswer();
        }}
      >
        <input
          style={{
            flex: 1,
            border: "1.5px solid #fc037b",
            borderRadius: 4,
            padding: "11px 14px",
            fontSize: "1.08rem",
            marginRight: 6
          }}
          value={answer}
          placeholder="Type movie title…"
          onChange={e => setAnswer(e.target.value)}
          autoFocus
          disabled={showReveal}
        />
        <button className="btn" style={{ background: "#fc037b" }} type="submit" disabled={!answer.trim() || showReveal}>
          Submit
        </button>
        <button className="btn" type="button" style={{ background: "#444", color: "#fff" }} onClick={handleReveal}>
          Reveal
        </button>
      </form>
      {showReveal && (
        <div style={{
          margin: "17px 0 8px",
          color: "#db076c",
          fontWeight: 600,
          fontSize: 18
        }}>
          Answer: <span style={{ color: "#191a2c" }}>{q.title}</span>
        </div>
      )}

      {activeIdx > 0 && <button
        style={{
          background: "none",
          color: "#6e00bb",
          border: "none",
          marginTop: 27,
          fontSize: 15,
          textDecoration: "underline",
          cursor: "pointer"
        }}
        onClick={onExit}
      >Exit Quiz</button>}
    </div>
  );
}

export default BlurredPosterQuiz;
