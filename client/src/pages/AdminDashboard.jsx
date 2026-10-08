import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Clock3,
  LogOut,
  ShieldCheck,
  Users,
  RefreshCw,
  UserPlus,
  Pencil,
  Trash2,
  X,
  Save
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const API_URL = "http://localhost:5000";

const emptyUserForm = {
  name: "",
  email: "",
  password: "",
  role: "student",
  department: "",
  year: "",
  section: "",
  crId: ""
};

function AdminDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userError, setUserError] = useState("");
  const [showUserManagement, setShowUserManagement] = useState(false);

  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [savingUser, setSavingUser] = useState(false);

  const loadDashboard = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

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

      if (userData.user.role !== "admin") {
        navigate("/login");
        return;
      }

      setUser(userData.user);

      const issuesResponse = await fetch(
        `${API_URL}/api/issues`,
        {
          credentials: "include"
        }
      );

      const issuesData = await issuesResponse.json();

      if (!issuesResponse.ok) {
        throw new Error(
          issuesData.message ||
            "Failed to load issues"
        );
      }

      setIssues(issuesData);
    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error
      );

      setError(
        error.message ||
          "Unable to load admin dashboard"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      setUserError("");

      const response = await fetch(
        `${API_URL}/api/users`,
        {
          credentials: "include"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load users"
        );
      }

      setUsers(
        Array.isArray(data.users)
          ? data.users
          : []
      );
    } catch (error) {
      console.error(
        "User management error:",
        error
      );

      setUserError(
        error.message ||
          "Unable to load users"
      );
    } finally {
      setUsersLoading(false);
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

  const totalIssues = issues.length;

  const reportedIssues = issues.filter(
    (issue) =>
      issue.status === "REPORTED"
  ).length;

  const inProgressIssues = issues.filter(
    (issue) =>
      issue.status === "IN_PROGRESS" ||
      issue.status === "ACKNOWLEDGED" ||
      issue.status === "AWAITING_VERIFICATION"
  ).length;

  const resolvedIssues = issues.filter(
    (issue) =>
      issue.status === "RESOLVED"
  ).length;

  const criticalIssues = issues.filter(
    (issue) =>
      issue.priority === "Critical" &&
      issue.status !== "RESOLVED"
  ).length;

  const openUserManagement = async () => {
    setShowUserManagement(true);
    await loadUsers();
  };

  const closeUserManagement = () => {
    setShowUserManagement(false);
    setShowUserForm(false);
    setEditingUserId(null);
    setUserForm(emptyUserForm);
    setUserError("");
  };

  const handleUserInput = (event) => {
    const { name, value } = event.target;

    setUserForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const openCreateUser = () => {
    setEditingUserId(null);
    setUserForm(emptyUserForm);
    setUserError("");
    setShowUserForm(true);
  };

  const openEditUser = (selectedUser) => {
    setEditingUserId(selectedUser._id);

    setUserForm({
      name: selectedUser.name || "",
      email: selectedUser.email || "",
      password: "",
      role: selectedUser.role || "student",
      department: selectedUser.department || "",
      year: selectedUser.year || "",
      section: selectedUser.section || "",
      crId: selectedUser.crId || ""
    });

    setUserError("");
    setShowUserForm(true);
  };

  const handleSaveUser = async (event) => {
    event.preventDefault();

    try {
      setSavingUser(true);
      setUserError("");

      const payload = {
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        role: userForm.role,
        department: userForm.department.trim(),
        year: userForm.year
          ? Number(userForm.year)
          : undefined,
        section: userForm.section.trim()
      };

      if (userForm.role === "cr") {
        payload.crId =
          userForm.crId.trim();
      }

      if (!editingUserId) {
        payload.password =
          userForm.password;
      } else if (userForm.password) {
        payload.password =
          userForm.password;
      }

      if (!payload.name || !payload.email) {
        throw new Error(
          "Name and email are required"
        );
      }

      if (!editingUserId && !payload.password) {
        throw new Error(
          "Password is required when creating a user"
        );
      }

      if (
        payload.role === "cr" &&
        !payload.crId
      ) {
        throw new Error(
          "CR ID is required for a CR account"
        );
      }

      const url = editingUserId
        ? `${API_URL}/api/users/${editingUserId}`
        : `${API_URL}/api/users`;

      const method = editingUserId
        ? "PUT"
        : "POST";

      const response = await fetch(
        url,
        {
          method,
          headers: {
            "Content-Type":
              "application/json"
          },
          credentials: "include",
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save user"
        );
      }

      setShowUserForm(false);
      setEditingUserId(null);
      setUserForm(emptyUserForm);

      await loadUsers();
    } catch (error) {
      console.error(
        "Save user error:",
        error
      );

      setUserError(
        error.message ||
          "Unable to save user"
      );
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (selectedUser) => {
    if (
      selectedUser._id === user?._id
    ) {
      setUserError(
        "You cannot delete your own admin account."
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedUser.name}'s account?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUserError("");

      const response = await fetch(
        `${API_URL}/api/users/${selectedUser._id}`,
        {
          method: "DELETE",
          credentials: "include"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete user"
        );
      }

      await loadUsers();
    } catch (error) {
      console.error(
        "Delete user error:",
        error
      );

      setUserError(
        error.message ||
          "Unable to delete user"
      );
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>

          <p>
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

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
                Administrator
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
              ADMIN DASHBOARD
            </span>

            <h1>
              Campus overview at a glance.
            </h1>

            <p>
              Monitor campus issues,
              track progress, and oversee
              the complete resolution process.
            </p>
          </div>

          <div className="dashboard-hero-icon">
            <ShieldCheck size={48} />
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
              <AlertCircle size={22} />
            </div>

            <h3>
              Reported
            </h3>

            <div className="stat-number">
              {reportedIssues}
            </div>
          </div>

          <div className="stat-card purple">
            <div className="stat-icon">
              <Clock3 size={22} />
            </div>

            <h3>
              In Progress
            </h3>

            <div className="stat-number">
              {inProgressIssues}
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

        {criticalIssues > 0 && (
          <div className="error-box">
            <AlertCircle size={18} />

            <span>
              {criticalIssues} critical issue
              {criticalIssues !== 1
                ? "s"
                : ""}{" "}
              require attention.
            </span>
          </div>
        )}

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>
                All Campus Issues
              </h2>

              <p>
                Monitor issues reported across
                all classes and departments.
              </p>
            </div>

            <button
              className="secondary-button"
              onClick={() =>
                loadDashboard(true)
              }
              disabled={refreshing}
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "refresh-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>

          {issues.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <ClipboardList size={30} />
              </div>

              <h3>
                No issues yet
              </h3>

              <p>
                There are currently no
                campus issues in the system.
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
                      🏫 {issue.department}{" "}
                      {issue.year}
                      {issue.section}
                    </span>

                    <span>
                      ⚡ {issue.priority}
                    </span>
                  </div>

                  <div className="issue-meta">
                    <span>
                      👤 Reported by:{" "}
                      {issue.reportedBy?.name ||
                        "Unknown"}
                    </span>

                    <span>
                      🔧 Assigned to:{" "}
                      {issue.assignedStaff?.name ||
                        "Not assigned"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>
                User Management
              </h2>

              <p>
                Create, update, and manage
                CampusConnect user accounts.
              </p>
            </div>

            <button
              className="secondary-button"
              onClick={openUserManagement}
            >
              <Users size={17} />
              Manage Users
            </button>
          </div>

          {showUserManagement && (
            <div
              style={{
                marginTop: "24px",
                padding: "24px",
                border: "1px solid #e5e7eb",
                borderRadius: "18px",
                background: "#ffffff"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "24px",
                  flexWrap: "wrap"
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "22px"
                    }}
                  >
                    Campus Users
                  </h3>

                  <p
                    style={{
                      margin: "6px 0 0",
                      color: "#64748b"
                    }}
                  >
                    Manage student, CR, staff,
                    and administrator accounts.
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap"
                  }}
                >
                  <button
                    className="secondary-button"
                    onClick={openCreateUser}
                  >
                    <UserPlus size={17} />
                    Add User
                  </button>

                  <button
                    className="secondary-button"
                    onClick={loadUsers}
                    disabled={usersLoading}
                  >
                    <RefreshCw
                      size={17}
                      className={
                        usersLoading
                          ? "refresh-spin"
                          : ""
                      }
                    />
                    Refresh Users
                  </button>

                  <button
                    className="secondary-button"
                    onClick={closeUserManagement}
                  >
                    <X size={17} />
                    Close
                  </button>
                </div>
              </div>

              {userError && (
                <div
                  className="error-box"
                  style={{
                    marginBottom: "20px"
                  }}
                >
                  <AlertCircle size={18} />
                  <span>
                    {userError}
                  </span>
                </div>
              )}

              {showUserForm && (
                <form
                  onSubmit={handleSaveUser}
                  style={{
                    marginBottom: "28px",
                    padding: "22px",
                    borderRadius: "16px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px"
                    }}
                  >
                    <h3
                      style={{
                        margin: 0
                      }}
                    >
                      {editingUserId
                        ? "Edit User"
                        : "Create New User"}
                    </h3>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        setShowUserForm(false);
                        setEditingUserId(null);
                        setUserForm(emptyUserForm);
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "16px"
                    }}
                  >
                    <label>
                      <strong>Name</strong>
                      <input
                        type="text"
                        name="name"
                        value={userForm.name}
                        onChange={handleUserInput}
                        placeholder="Enter name"
                        required
                        style={{
                          width: "100%",
                          marginTop: "7px",
                          padding: "12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "10px",
                          boxSizing: "border-box"
                        }}
                      />
                    </label>

                    <label>
                      <strong>Email</strong>
                      <input
                        type="email"
                        name="email"
                        value={userForm.email}
                        onChange={handleUserInput}
                        placeholder="college@email.com"
                        required
                        style={{
                          width: "100%",
                          marginTop: "7px",
                          padding: "12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "10px",
                          boxSizing: "border-box"
                        }}
                      />
                    </label>

                    <label>
                      <strong>
                        {editingUserId
                          ? "New Password (optional)"
                          : "Password"}
                      </strong>
                      <input
                        type="password"
                        name="password"
                        value={userForm.password}
                        onChange={handleUserInput}
                        placeholder={
                          editingUserId
                            ? "Leave blank to keep current"
                            : "Enter password"
                        }
                        required={!editingUserId}
                        style={{
                          width: "100%",
                          marginTop: "7px",
                          padding: "12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "10px",
                          boxSizing: "border-box"
                        }}
                      />
                    </label>

                    <label>
                      <strong>Role</strong>
                      <select
                        name="role"
                        value={userForm.role}
                        onChange={handleUserInput}
                        style={{
                          width: "100%",
                          marginTop: "7px",
                          padding: "12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "10px",
                          boxSizing: "border-box",
                          background: "#ffffff"
                        }}
                      >
                        <option value="student">
                          Student
                        </option>
                        <option value="cr">
                          Class Representative
                        </option>
                        <option value="staff">
                          Staff
                        </option>
                        <option value="admin">
                          Admin
                        </option>
                      </select>
                    </label>

                    <label>
                      <strong>
                        Department
                      </strong>
                      <input
                        type="text"
                        name="department"
                        value={userForm.department}
                        onChange={handleUserInput}
                        placeholder="CSE"
                        style={{
                          width: "100%",
                          marginTop: "7px",
                          padding: "12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "10px",
                          boxSizing: "border-box"
                        }}
                      />
                    </label>

                    <label>
                      <strong>Year</strong>
                      <input
                        type="number"
                        name="year"
                        value={userForm.year}
                        onChange={handleUserInput}
                        placeholder="3"
                        min="1"
                        max="6"
                        style={{
                          width: "100%",
                          marginTop: "7px",
                          padding: "12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "10px",
                          boxSizing: "border-box"
                        }}
                      />
                    </label>

                    <label>
                      <strong>Section</strong>
                      <input
                        type="text"
                        name="section"
                        value={userForm.section}
                        onChange={handleUserInput}
                        placeholder="A"
                        style={{
                          width: "100%",
                          marginTop: "7px",
                          padding: "12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "10px",
                          boxSizing: "border-box"
                        }}
                      />
                    </label>

                    {userForm.role === "cr" && (
                      <label>
                        <strong>CR ID</strong>
                        <input
                          type="text"
                          name="crId"
                          value={userForm.crId}
                          onChange={handleUserInput}
                          placeholder="CR-CSEA-01"
                          required
                          style={{
                            width: "100%",
                            marginTop: "7px",
                            padding: "12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "10px",
                            boxSizing: "border-box"
                          }}
                        />
                      </label>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "20px"
                    }}
                  >
                    <button
                      type="submit"
                      className="secondary-button"
                      disabled={savingUser}
                    >
                      {editingUserId ? (
                        <Save size={17} />
                      ) : (
                        <UserPlus size={17} />
                      )}

                      {savingUser
                        ? "Saving..."
                        : editingUserId
                        ? "Update User"
                        : "Create User"}
                    </button>
                  </div>
                </form>
              )}

              {usersLoading ? (
                <div
                  className="empty-state"
                >
                  <div className="loading-spinner"></div>

                  <h3>
                    Loading users...
                  </h3>
                </div>
              ) : users.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Users size={30} />
                  </div>

                  <h3>
                    No users found
                  </h3>

                  <p>
                    There are currently no
                    users available.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "14px"
                  }}
                >
                  {users.map((campusUser) => (
                    <div
                      key={campusUser._id}
                      style={{
                        padding: "18px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "14px",
                        background: "#ffffff"
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "20px",
                          flexWrap: "wrap"
                        }}
                      >
                        <div>
                          <h3
                            style={{
                              margin: 0
                            }}
                          >
                            {campusUser.name}
                          </h3>

                          <p
                            style={{
                              margin:
                                "5px 0",
                              color: "#64748b"
                            }}
                          >
                            {campusUser.email}
                          </p>

                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              flexWrap: "wrap",
                              marginTop: "10px"
                            }}
                          >
                            <span className="status-badge">
                              {campusUser.role}
                            </span>

                            {campusUser.department && (
                              <span>
                                🏫{" "}
                                {
                                  campusUser.department
                                }{" "}
                                {campusUser.year || ""}
                                {campusUser.section || ""}
                              </span>
                            )}

                            {campusUser.crId && (
                              <span>
                                🪪{" "}
                                {
                                  campusUser.crId
                                }
                              </span>
                            )}
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px"
                          }}
                        >
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              openEditUser(
                                campusUser
                              )
                            }
                          >
                            <Pencil size={16} />
                            Edit
                          </button>

                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              handleDeleteUser(
                                campusUser
                              )
                            }
                            disabled={
                              campusUser._id ===
                              user?._id
                            }
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>
                Administration
              </h2>

              <p>
                CampusConnect uses role-based
                access for secure issue management.
              </p>
            </div>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card-icon">
                <Users size={24} />
              </div>

              <h3>
                Role-Based Access
              </h3>

              <p>
                Students, CRs, staff, and
                administrators receive access
                according to their role.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon">
                <ShieldCheck size={24} />
              </div>

              <h3>
                Class Privacy
              </h3>

              <p>
                Users can only access the
                campus information allowed
                for their role and class.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon">
                <ClipboardList size={24} />
              </div>

              <h3>
                Issue Monitoring
              </h3>

              <p>
                Administrators can monitor the
                complete issue lifecycle from
                reporting to resolution.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;