import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("overview");
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [visiblePasswords, setVisiblePasswords] = useState([]);

  const [user, setUser] = useState({});

  // Generator states
  const [length, setLength] = useState(16);
  const [type, setType] = useState("mixed");
  const [generatedPassword, setGeneratedPassword] = useState("");

  const [message, setMessage] = useState("");

  // Load logged-in user
  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser({});
      }
    }

    getPasswords();
  }, []);

  // Get all passwords
  const getPasswords = async () => {
    try {
      setLoading(true);

      const response = await API.get("/api/passwords");

      setPasswords(response.data.passwords || []);
    } catch (error) {
      console.log(error);

      setMessage(error.response?.data?.message || "Unable to fetch passwords");
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // Show and hide password
  const togglePassword = (id) => {
    setVisiblePasswords((previous) => {
      if (previous.includes(id)) {
        return previous.filter((item) => item !== id);
      }

      return [...previous, id];
    });
  };

  // Copy password
  const copyPassword = async (password) => {
    try {
      await navigator.clipboard.writeText(password);

      setMessage("Password copied successfully");
    } catch {
      setMessage("Unable to copy password");
    }
  };

  // Delete password
  const deletePassword = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this password?",
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/api/passwords/${id}`);

      setMessage("Password deleted successfully");

      getPasswords();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to delete password");
    }
  };

  // Open add modal
  const handleAdd = () => {
    setEditItem(null);
    setShowModal(true);
  };

  // Open edit modal
  const handleEdit = (item) => {
    setEditItem(item);
    setShowModal(true);
  };

  // Save or update password
  const handleSave = async (formData) => {
    try {
      if (editItem) {
        await API.put(`/api/passwords/${editItem.id}`, formData);

        setMessage("Password updated successfully");
      } else {
        await API.post("/api/passwords", formData);

        setMessage("Password saved successfully");
      }

      setShowModal(false);
      setEditItem(null);

      await getPasswords();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save password");
    }
  };

  // Generate password
  const handleGenerate = async () => {
    try {
      setGeneratedPassword("");

      const response = await API.post("/api/passwords/generate", {
        length: Number(length),
        type: type,
      });

      setGeneratedPassword(response.data.password);
    } catch (error) {
      setMessage(error.response?.data?.message || "Password generation failed");
    }
  };

  // Regenerate saved password
  const handleRegenerate = async (id) => {
    const confirmRegenerate = window.confirm(
      "This will replace the existing saved password. Continue?",
    );

    if (!confirmRegenerate) return;

    try {
      const response = await API.post(`/api/passwords/regenerate/${id}`, {
        length: 16,
        type: "mixed",
      });

      setMessage(response.data.message);

      await getPasswords();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to regenerate password",
      );
    }
  };

  // Search and filter
  const filteredPasswords = passwords.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      item.title?.toLowerCase().includes(searchText) ||
      item.username?.toLowerCase().includes(searchText) ||
      item.website?.toLowerCase().includes(searchText);

    const website = item.website?.toLowerCase() || "";

    let matchesFilter = true;

    if (filter === "social") {
      matchesFilter =
        website.includes("instagram") ||
        website.includes("facebook") ||
        website.includes("linkedin") ||
        website.includes("twitter");
    }

    if (filter === "work") {
      matchesFilter =
        website.includes("google") ||
        website.includes("github") ||
        website.includes("microsoft");
    }

    return matchesSearch && matchesFilter;
  });

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">S</span>
          <h2>SecurePass</h2>
        </div>

        <p className="sidebar-label">MENU</p>

        <button
          className={activePage === "overview" ? "nav-item active" : "nav-item"}
          onClick={() => setActivePage("overview")}
        >
          <span>▦</span> Overview
        </button>

        <button
          className={activePage === "vault" ? "nav-item active" : "nav-item"}
          onClick={() => setActivePage("vault")}
        >
          <span>▣</span> Password Vault
        </button>

        <button
          className={
            activePage === "generator" ? "nav-item active" : "nav-item"
          }
          onClick={() => setActivePage("generator")}
        >
          <span>⚡</span> Password Generator
        </button>

        <button
          className={activePage === "security" ? "nav-item active" : "nav-item"}
          onClick={() => setActivePage("security")}
        >
          <span>♢</span> Security Center
        </button>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="avatar">{getInitials(user.name)}</div>

            <div>
              <h4>{user.name || "User"}</h4>
              <p>{user.email || "SecurePass Account"}</p>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            ↪ Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="header-subtitle">YOUR PERSONAL SECURITY SPACE</p>
            <h1>
              {activePage === "overview" && "Dashboard"}
              {activePage === "vault" && "Password Vault"}
              {activePage === "generator" && "Password Generator"}
              {activePage === "security" && "Security Center"}
            </h1>
          </div>

          <div className="header-right">
            <button className="add-password-btn" onClick={handleAdd}>
              + Add Password
            </button>

            <div className="header-avatar">{getInitials(user.name)}</div>
          </div>
        </header>

        {message && (
          <div className="dashboard-message">
            {message}
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        {/* OVERVIEW */}

        {activePage === "overview" && (
          <>
            <section className="welcome-section">
              <div>
                <h2>Welcome back, {user.name?.split(" ")[0] || "User"}!</h2>

                <p>Manage your passwords securely from one place.</p>
              </div>

              <span className="welcome-icon">🔐</span>
            </section>

            <section className="stats-grid">
              <StatCard
                title="Total Passwords"
                value={passwords.length}
                icon="▣"
                description="Saved accounts"
              />

              <StatCard
                title="Social Accounts"
                value={
                  passwords.filter((item) =>
                    /instagram|facebook|linkedin|twitter/i.test(
                      item.website || "",
                    ),
                  ).length
                }
                icon="◎"
                description="Social websites"
              />

              <StatCard
                title="Work Accounts"
                value={
                  passwords.filter((item) =>
                    /google|github|microsoft/i.test(item.website || ""),
                  ).length
                }
                icon="▤"
                description="Work websites"
              />

              <StatCard
                title="Vault Status"
                value="Active"
                icon="♢"
                description="Your vault is available"
              />
            </section>

            <section className="content-section">
              <div className="section-heading">
                <div>
                  <h2>Recent Passwords</h2>
                  <p>Your saved accounts</p>
                </div>

                <button
                  className="text-btn"
                  onClick={() => setActivePage("vault")}
                >
                  View All →
                </button>
              </div>

              <PasswordList
                passwords={passwords.slice(0, 5)}
                visiblePasswords={visiblePasswords}
                onToggle={togglePassword}
                onCopy={copyPassword}
                onEdit={handleEdit}
                onDelete={deletePassword}
                onRegenerate={handleRegenerate}
                loading={loading}
              />
            </section>
          </>
        )}

        {/* PASSWORD VAULT */}

        {activePage === "vault" && (
          <section className="content-section">
            <div className="section-heading">
              <div>
                <h2>All Saved Passwords</h2>
                <p>{passwords.length} accounts in your vault</p>
              </div>
            </div>

            <div className="vault-toolbar">
              <input
                type="text"
                placeholder="Search title, username or website..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Accounts</option>
                <option value="social">Social Accounts</option>
                <option value="work">Work Accounts</option>
              </select>
            </div>

            <PasswordList
              passwords={filteredPasswords}
              visiblePasswords={visiblePasswords}
              onToggle={togglePassword}
              onCopy={copyPassword}
              onEdit={handleEdit}
              onDelete={deletePassword}
              onRegenerate={handleRegenerate}
              loading={loading}
            />
          </section>
        )}

        {/* GENERATOR */}

        {activePage === "generator" && (
          <section className="generator-page">
            <div className="generator-panel">
              <div className="generator-heading">
                <span>⚡</span>
                <div>
                  <h2>Create Strong Password</h2>
                  <p>Generate a random password for your accounts.</p>
                </div>
              </div>

              <div className="generator-control">
                <div className="control-heading">
                  <label>Password Length</label>
                  <strong>{length} Characters</strong>
                </div>

                <input
                  type="range"
                  min="8"
                  max="64"
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                />

                <div className="range-labels">
                  <span>8</span>
                  <span>64</span>
                </div>
              </div>

              <div className="generator-control">
                <label>Password Type</label>

                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="digits">Digits Only</option>
                  <option value="alphabets">Alphabets Only</option>
                  <option value="alphanumeric">Alphanumeric</option>
                  <option value="symbols">Symbols Only</option>
                  <option value="mixed">Mix of All</option>
                </select>
              </div>

              <button className="primary-btn full-btn" onClick={handleGenerate}>
                ⚡ Generate Password
              </button>

              {generatedPassword && (
                <div className="generated-result">
                  <label>Your Generated Password</label>

                  <div className="generated-output">
                    <input value={generatedPassword} readOnly />

                    <button onClick={() => copyPassword(generatedPassword)}>
                      Copy
                    </button>
                  </div>

                  <p>Save this password to your vault when ready.</p>

                  <button
                    className="secondary-btn"
                    onClick={() => {
                      setEditItem({
                        title: "",
                        username: "",
                        website: "",
                        password: generatedPassword,
                      });
                      setShowModal(true);
                    }}
                  >
                    + Save to Vault
                  </button>
                </div>
              )}
            </div>

            <div className="generator-tips">
              <h3>Password Tips</h3>

              <p>✓ Use at least 12 characters.</p>
              <p>✓ Include uppercase and lowercase letters.</p>
              <p>✓ Include numbers and special characters.</p>
              <p>✓ Avoid reusing passwords across websites.</p>
            </div>
          </section>
        )}

        {/* SECURITY CENTER */}

        {activePage === "security" && (
          <section className="security-page">
            <div className="security-card">
              <div className="security-icon">🔐</div>

              <div>
                <h2>Your SecurePass Vault</h2>
                <p>Your password manager is connected to your account.</p>
              </div>

              <span className="status-active">Active</span>
            </div>

            <div className="security-card">
              <div>
                <h3>Saved Passwords</h3>
                <p>{passwords.length} passwords stored in your vault.</p>
              </div>

              <strong>{passwords.length}</strong>
            </div>

            <div className="security-tips">
              <h2>Security Recommendations</h2>

              <ul>
                <li>Use a unique password for every website.</li>
                <li>Choose long, randomly generated passwords.</li>
                <li>Never share your master account password.</li>
                <li>Keep your email account protected.</li>
                <li>Enable two-factor authentication on supported websites.</li>
              </ul>
            </div>

            <p className="security-note">
              Note: These are basic recommendations, not a live security audit.
            </p>
          </section>
        )}
      </main>

      {/* ADD / EDIT MODAL */}

      {showModal && (
        <PasswordModal
          item={editItem}
          onClose={() => {
            setShowModal(false);
            setEditItem(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// STAT CARD

function StatCard({ title, value, icon, description }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div className="stat-icon">{icon}</div>
      </div>

      <h2>{value}</h2>

      <p>{description}</p>
    </div>
  );
}

// PASSWORD LIST

function PasswordList({
  passwords,
  visiblePasswords,
  onToggle,
  onCopy,
  onEdit,
  onDelete,
  onRegenerate,
  loading,
}) {
  if (loading) {
    return <div className="empty-state">Loading passwords...</div>;
  }

  if (passwords.length === 0) {
    return (
      <div className="empty-state">
        <span>🔐</span>
        <h3>No passwords found</h3>
        <p>Add your first account to start using SecurePass.</p>
      </div>
    );
  }

  return (
    <div className="password-list">
      {passwords.map((item) => (
        <div className="password-row" key={item.id}>
          <div className="website-icon">
            {(item.title || "P").charAt(0).toUpperCase()}
          </div>

          <div className="password-info">
            <h3>{item.title}</h3>
            <p>{item.username}</p>
            <small>{item.website}</small>
          </div>

          <div className="password-value">
            <span>
              {visiblePasswords.includes(item.id)
                ? item.password
                : "••••••••••••"}
            </span>

            <button onClick={() => onToggle(item.id)}>
              {visiblePasswords.includes(item.id) ? "Hide" : "Show"}
            </button>
          </div>

          <div className="password-actions">
            <button title="Copy" onClick={() => onCopy(item.password)}>
              Copy
            </button>

            <button title="Edit" onClick={() => onEdit(item)}>
              Edit
            </button>

            <button title="Regenerate" onClick={() => onRegenerate(item.id)}>
              ↻
            </button>

            <button
              className="delete-action"
              title="Delete"
              onClick={() => onDelete(item.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ADD / EDIT PASSWORD MODAL

function PasswordModal({ item, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: item?.title || "",
    username: item?.username || "",
    website: item?.website || "",
    password: item?.password || "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="password-modal">
        <div className="modal-heading">
          <div>
            <h2>{item?.id ? "Edit Password" : "Add New Password"}</h2>
            <p>Enter your account information.</p>
          </div>

          <button onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Account Title</label>

          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Instagram"
            required
          />

          <label>Username / Email</label>

          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="your@email.com"
            required
          />

          <label>Website</label>

          <input
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://instagram.com"
            required
          />

          <label>Password</label>

          <div className="modal-password-field">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="primary-btn">
              {item?.id ? "Update Password" : "Save Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Dashboard;
