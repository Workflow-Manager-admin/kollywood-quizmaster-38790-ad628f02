import React, { useEffect, useState } from "react";
import { searchMovies, getMovieCredits } from "../../tmdbApi";

/**
 * Utility: pick N unique elements from an array
 */
function pick(arr, n) {
  const out = [];
  const src = arr.slice();
  while (out.length < n && src.length) {
    let idx = Math.floor(Math.random() * src.length);
    out.push(src.splice(idx, 1)[0]);
  }
  return out;
}

/**
 * CastCombo Quiz - show 3 actors, guess movie they all starred in OR spot "odd-one-out"
 * PUBLIC_INTERFACE
 */
function CastCombo({ username, onComplete, onExit }) {
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [showReveal, setShowReveal] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function setup() {
      let res = await searchMovies("", {
        with_original_language: "ta",
        include_adult: false,
        page: Math.floor(Math.random() * 9) + 1
      });
      const movies = res.results || [];
      // Pick a movie and get top 3 actors
      let sample = movies[Math.floor(Math.random() * movies.length)];
      if (!sample) return setQuestion(null);
      let credits = await getMovieCredits(sample.id);
      let actors = (credits.cast || []).filter(c => c.known_for_department === "Acting");
      let picked = pick(actors, 3);
      setQuestion({
        movieTitle: sample.title,
        actorNames: picked.map(a => a.name),
        type: "combo"
      });
    }
    setup();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const correct = answer.trim().toLowerCase() === (question?.movieTitle.toLowerCase());
    setDone(true);
    setTimeout(() => {
      onComplete({
        score: correct ? 1 : 0,
        total: 1,
        details: [
          correct
            ? `✔ Guessed "${answer}" for actors ${question.actorNames.join(", ")}`
            : `✖ Guessed "${answer}", correct was "${question.movieTitle}"`
        ]
      });
    }, 900);
  }

  function handleReveal() {
    setShowReveal(true);
    setTimeout(() => setDone(true), 1300);
  }

  if (!question) return <div className="container" style={{ marginTop: 100 }}>Loading combo question...</div>;

  return (
    <div className="container" style={{ paddingTop: 97, maxWidth: 430 }}>
      <div style={{ color: "#ff725c", fontWeight: 600, fontSize: 19, marginBottom: 1 }}>Cast Combo</div>
      <div style={{ fontWeight: 500, color: "#2b1111", margin: "7px 0 13px" }}>
        Which Kollywood movie stars all these actors?
      </div>
      <div style={{
        background: "#fff6f3",
        border: "2.5px solid #ff725c",
        borderRadius: 9,
        padding: "21px 16px",
        fontWeight: 600,
        color: "#de3c16",
        fontSize: "1.13rem",
        marginBottom: 18
      }}>
        <ul style={{ margin: 0, paddingLeft: 15 }}>
          {question.actorNames.map(name => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
      <form style={{
        marginTop: 7, display: "flex", gap: 8
      }} onSubmit={handleSubmit}>
        <input
          style={{
            flex: 1,
            border: "1.5px solid #ff725c",
            borderRadius: 4,
            padding: "9px 13px",
            fontSize: "1.07rem",
            marginRight: 7
          }}
          value={answer}
          placeholder="Your guess (movie)…"
          disabled={showReveal || done}
          onChange={e => setAnswer(e.target.value)}
        />
        <button className="btn" style={{ background: "#ff725c", color: "#fff" }} type="submit" disabled={!answer || showReveal || done}>Submit</button>
        <button className="btn" style={{ background: "#444", color: "#fff" }} type="button" disabled={showReveal || done} onClick={handleReveal}>Reveal</button>
      </form>
      {showReveal &&
        <div style={{
          margin: "13px 0",
          color: "#ff5442",
          fontWeight: 600,
          fontSize: 17
        }}>
          Movie: {question.movieTitle}
        </div>}
      <button
        style={{
          background: "none",
          color: "#ff725c",
          border: "none",
          marginTop: 14,
          fontSize: 15,
          textDecoration: "underline",
          display: "block"
        }}
        onClick={onExit}
      >Exit Quiz</button>
    </div>
  );
}

export default CastCombo;
