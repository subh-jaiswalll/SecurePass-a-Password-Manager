
import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import "./auth.css";

function ForgotPassword() {

    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");

        try {
            const response = await API.post(
                "/api/user/forget-password",
                { email }
            );

            setMessage(response.data.message);

        } catch (error) {
            setMessage(
                error.response?.data?.message || "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">

                <h2>Forgot Password?</h2>

                <p>
                    Enter your registered email address.
                    We will send you a password reset link.
                </p>

                <input
                    type="email"
                    placeholder="Enter Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <p>{message}</p>

                <Link to="/login">
                    Back to Login
                </Link>

            </form>
        </div>
    );
}

export default ForgotPassword;
