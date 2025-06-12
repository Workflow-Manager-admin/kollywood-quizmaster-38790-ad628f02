import React, { useState, useEffect } from 'react';
import './App.css';
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import QuizGameContainer from "./components/QuizGameContainer";

// PUBLIC_INTERFACE
/**
 * Main entry for Kollywood QuizMaster App.
 * Handles persistent login, dashboard navigation, game routes.
 */
function App() {
  // Try localstorage for persistent login state
  const [username, setUsername] = useState(() => {
    return window.localStorage.getItem('kq_username') || "";
  });
  const [currentQuiz, setCurrentQuiz] = useState(null);

  useEffect(() => {
    if (username) window.localStorage.setItem('kq_username', username);
    else window.localStorage.removeItem('kq_username');
  }, [username]);

  function handleLogin(name) {
    setUsername(name);
  }
  function handleLogout() {
    setUsername("");
    setCurrentQuiz(null);
  }
  function enterQuiz(quizKey) {
    setCurrentQuiz(quizKey);
  }
  function exitQuiz() {
    setCurrentQuiz(null);
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol" style={{ color: "#fc037b" }}>🎬</span> Kollywood QuizMaster
            </div>
            {username &&
              <button className="btn"
                style={{ background: '#fc037b', color: "#fff" }}
                onClick={handleLogout}>Logout</button>
            }
          </div>
        </div>
      </nav>

      <main style={{ paddingTop: 70 }}>
        {!username && <Login onLogin={handleLogin} />}
        {username && !currentQuiz && (
          <Dashboard
            username={username}
            onSelectQuiz={enterQuiz}
            onLogout={handleLogout}
          />
        )}
        {username && currentQuiz && (
          <QuizGameContainer
            quizKey={currentQuiz}
            username={username}
            onExitToDashboard={exitQuiz}
          />
        )}
      </main>
    </div>
  );
}

export default App;