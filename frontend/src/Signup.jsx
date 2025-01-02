import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const moe = useNavigate();

    const handleLogin = () => {
        moe("/");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = { username, email, password };

        try {
            const response = await fetch("http://localhost:3001/users/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage(result.message);
                setUsername("");
                setEmail("");
                setPassword("");
            } else {
                setMessage(result.error);
            }
        } catch (error) {
            console.error("Error during signup:", error);
            setMessage("Something went wrong. Please try again later.");
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <h1 className="signup-title">Welcome to Blog</h1>
                <p className="signup-subtitle">Create your own space</p>
                {message && <p className="signup-message">{message}</p>}
                <form onSubmit={handleSubmit} className="signup-form">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="signup-input"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="signup-input"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="signup-input"
                    />
                    <button type="submit" className="signup-button">Signup</button>
                    <h4 className="divider">OR</h4>
                    <button type="button" className="login-button" onClick={handleLogin}>
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Signup;
