import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { socket } from "../../socket/socket";
import "../../public/pages/admin/AdminDashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

type Activity = {
  id: number;
  projectId: number;
  taskId: number;
  userId: number;
  oldStatus: string;
  newStatus: string;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    role: string;
  };
  task?: {
    id: number;
    title: string;
  };
  project?: {
    id: number;
    name: string;
  };
};

type DashboardData = {
  users: {
    total: number;
    admins: number;
    projectManagers: number;
    developers: number;
    active: number;
  };
  projects: {
    total: number;
  };
  tasks: {
    total: number;
    toDo: number;
    inProgress: number;
    inReview: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  completionRate: number;
  recentUsers: {
    id: number;
    name: string;
    email: string;
    role: "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";
    isActive: boolean;
    createdAt: string;
  }[];
};

type DashboardResponse = {
  success: boolean;
  data: DashboardData;
};

const AdminDashboard = () => {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!accessToken) {
        logout();
        navigate("/", { replace: true });
        return;
      }

      try {
        const response = await axios.get<DashboardResponse>(
          `${API_URL}/api/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        );

        setDashboard(response.data.data);
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401
        ) {
          logout();
          navigate("/", { replace: true });
          return;
        }

        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.error?.message ||
              "Failed to load dashboard."
          );
        } else {
          setError("Failed to load dashboard.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [accessToken, logout, navigate]);

  useEffect(() => {
    if (!accessToken) {
      setActivities([]);
      return;
    }
    if (user?.role !== "ADMIN") {
      navigate("/", { replace: true });
      return;
    }
    const fetchActivities = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/activities`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setActivities(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load activities:", error);
      }
    };

    const handleActivityCreated = (activity: Activity) => {
      setActivities((previous) => {
        if (previous.some((item) => item.id === activity.id)) {
          return previous;
        }

        return [activity, ...previous].slice(0, 20);
      });
    };

    fetchActivities();

    socket.on("activity-created", handleActivityCreated);

    return () => {
      socket.off("activity-created", handleActivityCreated);
    };
  }, [accessToken]);

  const filteredUsers = useMemo(() => {
    if (!dashboard) return [];

    const value = search.toLowerCase().trim();

    if (!value) return dashboard.recentUsers;

    return dashboard.recentUsers.filter(
      (item) =>
        item.name.toLowerCase().includes(value) ||
        item.email.toLowerCase().includes(value) ||
        item.role.toLowerCase().includes(value)
    );
  }, [dashboard, search]);

  const formatRole = (role: string) => {
    if (role === "PROJECT_MANAGER") return "Project Manager";
    if (role === "DEVELOPER") return "Developer";
    return "Admin";
  };


  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="dashboard-error">
        <div className="error-card">
          <h2>Unable to load dashboard</h2>
          <p>{error || "Something went wrong."}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <main className="dashboard-content">
        <header className="dashboard-topbar">
          <div className="welcome-section">
            <h1>Dashboard</h1>
            <p>
              Welcome back, Admin. Here's what's happening today.
            </p>
          </div>
          <div className="topbar-actions">
            <button
              className="notification-button"
              title="Notifications"
            >
              ♧
              <span className="notification-dot"></span>
            </button>
            <a
              href="/admin/users/create"
              className="add-user-button"
            >
              <span>+</span>
              Add User
            </a>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon blue">♧</div>
              <span className="stat-trend">
                Active {dashboard.users.active}
              </span>
            </div>
            <div className="stat-label">Total Users</div>
            <div className="stat-value">
              {dashboard.users.total}
            </div>
            <div className="stat-description">
              Active organization members
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon green">♧</div>
              <span className="stat-status">Active</span>
            </div>
            <div className="stat-label">Project Managers</div>
            <div className="stat-value">
              {dashboard.users.projectManagers}
            </div>
            <div className="stat-description">
              Managing current projects
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon light-blue">♧</div>
              <span className="stat-status">Active</span>
            </div>
            <div className="stat-label">Developers</div>
            <div className="stat-value">
              {dashboard.users.developers}
            </div>
            <div className="stat-description">
              Working on assigned tasks
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon orange">▣</div>
              <span className="stat-trend">
                {dashboard.tasks.total} Tasks
              </span>
            </div>
            <div className="stat-label">Total Projects</div>
            <div className="stat-value">
              {dashboard.projects.total}
            </div>
            <div className="stat-description">
              Across all teams
            </div>
          </div>
        </section>

        <section className="middle-grid">
          <div className="project-overview card">
            <div className="card-title-row">
              <div>
                <h2>Project Overview</h2>
                <p>Current project status</p>
              </div>
              <a href="/admin/projects">View All</a>
            </div>
            <div className="project-stats">
              <div className="project-stat">
                <div className="project-stat-icon completed">✓</div>
                <div>
                  <span>Completed</span>
                  <strong>{dashboard.tasks.completed}</strong>
                </div>
              </div>
              <div className="project-stat">
                <div className="project-stat-icon progress">↗</div>
                <div>
                  <span>In Progress</span>
                  <strong>{dashboard.tasks.inProgress}</strong>
                </div>
              </div>
              <div className="project-stat">
                <div className="project-stat-icon pending">◷</div>
                <div>
                  <span>Pending</span>
                  <strong>{dashboard.tasks.pending}</strong>
                </div>
              </div>
            </div>
            <div className="completion-section">
              <div className="completion-header">
                <span>Overall completion</span>
                <strong>{dashboard.completionRate}%</strong>
              </div>
              <div className="completion-bar">
                <div
                  className="completion-progress"
                  style={{
                    width: `${dashboard.completionRate}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="quick-actions card">
            <div className="card-title-row">
              <div>
                <h2>Quick Actions</h2>
                <p>Manage your workspace</p>
              </div>
            </div>
            <div className="quick-action-list">
              <a
                href="/admin/users/create"
                className="quick-action"
              >
                <div className="quick-icon">♧+</div>
                <div>
                  <strong>Add New User</strong>
                  <span>
                    Create an admin, manager or developer
                  </span>
                </div>
              </a>
              <a
                href="/admin/users"
                className="quick-action"
              >
                <div className="quick-icon">♧</div>
                <div>
                  <strong>Manage Users</strong>
                  <span>View and manage all users</span>
                </div>
              </a>
              <a
                href="/admin/projects"
                className="quick-action"
              >
                <div className="quick-icon">▣</div>
                <div>
                  <strong>View Projects</strong>
                  <span>Monitor all active projects</span>
                </div>
              </a>
            </div>
          </div>
        </section>
        <section className="recent-users card">
          <div className="card-title-row">
            <div>
              <h2>Recent Users</h2>
              <p>Recently added team members</p>
            </div>
            <a href="/admin/users">View All Users</a>
          </div>
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="table-user">
                          <div className="table-avatar">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{item.name}</strong>
                            <span>{item.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="table-role">
                          {formatRole(item.role)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            item.isActive
                              ? "table-status active"
                              : "table-status inactive"
                          }
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="table-action"
                          title="View user"
                          onClick={() =>
                            navigate(
                              `/admin/users/${item.role}/${item.id}`
                            )
                          }
                        >
                          →
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="empty-table">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;