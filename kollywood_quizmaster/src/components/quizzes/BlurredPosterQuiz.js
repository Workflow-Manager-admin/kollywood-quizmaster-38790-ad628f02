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
  const [loadError, setLoadError] = useState(false); // NEW

  // On mount, prepare 10 random Tamil (Kollywood) movies
  useEffect(() => {
    let isMounted = true;
    async function prepareQuiz() {
      setLoading(true);
      setLoadError(false);
      try {
        // Try up to 4 random pages for more coverage in search (sometimes TMDB returns sparse pages)
        let tamilMovies = [];
        for (let attempt = 0; attempt < 4 && tamilMovies.length < 12; attempt++) {
          const result = await searchMovies("", {
            with_original_language: "ta",
            sort_by: "popularity.desc",
            include_adult: false,
            region: "IN",
            page: Math.floor(Math.random() * 25) + 1
          });

          if (result && Array.isArray(result.results)) {
            tamilMovies = [
              ...tamilMovies,
              ...result.results.filter(isKollywoodMovie).filter(m => !!m.poster_path)
            ];
            // Remove duplicates by movie id
            const idSet = new Set();
            tamilMovies = tamilMovies.filter(m => {
              if (idSet.has(m.id)) return false;
              idSet.add(m.id);
              return true;
            });
          }
        }

        if (tamilMovies.length === 0) {
          throw new Error("No suitable Tamil movies found.");
        }

        // get unique random samples (up to 10)
        const shuffled = [...tamilMovies].sort(() => 0.5 - Math.random());
        const selected = [];
        const usedTitles = new Set();
        for (const movie of shuffled) {
          if (selected.length >= 10) break;
          const title = movie.title || movie.original_title;
          if (!usedTitles.has(title)) {
            usedTitles.add(title);
            selected.push(movie);
          }
        }

        if (selected.length === 0) {
          throw new Error("No Tamil movies with posters found, try again later.");
        }

        // For each, retrieve details (year/genre etc), but tolerate per-movie fetch errors
        const questionsPromises = selected.map(async m => {
          try {
            const details = await getMovieDetails(m.id);
            // get poster path, possibly blur
            const images = await getMovieImages(m.id);
            const posterPath = (images?.posters?.[0]?.file_path) || m.poster_path;
            return {
              id: m.id,
              title: m.title,
              year: details?.release_date?.slice(0, 4) || m.release_date?.slice(0, 4) || "Unknown",
              genres: details?.genres?.map(g => g.name) || [],
              posterPath,
            };
          } catch (qErr) {
            // Return fallback if per-movie fetch fails
            return {
              id: m.id,
              title: m.title,
              year: m.release_date?.slice(0, 4) || "Unknown",
              genres: [],
              posterPath: m.poster_path,
              fetchError: true
            };
          }
        });
        const questionsList = await Promise.all(questionsPromises);

        // Filter out those with no posterPath or title (shouldn't happen, but just in case)
        const filteredQuestions = questionsList.filter(q => q.posterPath && q.title);

        if (isMounted) {
          if (!filteredQuestions.length) throw new Error("No usable Kollywood quiz questions generated.");
          setQuestions(filteredQuestions);
          setUsedClues(Array(filteredQuestions.length).fill({ year: false, genre: false }));
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setQuestions([]);
          setLoading(false);
          setLoadError(true);
        }
      }
    }
    prepareQuiz();
    return () => { isMounted = false; };
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
    if (activeIdx >= questions.length - 1) {
      onComplete({ score: score + 0, total: questions.length, details: results });
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

  if (loading) {
    return (
      <div className="container" style={{ marginTop: 140 }}>
        <div>Loading Kollywood movie posters...</div>
      </div>
    );
  }
  if (loadError || !questions.length) {
    return (
      <div className="container" style={{ marginTop: 140 }}>
        <div style={{ color: "#db076c", fontWeight: 600, marginBottom: "1.3rem" }}>
          Failed to load Kollywood movie posters. Please check your internet or try again later.
        </div>
        <button className="btn" onClick={onExit}>Back to Dashboard</button>
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
        Question {activeIdx + 1} / {questions.length}
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
