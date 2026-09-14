import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../public/pages/projectManager/ProjectManagerDashboard.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

type TaskStatus =
  | "TO_DO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "DONE";

type Priority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

type UpcomingTask = {
  id: number;
  title: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  project: {
    id: number;
    name: string;
  };
};

type DashboardData = {
  totalProjects: number;
  tasksByPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  upcomingTasks: UpcomingTask[];
};

type DashboardResponse = {
  success: boolean;
  data: DashboardData;
};

const PMDashboard = () => {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!accessToken) {
        logout();
        navigate("/", { replace: true });
        return;
      }

      if (user?.role !== "PROJECT_MANAGER") {
        navigate("/", { replace: true });
        return;
      }

      try {
        const response =
          await axios.get<DashboardResponse>(
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
        console.error(
          "PM dashboard error:",
          error
        );

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
  }, [accessToken, user, logout, navigate]);

  const totalTasks = useMemo(() => {
    if (!dashboard) {
      return 0;
    }

    return Object.values(
      dashboard.tasksByPriority
    ).reduce(
      (total, count) => total + count,
      0
    );
  }, [dashboard]);

  const formatStatus = (
    status: TaskStatus
  ) => {
    if (status === "IN_PROGRESS") {
      return "In Progress";
    }

    if (status === "IN_REVIEW") {
      return "In Review";
    }

    if (status === "DONE") {
      return "Done";
    }

    return "To Do";
  };

  const formatPriority = (
    priority: Priority
  ) => {
    return (
      priority.charAt(0) +
      priority.slice(1).toLowerCase()
    );
  };

  if (loading) {
    return (
      <div className="pm-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="pm-dashboard-error">
        <div className="pm-dashboard-error-card">
          <h2>Unable to load dashboard</h2>
          <p>
            {error || "Something went wrong."}
          </p>
          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pm-dashboard">
      <main className="pm-dashboard-content">
        <header className="pm-dashboard-topbar">
          <div>
            <h1>Dashboard</h1>
            <p>
              Welcome back,{" "}
              {user?.name || "Project Manager"}.
              Here's what's happening with your
              projects.
            </p>
          </div>
        </header>

        <section className="pm-stats-grid">
          <div className="pm-stat-card">
            <div className="pm-stat-icon blue">
              ▣
            </div>
            <span>My Projects</span>
            <strong>
              {dashboard.totalProjects}
            </strong>
            <p>Projects you manage</p>
          </div>

          <div className="pm-stat-card">
            <div className="pm-stat-icon purple">
              ◫
            </div>
            <span>Total Tasks</span>
            <strong>{totalTasks}</strong>
            <p>Tasks across your projects</p>
          </div>

          <div className="pm-stat-card">
            <div className="pm-stat-icon orange">
              !
            </div>
            <span>High Priority</span>
            <strong>
              {dashboard.tasksByPriority.HIGH}
            </strong>
            <p>Tasks requiring attention</p>
          </div>

          <div className="pm-stat-card">
            <div className="pm-stat-icon red">
              !
            </div>
            <span>Critical</span>
            <strong>
              {dashboard.tasksByPriority.CRITICAL}
            </strong>
            <p>Critical priority tasks</p>
          </div>
        </section>

        <section className="pm-dashboard-grid">
          <div className="pm-priority-card card">
            <div className="pm-section-header">
              <div>
                <h2>Task Priority</h2>
                <p>
                  Tasks across your projects
                </p>
              </div>
            </div>

            <div className="pm-priority-list">
              <div className="pm-priority-row">
                <span>Critical</span>
                <div className="pm-progress">
                  <div
                    className="critical"
                    style={{
                      width: `${
                        totalTasks
                          ? (dashboard.tasksByPriority
                              .CRITICAL /
                              totalTasks) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <strong>
                  {dashboard.tasksByPriority.CRITICAL}
                </strong>
              </div>

              <div className="pm-priority-row">
                <span>High</span>
                <div className="pm-progress">
                  <div
                    className="high"
                    style={{
                      width: `${
                        totalTasks
                          ? (dashboard.tasksByPriority
                              .HIGH /
                              totalTasks) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <strong>
                  {dashboard.tasksByPriority.HIGH}
                </strong>
              </div>

              <div className="pm-priority-row">
                <span>Medium</span>
                <div className="pm-progress">
                  <div
                    className="medium"
                    style={{
                      width: `${
                        totalTasks
                          ? (dashboard.tasksByPriority
                              .MEDIUM /
                              totalTasks) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <strong>
                  {dashboard.tasksByPriority.MEDIUM}
                </strong>
              </div>

              <div className="pm-priority-row">
                <span>Low</span>
                <div className="pm-progress">
                  <div
                    className="low"
                    style={{
                      width: `${
                        totalTasks
                          ? (dashboard.tasksByPriority
                              .LOW /
                              totalTasks) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <strong>
                  {dashboard.tasksByPriority.LOW}
                </strong>
              </div>
            </div>
          </div>

          <div className="pm-upcoming-card card">
            <div className="pm-section-header">
              <div>
                <h2>Upcoming Tasks</h2>
                <p>
                  Tasks due this week
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/pm/tasks")
                }
              >
                View All
              </button>
            </div>

            <div className="pm-upcoming-list">
              {dashboard.upcomingTasks.length ===
              0 ? (
                <div className="pm-empty">
                  No upcoming tasks this week.
                </div>
              ) : (
                dashboard.upcomingTasks.map(
                  (task) => (
                    <div
                      className="pm-upcoming-item"
                      key={task.id}
                    >
                      <div className="pm-task-icon">
                        {task.title
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="pm-task-info">
                        <strong>
                          {task.title}
                        </strong>
                        <span>
                          {task.project.name}
                        </span>
                      </div>

                      <div className="pm-task-meta">
                        <span
                          className={`pm-priority-badge ${task.priority.toLowerCase()}`}
                        >
                          {formatPriority(
                            task.priority
                          )}
                        </span>

                        <span className="pm-due-date">
                          {new Date(
                            task.dueDate
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      <span
                        className={`pm-status-badge ${task.status.toLowerCase()}`}
                      >
                        {formatStatus(
                          task.status
                        )}
                      </span>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PMDashboard;