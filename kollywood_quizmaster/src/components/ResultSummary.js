import React from "react";

/**
 * Result summary for a quiz game
 *
 * PUBLIC_INTERFACE
 * @param {string} quizKey
 * @param {object} summary - {score, total, details}
 * @param {string} username
 * @param {function} onExit
 * @param {function} onReplay
 */
function ResultSummary({ quizKey, summary, username, onExit, onReplay }) {
  const { score, total, details } = summary || {};

  const quizNames = {
    blurredPoster: "Blurred Poster Quiz",
    characterMatch: "Character-Movie Match",
    movieBingo: "Movie Bingo",
    timelineChallenge: "Timeline Challenge",
    spinTheWheel: "Spin the Wheel",
    castCombo: "Cast Combo"
  };
  const mainColor = "#fc037b";

  return (
    <div className="container" style={{
      minHeight: "62vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 100
    }}>

      <div
        style={{
          background: "var(--secondary, #fbf9f9)",
          borderRadius: "1.3rem",
          padding: "2.5rem 2.5rem 2rem",
          maxWidth: 430,
          boxShadow: "0 4px 34px rgba(252,3,123,0.13)",
          textAlign: "center"
        }}
      >
        <h2 style={{ color: mainColor }}>
          {quizNames[quizKey] || "Quiz"} Results
        </h2>
        <div style={{
          fontSize: "1.5rem",
          fontWeight: 600,
          color: "#1A1A1A",
          margin: "14px 0"
        }}>
          {username}, your score: <span style={{ color: mainColor }}>{score} / {total}</span>
        </div>
        {details && <div style={{
          textAlign: "left",
          margin: "20px auto 0",
          fontWeight: 400,
          color: "#333",
          background: "#efefef",
          borderRadius: 6,
          padding: "13px 9px"
        }}>
          <div style={{ marginBottom: 5, fontWeight: 600 }}>Question breakdown:</div>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            {details.map((d, i) => (
              <li key={i}>
                {d}
              </li>
            ))}
          </ul>
        </div>}
        <div style={{ marginTop: 30 }}>
          <button
            className="btn"
            style={{ background: mainColor, marginRight: 12, minWidth: 100 }}
            onClick={onReplay}
          >Play Again</button>
          <button
            className="btn"
            style={{ background: "#212121", color: "#fff", minWidth: 90 }}
            onClick={onExit}
          >Dashboard</button>
        </div>
      </div>
    </div>
  );
}

export default ResultSummary;
