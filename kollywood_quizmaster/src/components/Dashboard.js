import React from "react";
import "../App.css";

/** 
 * List of enabled quiz game features.
 * If in the future you want to show/hide games dynamically based on a remote config/user, 
 * pass in this array via props or context instead of being static.
 */
const quizzes = [
  {
    key: "blurredPoster",
    title: "Blurred Poster Quiz",
    desc: "Guess the movie from a blurred Kollywood poster. Clues & reveals available!",
    color: "#fc037b",
    icon: "🎬"
  },
  {
    key: "characterMatch",
    title: "Character-Movie Match",
    desc: "Drag character names onto correct movies!",
    color: "#00bfff",
    icon: "🧑‍🤝‍🧑"
  },
  {
    key: "movieBingo",
    title: "Movie Bingo",
    desc: "Complete a bingo from Kollywood categories. How many can you get?",
    color: "#e0a900",
    icon: "🎱"
  },
  {
    key: "timelineChallenge",
    title: "Timeline Challenge",
    desc: "Arrange Kollywood movies in release order.",
    color: "#4ae54a",
    icon: "⏳"
  },
  {
    key: "spinTheWheel",
    title: "Spin the Wheel",
    desc: "Spin for actor/year clues. Guess the Kollywood movie!",
    color: "#8e49fd",
    icon: "🎡"
  },
  {
    key: "castCombo",
    title: "Cast Combo",
    desc: "Which movie stars all displayed actors? Or spot the actor who doesn't belong.",
    color: "#ff725c",
    icon: "👥"
  }
];

/**
 * Dashboard component
 * Shows overview cards for all enabled games and allows navigation selection.
 *
 * PUBLIC_INTERFACE
 * @param {string} username
 * @param {function} onSelectQuiz - callback(quizKey) to select a quiz
 * @param {function} onLogout
 */
function Dashboard({ username, onSelectQuiz, onLogout }) {
  return (
    <div className="container">
      <div style={{
        margin: "88px 0 10px", display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <h2 className="title" style={{ fontSize: "2.1rem", margin: 0 }}>
          Hi, <span style={{ color: "#fc037b" }}>{username}</span>
        </h2>
        <button className="btn" style={{ background: "#1A1A1A", color: "#fff" }} onClick={onLogout}>
          Logout
        </button>
      </div>
      <div style={{ color: "var(--base-light)", marginTop: -10, marginBottom: 25, fontWeight: 500 }}>
        Select a game below to test your Kollywood knowledge!
      </div>
      <div
        className="dashboard-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "30px 20px",
          marginTop: 12
        }}
      >
        {quizzes.map(({ key, title, desc, color, icon }) => (
          <div
            key={key}
            className="dashboard-card"
            style={{
              background: "var(--secondary, #fbf9f9)",
              border: `2.5px solid ${color}`,
              borderRadius: "1.2rem",
              boxShadow: "0 2px 14px rgba(252,3,123,0.09)",
              padding: "30px 18px 22px 18px",
              transition: "transform 0.13s",
              cursor: "pointer",
              minHeight: 190
            }}
            tabIndex={0}
            onClick={() => onSelectQuiz(key)}
            onKeyDown={e => (e.key === "Enter" || e.key === " ") && onSelectQuiz(key)}
            aria-label={`Play ${title}`}
          >
            <span style={{ fontSize: "2.5rem" }}>{icon}</span>
            <h3 style={{ margin: "14px 0 8px", color }}>{title}</h3>
            <div style={{ color: "#351e3c", fontWeight: 400, fontSize: "1.03rem", minHeight: 38 }}>
              {desc}
            </div>
            <button
              className="btn"
              style={{
                marginTop: 18,
                background: color,
                color: "#fff",
                padding: "7px 23px",
                fontWeight: 500
              }}
            >Play</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
