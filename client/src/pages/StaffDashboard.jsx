import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  LogOut,
  PlayCircle,
  RotateCcw,
  ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const API_URL = "http://localhost:5000";

function StaffDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
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

      if (userData.user.role !== "staff") {
        navigate("/login");
        return;
      }

      setUser(userData.user);

      const issuesResponse = await fetch(
        `${API_URL}/api/issues/staff`,
        {
          credentials: "include"
        }
      );

      const issuesData = await issuesResponse.json();

      if (!issuesResponse.ok) {
        throw new Error(
          issuesData.message || "Failed to load issues"
        );
      }

      setIssues(issuesData);
    } catch (error) {
      console.error("Staff dashboard error:", error);

      setError(
        error.message ||
          "Unable to load staff dashboard"
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
      console.error("Logout error:", error);
    }

    navigate("/login");
  };

  const performAction = async (issueId, action) => {
    try {
      setActionLoading(`${issueId}-${action}`);
      setError("");

      let endpoint = "";

      if (action === "acknowledge") {
        endpoint = `${API_URL}/api/issues/${issueId}/acknowledge`;
      }

      if (action === "start") {
        endpoint = `${API_URL}/api/issues/${issueId}/start`;
      }

      if (action === "complete") {
        endpoint = `${API_URL}/api/issues/${issueId}/complete`;
      }

      const response = await fetch(
        endpoint,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            resolution:
              "Staff completed the required campus work."
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Action failed"
        );
      }

      await loadDashboard();
    } catch (error) {
      console.error("Issue action error:", error);

      setError(error.message);
    } finally {
      setActionLoading("");
    }
  };

  const getStatusClass = (status) => {
    return status
      .toLowerCase()
      .replaceAll("_", "-");
  };

  const getPriorityClass = (priority) => {
    return priority.toLowerCase();
  };

  const getActionButton = (issue) => {
    if (issue.status === "REPORTED") {
      return (
        <button
          className="primary-button"
          onClick={() =>
            performAction(
              issue._id,
              "acknowledge"
            )
          }
          disabled={
            actionLoading ===
            `${issue._id}-acknowledge`
          }
        >
          <CheckCircle2 size={18} />

          {actionLoading ===
          `${issue._id}-acknowledge`
            ? "Acknowledging..."
            : "Acknowledge"}
        </button>
      );
    }

    if (issue.status === "ACKNOWLEDGED") {
      return (
        <button
          className="primary-button"
          onClick={() =>
            performAction(
              issue._id,
              "start"
            )
          }
          disabled={
            actionLoading ===
            `${issue._id}-start`
          }
        >
          <PlayCircle size={18} />

          {actionLoading ===
          `${issue._id}-start`
            ? "Starting..."
            : "Start Work"}
        </button>
      );
    }

    if (issue.status === "IN_PROGRESS") {
      return (
        <button
          className="primary-button"
          onClick={() =>
            performAction(
              issue._id,
              "complete"
            )
          }
          disabled={
            actionLoading ===
            `${issue._id}-complete`
          }
        >
          <CheckCircle2 size={18} />

          {actionLoading ===
          `${issue._id}-complete`
            ? "Completing..."
            : "Mark Work Completed"}
        </button>
      );
    }

    if (issue.status === "REOPENED") {
      return (
        <button
          className="primary-button"
          onClick={() =>
            performAction(
              issue._id,
              "acknowledge"
            )
          }
          disabled={
            actionLoading ===
            `${issue._id}-acknowledge`
          }
        >
          <RotateCcw size={18} />

          {actionLoading ===
          `${issue._id}-acknowledge`
            ? "Acknowledging..."
            : "Handle Reopened Issue"}
        </button>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>

          <p>
            Loading staff dashboard...
          </p>
        </div>
      </div>
    );
  }

  const reportedCount = issues.filter(
    (issue) =>
      issue.status === "REPORTED"
  ).length;

  const acknowledgedCount = issues.filter(
    (issue) =>
      issue.status === "ACKNOWLEDGED"
  ).length;

  const inProgressCount = issues.filter(
    (issue) =>
      issue.status === "IN_PROGRESS"
  ).length;

  const reopenedCount = issues.filter(
    (issue) =>
      issue.status === "REOPENED"
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
                Staff •{" "}
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
              STAFF DASHBOARD
            </span>

            <h1>
              Manage campus issues.
            </h1>

            <p>
              Review, acknowledge, work on,
              and complete issues assigned to
              your campus team.
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

            <h3>Total Active</h3>

            <div className="stat-number">
              {issues.length}
            </div>
          </div>

          <div className="stat-card orange">
            <div className="stat-icon">
              <Clock3 size={22} />
            </div>

            <h3>Reported</h3>

            <div className="stat-number">
              {reportedCount}
            </div>
          </div>

          <div className="stat-card purple">
            <div className="stat-icon">
              <PlayCircle size={22} />
            </div>

            <h3>In Progress</h3>

            <div className="stat-number">
              {inProgressCount}
            </div>
          </div>

          <div className="stat-card green">
            <div className="stat-icon">
              <RotateCcw size={22} />
            </div>

            <h3>Reopened</h3>

            <div className="stat-number">
              {reopenedCount}
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
                Campus Issues
              </h2>

              <p>
                Issues requiring staff
                attention.
              </p>
            </div>
          </div>

          {issues.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <CheckCircle2 size={30} />
              </div>

              <h3>
                No active issues
              </h3>

              <p>
                There are currently no
                issues requiring your
                attention.
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
                        className={`priority-badge ${getPriorityClass(
                          issue.priority
                        )}`}
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
                      🏫 {issue.department}{" "}
                      {issue.year}
                      {issue.section}
                    </span>

                    <span>
                      📁 {issue.category}
                    </span>
                  </div>

                  {issue.assignedStaff && (
                    <div className="issue-assigned">
                      Assigned to:{" "}
                      <strong>
                        {issue.assignedStaff.name}
                      </strong>
                    </div>
                  )}

                  <div className="issue-actions">
                    {getActionButton(
                      issue
                    )}

                    {issue.status ===
                      "AWAITING_VERIFICATION" && (
                      <div className="verification-note">
                        <CheckCircle2
                          size={17}
                        />

                        Waiting for CR
                        verification
                      </div>
                    )}

                    <span className="issue-action-hint">
                      <ArrowRight
                        size={15}
                      />

                      Follow the issue
                      workflow
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

export default StaffDashboard;