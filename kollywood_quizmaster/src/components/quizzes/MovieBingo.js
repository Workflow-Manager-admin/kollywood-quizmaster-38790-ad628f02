import React, { useEffect, useState } from "react";
import { searchMovies, getMovieDetails } from "../../tmdbApi";

// Static Kollywood bingo categories
const KOLLYWOOD_BINGO_CATEGORIES = [
  "National Award Winner", "Directed by Mani Ratnam",
  "Rajinikanth Movie", "Blockbuster of 2010s", "Debut Film",
  "Starring Vijay", "90s Romantic", "Item Song", "Supernatural Plot"
];

function randomPick(arr, n) {
  let out = [];
  let src = [...arr];
  while (out.length < n && src.length) {
    let idx = Math.floor(Math.random() * src.length);
    out.push(src.splice(idx, 1)[0]);
  }
  return out;
}

/**
 * Movie Bingo Game - click on movies in a grid based on categories
 * PUBLIC_INTERFACE
 */
function MovieBingo({ username, onComplete, onExit }) {
  const [movies, setMovies] = useState([]);
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState({});
  const [done, setDone] = useState(false);
  const [bingos, setBingos] = useState(0);

  useEffect(() => {
    async function loadMovies() {
      // random page/popularity selection for Tamil movies
      let result = await searchMovies("", {
        with_original_language: "ta",
        page: Math.floor(Math.random() * 20) + 1,
        sort_by: "popularity.desc",
        include_adult: false
      });
      let bingoSet = randomPick(result.results || [], 9);
      setMovies(bingoSet.map(m => ({ ...m, checked: false })));
      setCategory(KOLLYWOOD_BINGO_CATEGORIES[Math.floor(Math.random() * KOLLYWOOD_BINGO_CATEGORIES.length)]);
      setSelected({});
      setBingos(0);
    }
    loadMovies();
  }, []);

  function handleMovieClick(idx) {
    setSelected(sel => ({ ...sel, [idx]: !sel[idx] }));
  }

  function handleSubmit() {
    let score = Object.keys(selected).filter(idx => selected[idx]).length;
    let details = Object.keys(selected).map(idx =>
      selected[idx]
        ? `Selected: ${(movies[idx]?.title) || "?"}`
        : null
    ).filter(Boolean);
    setDone(true);
    setTimeout(() => {
      onComplete({ score, total: movies.length, details });
    }, 1000);
  }

  return (
    <div className="container" style={{ paddingTop: 88 }}>
      <h2 style={{ color: "#e0a900" }}>Movie Bingo</h2>
      <p>Bingo Category: <span style={{ color: "#ac6900" }}>{category}</span></p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "14px",
        marginTop: 23,
        marginBottom: 18
      }}>
        {movies.map((m, i) => (
          <div key={i}
            className="bingo-cell"
            style={{
              background: selected[i] ? "#e0a900" : "#fff7cf",
              color: "#0f2222",
              border: "2.5px solid #e0a900",
              borderRadius: 10,
              padding: "18px 8px",
              minHeight: 62,
              fontWeight: 600,
              fontSize: 17,
              cursor: "pointer",
              textAlign: "center"
            }}
            onClick={() => handleMovieClick(i)}
          >
            {m.title}
          </div>
        ))}
      </div>
      <div>
        <button className="btn" style={{ background: "#e0a900", color: "#121212", fontWeight: 600 }}
          onClick={handleSubmit}
          disabled={done}
        >
          Submit Bingo
        </button>
      </div>
      <button
        style={{
          background: "none",
          color: "#ff725c",
          border: "none",
          marginTop: 12,
          fontSize: 15,
          textDecoration: "underline",
          display: "block"
        }}
        onClick={onExit}
      >Exit Quiz</button>
    </div>
  );
}

export default MovieBingo;
