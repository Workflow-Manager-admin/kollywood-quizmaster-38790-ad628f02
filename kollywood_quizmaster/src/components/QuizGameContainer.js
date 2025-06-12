import React, { useState } from "react";
import BlurredPosterQuiz from "./quizzes/BlurredPosterQuiz";
import CharacterMovieMatch from "./quizzes/CharacterMovieMatch";
import MovieBingo from "./quizzes/MovieBingo";
import MovieTimelineChallenge from "./quizzes/MovieTimelineChallenge";
import SpinTheWheel from "./quizzes/SpinTheWheel";
import CastCombo from "./quizzes/CastCombo";
import ResultSummary from "./ResultSummary";

/**
 * Container for handling the quiz game session, including question navigation, results, etc.
 *
 * PUBLIC_INTERFACE
 * @param {string} quizKey - Which quiz to show
 * @param {string} username - Player's name
 * @param {function} onExitToDashboard
 */
function QuizGameContainer({ quizKey, username, onExitToDashboard }) {
  const [quizComplete, setQuizComplete] = useState(false);
  const [summary, setSummary] = useState(null);
  const [restartKey, setRestartKey] = useState(0);

  // Handler when a quiz is completed. Called with results object.
  const handleQuizComplete = results => {
    setQuizComplete(true);
    setSummary(results);
  };

  // Handler for replay ("Play Again")
  const onReplay = () => {
    setRestartKey(k => k + 1);
    setQuizComplete(false);
    setSummary(null);
  };

  // Select correct quiz component in a way that's easily updated if new games are added.
  const quizComponentMap = {
    blurredPoster: BlurredPosterQuiz,
    characterMatch: CharacterMovieMatch,
    movieBingo: MovieBingo,
    timelineChallenge: MovieTimelineChallenge,
    spinTheWheel: SpinTheWheel,
    castCombo: CastCombo
  };
  const QuizComponent = quizComponentMap[quizKey] || null;

  if (!QuizComponent) return (
    <div className="container" style={{ marginTop: 120 }}>
      <h2>Quiz not found.</h2>
      <button className="btn" onClick={onExitToDashboard}>Back to Dashboard</button>
    </div>
  );

  if (quizComplete) {
    return (
      <ResultSummary
        quizKey={quizKey}
        summary={summary}
        username={username}
        onExit={onExitToDashboard}
        onReplay={onReplay}
      />
    );
  }

  // Render quiz
  return (
    <QuizComponent
      key={restartKey}
      username={username}
      onComplete={handleQuizComplete}
      onExit={onExitToDashboard}
    />
  );
}

export default QuizGameContainer;
