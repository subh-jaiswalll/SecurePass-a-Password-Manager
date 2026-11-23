
import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "▦"
    },
    {
      name: "All Passwords",
      path: "/passwords",
      icon: "🔐"
    },
    {
      name: "Add Password",
      path: "/add-password",
      icon: "＋"
    },
    {
      name: "Password Generator",
      path: "/generator",
      icon: "⚡"
    },
    {
      name: "Settings",
      path: "/settings",
      icon: "⚙"
    }
  ];

  return (
    <aside className="sidebar">

      <div className="sidebar-heading">
        <p>MAIN MENU</p>
      </div>

      <div className="sidebar-menu">

        {menuItems.map((item) => (

          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >

            <span className="sidebar-icon">
              {item.icon}
            </span>

            <span>{item.name}</span>

          </NavLink>

        ))}

      </div>

      <div className="sidebar-bottom">

        <div className="sidebar-security">
          <div className="security-icon">🛡️</div>

          <h4>Your Security Matters</h4>

          <p>
            Keep your passwords safe with SecurePass Pro.
          </p>
        </div>

        <div className="sidebar-version">
          SecurePass Pro v1.0
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;
