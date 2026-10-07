import React, { useState } from "react";
import api from "./api.js";

export default function Login({ onLogin }) {
  // Mode: "signin" or "signup"
  const [authMode, setAuthMode] = useState("signin");

  // Sign In states
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up states
  const [signUpForm, setSignUpForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Status feedback
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // SIGN IN SUBMIT
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    // Validation
    if (!cleanId && !cleanPass) {
      setError("Please enter your email or username and password.");
      return;
    }
    if (!cleanId) {
      setError("Email or username is required.");
      return;
    }
    if (cleanId.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanId)) {
      setError("Please enter a valid email address format.");
      return;
    }
    if (!cleanPass) {
      setError("Password is required.");
      return;
    }
    if (cleanPass.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setLoading(true);

    try {
      // Authenticate directly against Flask Backend & MySQL
      const res = await api.signin({ identifier: cleanId, password: cleanPass });
      if (res && res.success && res.user) {
        setLoading(false);
        onLogin(res.user, rememberMe);
        return;
      } else {
        throw new Error(res.error || "Authentication failed.");
      }
    } catch (apiErr) {
      setLoading(false);
      setError(apiErr.message || "Invalid credentials. Please verify your details or create a new account.");
      return;
    }
  };

  // SIGN UP SUBMIT
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const { fullName, email, username, password, confirmPassword } = signUpForm;
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedUser = username.trim();

    // Validation
    if (!trimmedName) {
      setError("Full Name is required.");
      return;
    }
    if (trimmedName.length < 2) {
      setError("Full Name must be at least 2 characters.");
      return;
    }
    if (!trimmedEmail) {
      setError("Email address is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!trimmedUser) {
      setError("Username is required.");
      return;
    }
    if (trimmedUser.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(trimmedUser)) {
      setError("Username can only contain letters, numbers, dots, hyphens, and underscores.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify your password.");
      return;
    }

    setLoading(true);

    try {
      // Call backend signup API to register in MySQL
      const res = await api.signup({
        fullName: trimmedName,
        email: trimmedEmail,
        username: trimmedUser,
        password: password,
        confirmPassword: confirmPassword,
      });

      if (res && res.success) {
        setLoading(false);
        setSignUpForm({
          fullName: "",
          email: "",
          username: "",
          password: "",
          confirmPassword: "",
        });
        setIdentifier(trimmedEmail);
        setPassword("");
        setAuthMode("signin");
        setSuccessMessage(res.message || "Account created successfully! Please sign in with your new credentials.");
        return;
      } else {
        throw new Error(res.error || "Failed to create account.");
      }
    } catch (apiErr) {
      setLoading(false);
      setError(apiErr.message || "Failed to create account. Please check your details.");
    }
  };

  const handleFillDemo = (type = "admin") => {
    setError("");
    setSuccessMessage("");
    if (type === "admin") {
      setIdentifier("admin@complainai.com");
      setPassword("admin123");
    } else {
      setIdentifier("support@complainai.com");
      setPassword("support123");
    }
  };

  const handleInstantDemoLogin = async () => {
    setError("");
    setSuccessMessage("");
    setLoading(true);
    try {
      const res = await api.signin({ identifier: "admin@complainai.com", password: "admin123" });
      if (res && res.success && res.user) {
        setLoading(false);
        onLogin(res.user, true);
      } else {
        throw new Error(res.error || "Authentication failed.");
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || "Could not connect to authentication server.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-backdrop-glow login-glow-1" />
      <div className="login-backdrop-glow login-glow-2" />

      <div className="login-card-wrapper">
        {/* Left / Hero Info Panel */}
        <div className="login-hero-panel">
          <div className="login-brand">
            <div className="brand-icon">C</div>
            <div>
              <strong>ComplainAI</strong>
              <span>Smart Resolution System</span>
            </div>
          </div>

          <div className="login-hero-body">
            <div className="login-ai-tag">✦ AI-Powered Platform</div>
            <h2>Intelligent Complaint Classification & Resolution</h2>
            <p>
              Leverage advanced machine learning to automatically triage, prioritize,
              and resolve customer complaints in real time.
            </p>

            <div className="login-feature-list">
              <div className="login-feature-item">
                <span className="feature-icon">✦</span>
                <div>
                  <strong>Instant Classification</strong>
                  <small>Categorizes issues into Fraud, Billing, Tech & more</small>
                </div>
              </div>
              <div className="login-feature-item">
                <span className="feature-icon">⚡</span>
                <div>
                  <strong>Smart Priority Scoring</strong>
                  <small>Automated urgency detection with confidence scores</small>
                </div>
              </div>
              <div className="login-feature-item">
                <span className="feature-icon">◔</span>
                <div>
                  <strong>Actionable Analytics</strong>
                  <small>Real-time distribution charts and resolution tracking</small>
                </div>
              </div>
            </div>
          </div>

          <div className="login-hero-footer">
            <span>Enterprise Grade Security</span>
            <span>•</span>
            <span>256-bit Encryption</span>
            <span>•</span>
            <span>v2.4 Active</span>
          </div>
        </div>

        {/* Right / Auth Panel */}
        <div className="login-form-panel">
          {/* Mode Switch Tabs */}
          <div className="auth-tab-switch">
            <button
              type="button"
              className={`auth-tab-btn ${authMode === "signin" ? "active" : ""}`}
              onClick={() => {
                setAuthMode("signin");
                setError("");
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${authMode === "signup" ? "active" : ""}`}
              onClick={() => {
                setAuthMode("signup");
                setError("");
                setSuccessMessage("");
              }}
            >
              Sign Up
            </button>
          </div>

          <div className="login-form-header">
            <h3>{authMode === "signin" ? "Welcome Back" : "Create Account"}</h3>
            <p>
              {authMode === "signin"
                ? "Sign in to access your administrative dashboard"
                : "Register a new account to classify complaints"}
            </p>
          </div>

          {/* Success Alert */}
          {successMessage && (
            <div className="login-success-alert" role="status">
              <span className="success-icon">✓</span>
              <div className="success-text">{successMessage}</div>
              <button
                type="button"
                className="success-dismiss"
                onClick={() => setSuccessMessage("")}
                title="Dismiss"
              >
                ×
              </button>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="login-error-alert" role="alert">
              <span className="error-icon">!</span>
              <div className="error-text">{error}</div>
              <button
                type="button"
                className="error-dismiss"
                onClick={() => setError("")}
                title="Dismiss"
              >
                ×
              </button>
            </div>
          )}

          {/* SIGN IN FORM */}
          {authMode === "signin" ? (
            <form onSubmit={handleLoginSubmit} className="login-form" noValidate>
              <div className="form-group">
                <label htmlFor="login-identifier">Email or Username</label>
                <div className="input-with-icon">
                  <span className="input-icon">✉</span>
                  <input
                    id="login-identifier"
                    type="text"
                    placeholder="admin@complainai.com or admin"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (error) setError("");
                    }}
                    autoComplete="username"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="login-password">Password</label>
                </div>
                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "👁" : "👁‍🗨"}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <span className="helper-hint">Protected Session</span>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="login-spinner" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <span className="arrow-icon">→</span>
                  </>
                )}
              </button>

              <div className="auth-switch-prompt">
                Don't have an account?
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setError("");
                    setSuccessMessage("");
                  }}
                >
                  Sign Up
                </button>
              </div>

              {/* Quick Demo Access Box */}
              <div className="demo-credentials-box">
                <div className="demo-header">
                  <span className="demo-badge">Quick Demo Access</span>
                  <button
                    type="button"
                    className="instant-login-link"
                    onClick={handleInstantDemoLogin}
                    disabled={loading}
                  >
                    1-Click Sign In ⚡
                  </button>
                </div>
                <div className="demo-credentials-list">
                  <button
                    type="button"
                    className="demo-pill"
                    onClick={() => handleFillDemo("admin")}
                    title="Autofill Administrator credentials"
                  >
                    <strong>Admin:</strong> admin@complainai.com / admin123
                  </button>
                  <button
                    type="button"
                    className="demo-pill"
                    onClick={() => handleFillDemo("support")}
                    title="Autofill Support credentials"
                  >
                    <strong>Support:</strong> support@complainai.com / support123
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignUpSubmit} className="login-form" noValidate>
              <div className="form-group">
                <label htmlFor="signup-name">Full Name</label>
                <div className="input-with-icon">
                  <span className="input-icon">👤</span>
                  <input
                    id="signup-name"
                    type="text"
                    placeholder="e.g. John Doe"
                    value={signUpForm.fullName}
                    onChange={(e) => {
                      setSignUpForm({ ...signUpForm, fullName: e.target.value });
                      if (error) setError("");
                    }}
                    autoComplete="name"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="signup-email">Email Address</label>
                <div className="input-with-icon">
                  <span className="input-icon">✉</span>
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="e.g. john@example.com"
                    value={signUpForm.email}
                    onChange={(e) => {
                      setSignUpForm({ ...signUpForm, email: e.target.value });
                      if (error) setError("");
                    }}
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="signup-username">Username</label>
                <div className="input-with-icon">
                  <span className="input-icon">@</span>
                  <input
                    id="signup-username"
                    type="text"
                    placeholder="e.g. johndoe"
                    value={signUpForm.username}
                    onChange={(e) => {
                      setSignUpForm({ ...signUpForm, username: e.target.value });
                      if (error) setError("");
                    }}
                    autoComplete="username"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>
                  <input
                    id="signup-password"
                    type={showSignUpPassword ? "text" : "password"}
                    placeholder="At least 4 characters"
                    value={signUpForm.password}
                    onChange={(e) => {
                      setSignUpForm({ ...signUpForm, password: e.target.value });
                      if (error) setError("");
                    }}
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    title={showSignUpPassword ? "Hide password" : "Show password"}
                    aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                  >
                    {showSignUpPassword ? "👁" : "👁‍🗨"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="signup-confirm-password">Confirm Password</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>
                  <input
                    id="signup-confirm-password"
                    type={showSignUpPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={signUpForm.confirmPassword}
                    onChange={(e) => {
                      setSignUpForm({ ...signUpForm, confirmPassword: e.target.value });
                      if (error) setError("");
                    }}
                    autoComplete="new-password"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="login-spinner" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <span className="arrow-icon">→</span>
                  </>
                )}
              </button>

              <div className="auth-switch-prompt">
                Already have an account?
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signin");
                    setError("");
                  }}
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
