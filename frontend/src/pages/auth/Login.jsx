
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./auth.css";

function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        identifier: "",
        password: ""
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await API.post(
                "/api/user/login",
                formData
            );

            const { token, user } = response.data;

            localStorage.setItem("token", token);

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            navigate("/dashboard");

        } catch (error) {
            setMessage(
                error.response?.data?.message || "Login failed"
            );
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">

                <h2>Welcome Back</h2>

                <input
                    type="text"
                    name="identifier"
                    placeholder="Email or Phone Number"
                    value={formData.identifier}
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <Link to="/forgot-password">
                    Forgot Password?
                </Link>

                <button type="submit">
                    Login
                </button>

                <p>{message}</p>

                <p>
                    Don't have an account?
                    <Link to="/register"> Register</Link>
                </p>

            </form>
        </div>
    );
}

export default Login;
