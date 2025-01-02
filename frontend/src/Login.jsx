import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const move = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setMessage("Email is required!");
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();
            if (response.ok) {
                setMessage("Login successful!");
                move("/app");
                localStorage.setItem(
                    "user",
                    JSON.stringify({ email: email, id: result._id })
                );
            } else {
                setMessage(result.error || "Invalid login credentials");
            }
        } catch (error) {
            console.error("Error during login:", error);
            setMessage("Something went wrong. Please try again later.");
        }
    };

    const handleSignup = () => {
        move("/signup");
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Welcome Back</h1>
                {message && <p className="login-message">{message}</p>}
                <form onSubmit={handleSubmit} className="login-form">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="login-input"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="login-input"
                    />
                    <button type="submit" className="login-button">Login</button>
                    <h4 className="divider">OR</h4>
                    <button type="button" className="signup-button" onClick={handleSignup}>
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
