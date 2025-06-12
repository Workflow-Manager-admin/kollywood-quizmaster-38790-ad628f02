import React, { useEffect, useState } from "react";
import {
  searchMovies,
  getMovieDetails,
  getMovieCredits
} from "../../tmdbApi";

const isKollywoodMovie = m => m?.original_language === "ta";

/**
 * Character-Movie Match Game (drag character names to movie card)
 *
 * PUBLIC_INTERFACE
 * @param {string} username
 * @param {function} onComplete
 * @param {function} onExit
 */
function CharacterMovieMatch({ username, onComplete, onExit }) {
  const [movieChars, setMovieChars] = useState([]);
  const [drag, setDrag] = useState(null);
  const [dropData, setDropData] = useState({});
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    async function fetchData() {
      let result = await searchMovies("", {
        with_original_language: "ta",
        sort_by: "popularity.desc",
        include_adult: false,
        page: 1
      });
      let tamilMovies = (result.results || []).filter(isKollywoodMovie).slice(0, 6);
      // For each, get character name from credits
      const charMovieArr = await Promise.all(
        tamilMovies.map(async m => {
          const credits = await getMovieCredits(m.id);
          // get mainActor's character
          const actor = (credits.cast || []).find(c =>
            c.known_for_department === "Acting" && c.character && c.character.split(" ").length < 4
          );
          return {
            movieId: m.id,
            movieTitle: m.title,
            // Use 1st non-empty character name
            character: actor?.character || "Unknown"
          };
        })
      );
      // Shuffle the characters
      const chars = charMovieArr.map(x => x.character);
      setMovieChars(
        charMovieArr.map((q, i) => ({
          ...q,
          character: chars[i]
        }))
      );
      setDropData({});
      setScore(0);
      setDone(false);
    }
    fetchData();
  }, []);

  function onDragStart(e, char) {
    setDrag(char);
    e.dataTransfer.effectAllowed = "move";
  }
  function onDrop(e, movieId) {
    if (!drag) return;
    setDropData(dd => ({ ...dd, [movieId]: drag }));
    setDrag(null);
    e.preventDefault();
  }
  function allowDrop(e) { e.preventDefault(); }

  function handleSubmit() {
    // Calculate score
    let sc = 0;
    let details = [];
    for (let { movieId, movieTitle, character } of movieChars) {
      if (dropData[movieId] === character) {
        sc += 1;
        details.push(`✔ “${character}” → ${movieTitle}`);
      } else {
        details.push(`✖ “${dropData[movieId] || "—"}” (correct: “${character}”) → ${movieTitle}`);
      }
    }
    setScore(sc);
    setDone(true);
    setTimeout(() => {
      onComplete({ score: sc, total: movieChars.length, details });
    }, 1100);
  }

  if (!movieChars.length) {
    return <div className="container" style={{ marginTop: 130 }}>Loading Character-Movie questions...</div>;
  }

  // Shuffle the characters for drag options
  let dragChoices = movieChars.map(c => c.character);
  dragChoices = [...new Set(dragChoices)].sort(() => (Math.random() > 0.5 ? 1 : -1));

  return (
    <div className="container" style={{ paddingTop: 100, maxWidth: 600 }}>
      <h2 style={{ color: "#00bfff", margin: 0 }}>Character-Movie Match</h2>
      <div style={{ color: "#111", fontWeight: 500, fontSize: 15, marginBottom: 8 }}>
        Drag the character name onto the correct movie!
      </div>
      <div style={{
        display: "flex", gap: 14, flexWrap: "wrap", margin: "20px 0 24px"
      }}>
        {dragChoices.map(char => (
          <div
            key={char}
            draggable
            style={{
              border: drag === char ? "2.5px dashed #00bfff" : "2.5px solid #00bfff",
              background: "#ebfcfe",
              color: "#2690e6",
              borderRadius: 8,
              padding: "10px 19px",
              cursor: "grab",
              userSelect: "none"
            }}
            onDragStart={e => onDragStart(e, char)}
            onDragEnd={() => setDrag(null)}
          >{char}</div>
        ))}
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22
      }}>
        {movieChars.map(mc => (
          <div
            key={mc.movieId}
            style={{
              background: "#f8fcff",
              borderRadius: 10,
              padding: "17px",
              fontWeight: 600,
              fontSize: "1.08rem",
              border: "2px solid #00bfff",
              minHeight: 48,
              minWidth: 110
            }}
            onDrop={e => onDrop(e, mc.movieId)}
            onDragOver={allowDrop}
          >
            <span style={{ color: "#00bfff" }}>
              {dropData[mc.movieId] || <span style={{ opacity: .25 }}>[Drop character]</span>}
            </span>
            <span style={{ marginLeft: 9 }}>→ {mc.movieTitle}</span>
          </div>
        ))}
      </div>
      <button className="btn" style={{ marginTop: 28, background: "#00bfff" }}
        disabled={done || Object.keys(dropData).length < movieChars.length}
        onClick={handleSubmit}
      >Submit Answers</button>
      <button
        style={{
          background: "none",
          color: "#6e00bb",
          border: "none",
          marginTop: 15,
          fontSize: 14,
          textDecoration: "underline",
          display: "block"
        }}
        onClick={onExit}
      >Exit Quiz</button>
    </div>
  );
}

export default CharacterMovieMatch;
