import React, { useEffect, useState } from "react";
import { searchMovies, getMovieCredits } from "../../tmdbApi";

/**
 * SpinTheWheel Quiz
 * Randomly select actor and year as clue – user guesses movie.
 * PUBLIC_INTERFACE
 */
function SpinTheWheel({ username, onComplete, onExit }) {
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [showReveal, setShowReveal] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function setup() {
      let res = await searchMovies("", {
        with_original_language: "ta",
        include_adult: false,
        page: Math.floor(Math.random() * 10) + 1
      });
      let sample = res.results?.[Math.floor(Math.random() * (res.results.length || 1))];
      if (!sample) return setQuestion(null);

      let credits = await getMovieCredits(sample.id);
      let actors = (credits.cast || []).filter((c) => c.known_for_department === "Acting");
      let picked = actors[Math.floor(Math.random() * Math.min(actors.length, 7))];
      setQuestion({
        movieTitle: sample.title,
        actor: picked?.name || "N/A",
        year: sample.release_date?.slice(0, 4) || "?",
      });
    }
    setup();
  }, [done === true]);

  function handleSubmit(e) {
    e.preventDefault();
    let correct = answer.trim().toLowerCase() === (question?.movieTitle.toLowerCase());
    setScore(correct ? 1 : 0);
    setDone(true);
    setTimeout(() => {
      onComplete({
        score: correct ? 1 : 0,
        total: 1,
        details: [
          correct
            ? `✔ Guessed "${answer}" for actor ${question.actor} in year ${question.year}`
            : `✖ Guessed "${answer}", correct was "${question.movieTitle}"`
        ]
      });
    }, 1100);
  }

  function handleReveal() {
    setShowReveal(true);
    setTimeout(() => setDone(true), 1600);
  }

  if (!question)
    return <div className="container" style={{ marginTop: 100 }}>Preparing wheel...</div>;

  return (
    <div className="container" style={{ paddingTop: 90, maxWidth: 440 }}>
      <div style={{ color: "#8e49fd", fontWeight: 600, fontSize: 20 }}>
        Spin the Wheel
      </div>
      <div style={{
        fontWeight: 500,
        color: "#222",
        margin: "15px 0 10px"
      }}>
        Guess the Kollywood movie!
      </div>
      <div style={{
        background: "#ebe6ff",
        color: "#6a26b9",
        borderRadius: "13px",
        padding: "25px 17px",
        margin: "0 0 15px 0",
        fontWeight: 600,
        fontSize: 19,
        letterSpacing: 1
      }}>
        Actor: {question.actor} <br />
        Year: {question.year}
      </div>
      <form style={{
        marginTop: 13,
        display: "flex",
        gap: 8,
        alignItems: "center"
      }} onSubmit={handleSubmit}>
        <input
          style={{
            flex: 1,
            border: "1.5px solid #8e49fd",
            borderRadius: 4,
            padding: "10px 13px",
            fontSize: "1.07rem",
            marginRight: 7
          }}
          value={answer}
          placeholder="Your guess (movie)…"
          disabled={showReveal || done}
          onChange={e => setAnswer(e.target.value)}
        />
        <button className="btn" style={{ background: "#8e49fd", color: "#fff" }} type="submit" disabled={!answer || showReveal || done}>Submit</button>
        <button className="btn" style={{ background: "#444", color: "#fff" }} type="button" disabled={showReveal || done} onClick={handleReveal}>Reveal</button>
      </form>
      {showReveal &&
        <div style={{
          margin: "13px 0",
          color: "#a60cf7",
          fontWeight: 600,
          fontSize: 17
        }}>
          Movie: {question.movieTitle}
        </div>
      }
      <button
        style={{
          background: "none",
          color: "#8e49fd",
          border: "none",
          marginTop: 16,
          fontSize: 15,
          textDecoration: "underline",
          display: "block"
        }}
        onClick={onExit}
      >Exit Quiz</button>
    </div>
  );
}

export default SpinTheWheel;
