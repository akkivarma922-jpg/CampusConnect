import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  LogOut,
  ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const API_URL = "http://localhost:5000";

function StudentDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setError("");

      const userResponse = await fetch(
        `${API_URL}/api/auth/me`,
        {
          credentials: "include"
        }
      );

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        navigate("/login");
        return;
      }

      if (userData.user.role !== "student") {
        navigate("/login");
        return;
      }

      setUser(userData.user);

      const issuesResponse = await fetch(
        `${API_URL}/api/issues/student-class`,
        {
          credentials: "include"
        }
      );

      const issuesData = await issuesResponse.json();

      if (!issuesResponse.ok) {
        throw new Error(
          issuesData.message ||
            "Failed to load class issues"
        );
      }

      setIssues(issuesData);
    } catch (error) {
      console.error(
        "Student dashboard error:",
        error
      );

      setError(
        error.message ||
          "Unable to load student dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(
        `${API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include"
        }
      );
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }

    navigate("/login");
  };

  const getStatusClass = (status) => {
    return status
      .toLowerCase()
      .replaceAll("_", "-");
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>

          <p>
            Loading student dashboard...
          </p>
        </div>
      </div>
    );
  }

  const totalIssues = issues.length;

  const activeIssues = issues.filter(
    (issue) =>
      issue.status !== "RESOLVED"
  ).length;

  const resolvedIssues = issues.filter(
    (issue) =>
      issue.status === "RESOLVED"
  ).length;

  return (
    <div className="dashboard-page">
      <header className="navbar">
        <div className="navbar-left">
          <div className="logo-icon">
            C
          </div>

          <div className="logo-text">
            Campus<span>Connect</span>
          </div>
        </div>

        <div className="navbar-right">
          <div className="dashboard-user">
            <div className="dashboard-user-icon">
              {user?.name
                ?.charAt(0)
                .toUpperCase()}
            </div>

            <div className="dashboard-user-info">
              <strong>
                {user?.name}
              </strong>

              <span>
                Student •{" "}
                {user?.department}{" "}
                {user?.year}
                {user?.section}
              </span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-hero">
          <div>
            <span className="dashboard-label">
              <ShieldCheck size={16} />
              STUDENT DASHBOARD
            </span>

            <h1>
              Welcome to CampusConnect.
            </h1>

            <p>
              View campus issues and
              track their status for your
              assigned class.
            </p>
          </div>

          <div className="dashboard-hero-icon">
            <ClipboardList size={48} />
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
              {totalIssues}
            </div>
          </div>

          <div className="stat-card orange">
            <div className="stat-icon">
              <Clock3 size={22} />
            </div>

            <h3>
              Active
            </h3>

            <div className="stat-number">
              {activeIssues}
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
              {resolvedIssues}
            </div>
          </div>
        </section>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>
                Class Issues
              </h2>

              <p>
                Issues reported for{" "}
                {user?.department}{" "}
                {user?.year}
                {user?.section}.
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
                There are currently no
                reported issues for your
                class.
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

                    <div className="issue-badges">
                      <span
                        className={`status-badge ${getStatusClass(
                          issue.status
                        )}`}
                      >
                        {issue.status.replaceAll(
                          "_",
                          " "
                        )}
                      </span>

                      <span
                        className={`priority-badge ${
                          issue.priority?.toLowerCase()
                        }`}
                      >
                        {issue.priority}
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

                  <div className="issue-view-only">
                    <ShieldCheck size={16} />

                    <span>
                      View only • Managed by
                      your Class Representative
                      and campus staff
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default StudentDashboard;