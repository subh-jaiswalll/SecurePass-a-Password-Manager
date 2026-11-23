
import React from "react";
import "./Navbar.css";

function Navbar() {

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const userName = user.name || "User";

  return (
    <nav className="navbar">

      <div className="navbar-left">
        <div className="navbar-logo">🔐</div>

        <div>
          <h2>SecurePass <span>Pro</span></h2>
          <small>Password Manager</small>
        </div>
      </div>

      <div className="navbar-right">

        <div className="vault-status">
          <span className="status-dot"></span>
          Secure Vault
        </div>

        <div className="navbar-user">

          <div className="user-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>

          <div className="user-details">
            <h4>{userName}</h4>
            <span>Personal Account</span>
          </div>

        </div>

        <button className="logout-btn" onClick={logout}>
          ↪ Logout
        </button>

      </div>

    </nav>
  );
}

export default Navbar;
