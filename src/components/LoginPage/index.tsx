'use client';

import React, { useState } from "react";
import "./LoginPage.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); // Xóa lỗi trước đó (nếu có)

    try {
      const response = await fetch("https://musksimpson-backend.onrender.com/api/v1/login", {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.messages || "Something went wrong.");
      }

      const data = await response.json();
      const { token } = data;

      sessionStorage.setItem("token", token); 

      alert("Login successful!");

      window.location.href = "/admin";
    } catch (error) {
      setError('something wrong, please try again!');
    }
  };

  return (
    <div className="login-container">
      <div className="background">
        <div className="shape"></div>
        <div className="shape"></div>
      </div>
      <form onSubmit={handleLogin}>
        <h3>Login</h3>

        <label htmlFor="username">Username</label>
        <input
          type="text"
          placeholder="Email or Phone"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          placeholder="Password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>} {/* Hiển thị lỗi */}

        <button type="submit">Log In</button>
      </form>
    </div>
  );
};

export default LoginPage;
