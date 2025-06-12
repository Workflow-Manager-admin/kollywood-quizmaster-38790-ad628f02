import React, { useState } from 'react';
import './App.css';
import ThemeProvider from './ThemeProvider';
import Login from './Login';
import Dashboard from './Dashboard';
import BlurredPosterQuiz from './quizzes/BlurredPosterQuiz';
import CharacterMovieMatch from './quizzes/CharacterMovieMatch';
import MovieBingo from './quizzes/MovieBingo';
import MovieTimeline from './quizzes/MovieTimeline';
import SpinTheWheel from './quizzes/SpinTheWheel';
import CastCombo from './quizzes/CastCombo';
import ResultsSummary from './ResultsSummary';

// Quiz type keys for mapping
const QUIZ_COMPONENTS = {
  'blurred-poster': BlurredPosterQuiz,
  'character-match': CharacterMovieMatch,
  'bingo': MovieBingo,
  'timeline': MovieTimeline,
  'spinthewheel': SpinTheWheel,
  'cast-combo': CastCombo,
};

// Dashboard quiz card configuration
const QUIZ_GAMES = [
  {
    key: 'blurred-poster',
    name: 'Blurred Poster Quiz',
    desc: 'Guess the movie from a super-blurred Kollywood poster. Use up to 2 clues per poster!',
    icon: '🖼️',
    accent: '#d04270'
  },
  {
    key: 'character-match',
    name: 'Character-Movie Match',
    desc: 'Drag character names to the right Kollywood movie titles.',
    icon: '🎭',
    accent: '#b49606'
  },
  {
    key: 'bingo',
    name: 'Movie Bingo',
    desc: 'Spot and click Kollywood movies matching unique categories in a bingo grid.',
    icon: '🎲',
    accent: '#4688d7'
  },
  {
    key: 'timeline',
    name: 'Movie Timeline',
    desc: 'Arrange movies in order of their release year.',
    icon: '⏳',
    accent: '#36cdb4'
  },
  {
    key: 'spinthewheel',
    name: 'Spin the Wheel',
    desc: 'Spin to draw clues on actors, year, and guess the movie!',
    icon: '🌀',
    accent: '#7732d5'
  },
  {
    key: 'cast-combo',
    name: 'Cast Combo',
    desc: 'Guess the movie given 2-3 cast members, or spot the odd actor out.',
    icon: '👥',
    accent: '#e96540'
  },
];

function App() {
  const [user, setUser] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null); // quiz key string
  const [quizResults, setQuizResults] = useState(null);

  // Handles quiz completion, shows results summary
  function handleQuizComplete(result) {
    setQuizResults(result);
    setCurrentQuiz(null);
  }

  // Handles "Play Again" or "Go to Dashboard"
  function handleReturnToDashboard() {
    setQuizResults(null);
    setCurrentQuiz(null);
  }

  // PUBLIC_INTERFACE
  /**
   * Renders the main Kollywood QuizMaster app, with login, dashboard, and quizzes.
   */
  return (
    <ThemeProvider>
      <div className="app">
        <nav className="navbar" style={{ background: 'var(--primary)', color: 'var(--accent)' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="logo" style={{ fontWeight: 800, letterSpacing: '1px', color: 'var(--accent)' }}>
              <span className="logo-symbol" style={{ color: 'var(--primary)', fontSize: '1.9em', fontWeight: 800 }}>*</span>
              KOLLYWOOD QUIZMASTER
            </div>
            {user && 
              <span style={{ color: 'var(--accent)', background: 'var(--secondary)', padding: '5px 12px', borderRadius: '16px', fontWeight: 600 }}>
                {user.username}
              </span>
            }
          </div>
        </nav>

        <main style={{ paddingTop: 100 }}>
          <div className="container" style={{ minHeight: '70vh' }}>
            {!user && (
              <Login onLogin={setUser} />
            )}
            {user && !currentQuiz && !quizResults && (
              <Dashboard
                user={user}
                quizzes={QUIZ_GAMES}
                onSelectQuiz={setCurrentQuiz}
                onLogout={() => setUser(null)}
              />
            )}
            {user && quizResults && (
              <ResultsSummary
                results={quizResults}
                onPlayAgain={handleReturnToDashboard}
                user={user}
              />
            )}
            {user && currentQuiz && (
              React.createElement(
                QUIZ_COMPONENTS[currentQuiz],
                {
                  user,
                  onComplete: handleQuizComplete,
                  onBack: handleReturnToDashboard,
                  // Optionally, pass quiz config or additional props here
                }
              )
            )}
          </div>
        </main>
        <footer style={{
          background: 'var(--accent)', color: 'var(--secondary)', textAlign: 'center',
          padding: '14px 0', marginTop: 'auto', fontSize: '0.96em'
        }}>
          Made with 🤖 for Kollywood fans | &copy; 2024 QuizMaster
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;
