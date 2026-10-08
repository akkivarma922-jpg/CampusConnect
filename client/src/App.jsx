import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  LogOut,
  ShieldCheck,
  Users
} from "lucide-react";

import {
  Link,
  Route,
  Routes,
  useNavigate
} from "react-router-dom";

import { useEffect, useState } from "react";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import StudentDashboard from "./pages/StudentDashboard";

import "./App.css";

const API_URL = "http://localhost:5000";

function Logo() {
  return (
    <Link to="/" className="navbar-left">
      <div className="logo-icon">
        C
      </div>

      <div className="logo-text">
        Campus<span>Connect</span>
      </div>
    </Link>
  );
}

function DashboardHeader({
  userName,
  userRole,
  onLogout
}) {
  return (
    <header className="navbar">
      <Logo />

      <div className="navbar-right">
        <div className="dashboard-user">
          <div className="dashboard-user-icon">
            {userName?.charAt(0).toUpperCase()}
          </div>

          <div className="dashboard-user-info">
            <strong>
              {userName}
            </strong>

            <span>
              {userRole}
            </span>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={onLogout}
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </header>
  );
}

function Home() {
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    inProgress: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPublicSummary = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/issues/public-summary`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            "Failed to load campus issue summary"
          );
        }

        setStats({
          total:
            Number(data.total) || 0,

          resolved:
            Number(data.resolved) || 0,

          inProgress:
            Number(data.inProgress) || 0
        });
      } catch (error) {
        console.error(
          "Failed to load home page summary:",
          error
        );

        setError(
          "Unable to load live issue data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPublicSummary();
  }, []);

  return (
    <div className="home-page">
      <nav className="navbar">
        <Logo />

        <div className="navbar-right">
          <Link
            to="/login"
            className="secondary-button"
          >
            Sign In
          </Link>

          <Link
            to="/login"
            className="primary-button"
          >
            Get Started
            <ArrowRight size={17} />
          </Link>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <span className="hero-badge">
                <ShieldCheck size={16} />
                Smart Campus Issue Management
              </span>

              <h1>
                Make campus problems
                <span>
                  easier to solve.
                </span>
              </h1>

              <p>
                CampusConnect helps Class
                Representatives, staff, and
                administrators report, track,
                resolve, and verify campus
                issues through one connected
                platform.
              </p>

              <div className="hero-buttons">
                <Link
                  to="/login"
                  className="primary-button"
                >
                  Get Started
                  <ArrowRight size={18} />
                </Link>

                <a
                  href="#features"
                  className="secondary-button"
                >
                  Explore Features
                </a>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-card">
                <div className="hero-card-header">
                  <div>
                    <span>
                      Campus Issues
                    </span>

                    <strong>
                      {loading
                        ? "Loading"
                        : stats.total > 0
                          ? "Live Overview"
                          : "No Issues"}
                    </strong>
                  </div>

                  <BarChart3 size={22} />
                </div>

                <div className="hero-status">
                  <div>
                    <strong>
                      {loading
                        ? "—"
                        : stats.total}
                    </strong>

                    <span>
                      Total Issues
                    </span>
                  </div>

                  <div>
                    <strong>
                      {loading
                        ? "—"
                        : stats.resolved}
                    </strong>

                    <span>
                      Resolved
                    </span>
                  </div>
                </div>

                {loading ? (
                  <>
                    <div className="hero-issue blue">
                      <div>
                        <strong>
                          Loading issue data...
                        </strong>

                        <span>
                          CampusConnect
                        </span>
                      </div>

                      <span>
                        Loading
                      </span>
                    </div>

                    <div className="hero-issue yellow">
                      <div>
                        <strong>
                          Connecting to database
                        </strong>

                        <span>
                          Fetching live statistics
                        </span>
                      </div>

                      <span>
                        Live
                      </span>
                    </div>
                  </>
                ) : error ? (
                  <div className="hero-issue yellow">
                    <div>
                      <strong>
                        Live data unavailable
                      </strong>

                      <span>
                        Please try again later
                      </span>
                    </div>

                    <span>
                      Error
                    </span>
                  </div>
                ) : stats.total === 0 ? (
                  <div className="hero-issue green">
                    <div>
                      <strong>
                        No campus issues
                      </strong>

                      <span>
                        Everything is clear
                      </span>
                    </div>

                    <span>
                      Clear
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="hero-issue blue">
                      <div>
                        <strong>
                          {stats.total} issue
                          {stats.total !== 1
                            ? "s"
                            : ""}{" "}
                          being tracked
                        </strong>

                        <span>
                          CampusConnect
                          issue management
                        </span>
                      </div>

                      <span>
                        Active
                      </span>
                    </div>

                    <div className="hero-issue yellow">
                      <div>
                        <strong>
                          {stats.inProgress} in
                          progress
                        </strong>

                        <span>
                          Staff action and
                          verification
                        </span>
                      </div>

                      <span>
                        Tracking
                      </span>
                    </div>

                    <div className="hero-issue green">
                      <div>
                        <strong>
                          {stats.resolved} resolved
                        </strong>

                        <span>
                          Verified by CRs
                        </span>
                      </div>

                      <span>
                        Resolved
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <section
          className="features-section"
          id="features"
        >
          <div className="container">
            <div className="section-heading">
              <span>
                BUILT FOR CAMPUS
              </span>

              <h2>
                One platform.
                <br />
                Everyone connected.
              </h2>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-card-icon">
                  <ClipboardList size={23} />
                </div>

                <h3>
                  Report & Track
                </h3>

                <p>
                  Class Representatives
                  can report issues and
                  follow their progress.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-card-icon">
                  <Users size={23} />
                </div>

                <h3>
                  Role-Based Access
                </h3>

                <p>
                  Students, CRs, staff,
                  and administrators see
                  only what they need.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-card-icon">
                  <Clock3 size={23} />
                </div>

                <h3>
                  Clear Status
                </h3>

                <p>
                  Follow every issue from
                  reporting through staff
                  action to verification.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-card-icon">
                  <CheckCircle2 size={23} />
                </div>

                <h3>
                  Verify Resolution
                </h3>

                <p>
                  CRs verify completed
                  work before an issue is
                  finally resolved.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function CRDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      const userResponse =
        await fetch(
          `${API_URL}/api/auth/me`,
          {
            credentials: "include"
          }
        );

      const userData =
        await userResponse.json();

      if (!userResponse.ok) {
        navigate("/login");
        return;
      }

      if (
        userData.user.role !== "cr"
      ) {
        navigate("/login");
        return;
      }

      setUser(userData.user);

      const issuesResponse =
        await fetch(
          `${API_URL}/api/issues/my-class`,
          {
            credentials: "include"
          }
        );

      const issuesData =
        await issuesResponse.json();

      if (!issuesResponse.ok) {
        throw new Error(
          issuesData.message ||
          "Failed to load class issues"
        );
      }

      setIssues(
        Array.isArray(issuesData)
          ? issuesData
          : []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    await fetch(
      `${API_URL}/api/auth/logout`,
      {
        method: "POST",
        credentials: "include"
      }
    );

    navigate("/login");
  };

  const handleVerify = async (
    issueId
  ) => {
    try {
      const response =
        await fetch(
          `${API_URL}/api/issues/${issueId}/verify`,
          {
            method: "PUT",
            credentials: "include"
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          "Failed to verify issue"
        );
        return;
      }

      await loadData();
    } catch (error) {
      console.error(error);

      alert(
        "Unable to connect to the server."
      );
    }
  };

  const handleReopen = async (
    issueId
  ) => {
    try {
      const response =
        await fetch(
          `${API_URL}/api/issues/${issueId}/reopen`,
          {
            method: "PUT",
            credentials: "include"
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          "Failed to reopen issue"
        );
        return;
      }

      await loadData();
    } catch (error) {
      console.error(error);

      alert(
        "Unable to connect to the server."
      );
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>

          <p>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const total = issues.length;

  const reported = issues.filter(
    (issue) =>
      issue.status === "REPORTED"
  ).length;

  const inProgress = issues.filter(
    (issue) =>
      issue.status === "ACKNOWLEDGED" ||
      issue.status === "IN_PROGRESS" ||
      issue.status === "WORK_COMPLETED" ||
      issue.status === "AWAITING_VERIFICATION" ||
      issue.status === "REOPENED" ||
      issue.status === "ESCALATED"
  ).length;

  const resolved = issues.filter(
    (issue) =>
      issue.status === "RESOLVED"
  ).length;

  return (
    <div className="dashboard-page">
      <DashboardHeader
        userName={user?.name}
        userRole={`CR • ${user?.department} ${user?.year}${user?.section}`}
        onLogout={handleLogout}
      />

      <main className="dashboard-content">
        <section className="dashboard-hero">
          <div>
            <span className="dashboard-label">
              CLASS REPRESENTATIVE
            </span>

            <h1>
              {user?.department}{" "}
              {user?.year}
              {user?.section}
            </h1>

            <p>
              Report and track campus
              issues for your assigned
              class.
            </p>
          </div>

          <div className="dashboard-actions">
            <Link
              to="/cr/report"
              className="primary-button"
            >
              Report New Issue
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon">
              <ClipboardList size={22} />
            </div>

            <h3>
              Total Issues
            </h3>

            <div className="stat-number">
              {total}
            </div>
          </div>

          <div className="stat-card orange">
            <div className="stat-icon">
              <Clock3 size={22} />
            </div>

            <h3>
              Reported
            </h3>

            <div className="stat-number">
              {reported}
            </div>
          </div>

          <div className="stat-card purple">
            <div className="stat-icon">
              <BarChart3 size={22} />
            </div>

            <h3>
              In Progress
            </h3>

            <div className="stat-number">
              {inProgress}
            </div>
          </div>

          <div className="stat-card green">
            <div className="stat-icon">
              <CheckCircle2 size={22} />
            </div>

            <h3>
              Resolved
            </h3>

            <div className="stat-number">
              {resolved}
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>
                Class Issues
              </h2>

              <p>
                Issues reported for your
                assigned class.
              </p>
            </div>
          </div>

          {issues.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FileText size={30} />
              </div>

              <h3>
                No issues yet
              </h3>

              <p>
                Reported class issues will
                appear here.
              </p>
            </div>
          ) : (
            <div className="issue-list">
              {issues.map((issue) => (
                <div
                  className="issue-card"
                  key={issue._id}
                >
                  <div className="issue-card-top">
                    <div>
                      <h3 className="issue-title">
                        {issue.title}
                      </h3>

                      <p className="issue-description">
                        {issue.description}
                      </p>
                    </div>

                    <div>
                      <span className="status-badge">
                        {issue.status.replaceAll(
                          "_",
                          " "
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="issue-meta">
                    <span>
                      📍 {issue.location}
                    </span>

                    <span>
                      📁 {issue.category}
                    </span>

                    <span>
                      ⚡ {issue.priority}
                    </span>
                  </div>

                  {issue.status ===
                    "AWAITING_VERIFICATION" && (
                    <div className="issue-actions">
                      <button
                        className="primary-button"
                        onClick={() =>
                          handleVerify(
                            issue._id
                          )
                        }
                      >
                        <CheckCircle2
                          size={18}
                        />

                        Verify & Resolve
                      </button>

                      <button
                        className="secondary-button"
                        onClick={() =>
                          handleReopen(
                            issue._id
                          )
                        }
                      >
                        Reopen Issue
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function ReportIssue() {
  const navigate = useNavigate();

  const [user, setUser] =
    useState(null);

  const [form, setForm] =
    useState({
      title: "",
      description: "",
      category:
        "Internet/Wi-Fi",
      location: "",
      priority: "Medium"
    });

  const [loading, setLoading] =
    useState(false);

  const [pageLoading, setPageLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    const loadUser =
      async () => {
        try {
          const response =
            await fetch(
              `${API_URL}/api/auth/me`,
              {
                credentials:
                  "include"
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
              "Please login first"
            );
          }

          if (
            data.user.role !== "cr"
          ) {
            throw new Error(
              "CR access required"
            );
          }

          setUser(data.user);
        } catch (error) {
          console.error(error);

          navigate("/login");
        } finally {
          setPageLoading(false);
        }
      };

    loadUser();
  }, [navigate]);

  const handleLogout =
    async () => {
      try {
        await fetch(
          `${API_URL}/api/auth/logout`,
          {
            method: "POST",
            credentials:
              "include"
          }
        );
      } catch (error) {
        console.error(error);
      }

      navigate("/login");
    };

  const handleChange =
    (event) => {
      setForm({
        ...form,
        [event.target.name]:
          event.target.value
      });
    };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const response =
          await fetch(
            `${API_URL}/api/issues`,
            {
              method: "POST",
              credentials:
                "include",
              headers: {
                "Content-Type":
                  "application/json"
              },
              body:
                JSON.stringify(form)
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            "Failed to report issue"
          );
        }

        setSuccess(
          "Issue reported successfully!"
        );

        setForm({
          title: "",
          description: "",
          category:
            "Internet/Wi-Fi",
          location: "",
          priority:
            "Medium"
        });

        setTimeout(() => {
          navigate("/cr");
        }, 1200);
      } catch (error) {
        setError(
          error.message
        );
      } finally {
        setLoading(false);
      }
    };

  if (pageLoading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>

          <p>
            Loading report page...
          </p>
        </div>
      </div>
    );
  }

  const className =
    user
      ? `${user.department} ${user.year}${user.section}`
      : "My Class";

  return (
    <div className="form-page">
      <DashboardHeader
        userName={
          user
            ? user.name
            : "Class Representative"
        }
        userRole={
          user
            ? `${user.department} ${user.year}${user.section}`
            : "CR"
        }
        onLogout={
          handleLogout
        }
      />

      <main className="form-page-content">
        <div className="form-page-heading">
          <Link
            to="/cr"
            className="back"
          >
            ← Back to Dashboard
          </Link>

          <h1>
            Report a Campus Issue
          </h1>

          <p>
            Submit an issue on behalf
            of your assigned class{" "}
            <strong>
              {className}
            </strong>
            .
          </p>
        </div>

        <form
          className="form-card"
          onSubmit={
            handleSubmit
          }
        >
          <div className="form-grid">
            <div className="form-group full-width">
              <label>
                Issue Title
              </label>

              <input
                type="text"
                name="title"
                value={
                  form.title
                }
                onChange={
                  handleChange
                }
                placeholder="Example: Classroom projector not working"
                required
              />
            </div>

            <div className="form-group full-width">
              <label>
                Description
              </label>

              <textarea
                name="description"
                value={
                  form.description
                }
                onChange={
                  handleChange
                }
                placeholder="Describe the problem clearly..."
                required
              />
            </div>

            <div className="form-group">
              <label>
                Category
              </label>

              <select
                name="category"
                value={
                  form.category
                }
                onChange={
                  handleChange
                }
              >
                <option>
                  Internet/Wi-Fi
                </option>

                <option>
                  Electrical
                </option>

                <option>
                  Classroom Equipment
                </option>

                <option>
                  Cleanliness
                </option>

                <option>
                  Hostel
                </option>

                <option>
                  Transport
                </option>

                <option>
                  Water
                </option>

                <option>
                  Other
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>
                Priority
              </label>

              <select
                name="priority"
                value={
                  form.priority
                }
                onChange={
                  handleChange
                }
              >
                <option>
                  Low
                </option>

                <option>
                  Medium
                </option>

                <option>
                  High
                </option>

                <option>
                  Critical
                </option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>
                Location
              </label>

              <input
                type="text"
                name="location"
                value={
                  form.location
                }
                onChange={
                  handleChange
                }
                placeholder="Example: Room 302, Block A"
                required
              />
            </div>
          </div>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          {success && (
            <div
              className="error-box"
              style={{
                background:
                  "#ecfdf5",
                borderColor:
                  "#a7f3d0",
                color:
                  "#047857"
              }}
            >
              {success}
            </div>
          )}

          <div className="form-actions">
            <Link
              to="/cr"
              className="secondary-button"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="primary-button"
              disabled={
                loading
              }
            >
              {loading
                ? "Reporting..."
                : "Report Issue"}

              <ArrowRight
                size={18}
              />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/admin"
        element={
          <AdminDashboard />
        }
      />

      <Route
        path="/cr"
        element={
          <CRDashboard />
        }
      />

      <Route
        path="/cr/report"
        element={
          <ReportIssue />
        }
      />

      <Route
        path="/staff-dashboard"
        element={
          <StaffDashboard />
        }
      />

      <Route
        path="/student-dashboard"
        element={
          <StudentDashboard />
        }
      />

      <Route
        path="*"
        element={<Home />}
      />
    </Routes>
  );
}

export default App;