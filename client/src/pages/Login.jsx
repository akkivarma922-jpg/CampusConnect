import { useState } from "react";
import {
  LockKeyhole,
  Mail,
  ArrowLeft,
  ShieldCheck,
  ClipboardList,
  Users
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Invalid email or password"
        );
        return;
      }

      setMessage(`Welcome, ${data.user.name}!`);

      setTimeout(() => {
        if (data.user.role === "admin") {
          navigate("/admin");
        } else if (data.user.role === "cr") {
          navigate("/cr");
        } else if (data.user.role === "staff") {
          navigate("/staff-dashboard");
        } else if (data.user.role === "student") {
          navigate("/student-dashboard");
        } else {
          navigate("/login");
        }
      }, 500);
    } catch (error) {
      setMessage(
        "Unable to connect to the server. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <Link to="/" className="back-link">
            <ArrowLeft size={17} />
            Back to CampusConnect
          </Link>

          <div className="login-brand">
            <div className="logo-icon">C</div>

            <div>
              <h2>CampusConnect</h2>
              <p>Connected campus. Better solutions.</p>
            </div>
          </div>

          <div className="login-left-content">
            <span className="login-badge">
              <ShieldCheck size={16} />
              Smart Campus Issue Management
            </span>

            <h1>
              Make campus problems
              <span> easier to solve.</span>
            </h1>

            <p>
              Report, track, resolve, and verify campus
              issues through one connected platform designed
              for students, CRs, staff, and administrators.
            </p>

            <div className="login-features">
              <div className="login-feature">
                <div className="feature-icon">
                  <ClipboardList size={20} />
                </div>

                <div>
                  <h3>Track Every Issue</h3>
                  <p>
                    Follow issues from reporting to resolution.
                  </p>
                </div>
              </div>

              <div className="login-feature">
                <div className="feature-icon">
                  <Users size={20} />
                </div>

                <div>
                  <h3>Role-Based Access</h3>
                  <p>
                    Each user gets access based on their
                    campus role.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-card">
            <div className="login-heading">
              <h1>Welcome back</h1>

              <p>
                Sign in to manage and track campus issues.
              </p>
            </div>

            <form
              className="login-form"
              onSubmit={handleLogin}
            >
              <div className="form-group">
                <label>College Email</label>

                <div className="input-box">
                  <Mail size={19} />

                  <input
                    type="email"
                    placeholder="you@college.edu"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>

                <div className="input-box">
                  <LockKeyhole size={19} />

                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="login-options">
                <label className="remember">
                  <input type="checkbox" />
                  Remember me
                </label>

                <a href="#forgot">
                  Forgot password?
                </a>
              </div>

              {message && (
                <div
                  className={`login-message ${
                    message.startsWith("Welcome")
                      ? "success-message"
                      : ""
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading
                  ? "Signing in..."
                  : "Sign In"}
              </button>
            </form>

            <div className="login-info">
              <ShieldCheck size={15} />

              <span>
                Secure role-based access
              </span>

              <span>•</span>

              <span>CampusConnect</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;