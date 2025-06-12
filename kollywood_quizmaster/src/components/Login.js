import React, { useState } from "react";
import "../App.css";

/**
 * Login component for Kollywood QuizMaster.
 * Handles a simple username entry and calls onLogin on successful login.
 *
 * PUBLIC_INTERFACE
 * @param {function} onLogin - callback when login is successful
 */
function Login({ onLogin }) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="login-container" style={{
      minHeight: "70vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <form
        className="login-form"
        onSubmit={handleSubmit}
        style={{
          background: "var(--base-dark)",
          boxShadow: "0 4px 30px rgba(0,0,0,0.12)",
          borderRadius: "1.5rem",
          padding: "2.5rem 2rem",
          maxWidth: 370,
          width: "90%",
          margin: "0 auto",
          textAlign: "center"
        }}>
        <div className="subtitle" style={{ color: "var(--base-light)" }}>
          Kollywood QuizMaster
        </div>
        <h2 style={{ margin: "18px 0 4px", color: "#fc037b" }}>Welcome!</h2>
        <div style={{ marginBottom: 16, color: "var(--text-secondary)" }}>Enter your name to begin:</div>
        <input
          style={{
            padding: "10px",
            border: "1.5px solid var(--base-light)",
            borderRadius: 4,
            width: "100%",
            marginBottom: 18,
            fontSize: "1.05rem"
          }}
          autoFocus
          placeholder="Your Name"
          value={username}
          onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_ ]/g, ""))}
        />
        <button className="btn btn-large" style={{ background: "#fc037b" }} type="submit" disabled={!username.trim()}>
          Get Started
        </button>
      </form>
    </div>
  );
}

export default Login;
