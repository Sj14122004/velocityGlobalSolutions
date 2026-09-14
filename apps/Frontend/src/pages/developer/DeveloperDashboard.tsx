import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../public/pages/developer/DeveloperDashboard.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

type Task = {
  id: number;
  title: string;
  description: string | null;
  status: "TO_DO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  dueDate: string;
  isOverdue: boolean;
  project: {
    id: number;
    name: string;
  };
};

type DashboardResponse = {
  success: boolean;
  data: Task[];
};

const DeveloperDashboard = () => {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!accessToken) {
        logout();
        navigate("/", { replace: true });
        return;
      }

      if (user?.role !== "DEVELOPER") {
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

        setTasks(response.data.data);
      } catch (error) {
        console.error(
          "Developer dashboard error:",
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
  }, [
    accessToken,
    user,
    logout,
    navigate,
  ]);

  const stats = useMemo(() => {
    const completed = tasks.filter(
      (task) => task.status === "DONE"
    ).length;

    const inProgress = tasks.filter(
      (task) =>
        task.status === "IN_PROGRESS"
    ).length;

    const inReview = tasks.filter(
      (task) =>
        task.status === "IN_REVIEW"
    ).length;

    const toDo = tasks.filter(
      (task) => task.status === "TO_DO"
    ).length;

    const overdue = tasks.filter(
      (task) => task.isOverdue
    ).length;

    const highPriority = tasks.filter(
      (task) =>
        task.priority === "HIGH" ||
        task.priority === "CRITICAL"
    ).length;

    return {
      total: tasks.length,
      completed,
      inProgress,
      inReview,
      toDo,
      overdue,
      highPriority,
    };
  }, [tasks]);

  const formatStatus = (
    status?: string
  ) => {
    if (!status) {
      return "To Do";
    }

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
    priority?: string
  ) => {
    if (!priority) {
      return "Medium";
    }

    return (
      priority.charAt(0) +
      priority.slice(1).toLowerCase()
    );
  };

  const formatDate = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleTaskClick = (
    taskId: number
  ) => {
    navigate(`/developer/tasks/${taskId}`);
  };

  if (loading) {
    return (
      <div className="developer-dashboard-loading">
        <div className="developer-loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="developer-dashboard-error">
        <div className="developer-error-card">
          <h2>Unable to load dashboard</h2>
          <p>{error}</p>
          <button
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
    <div className="developer-dashboard">
      <main className="developer-dashboard-content">
        <section className="developer-dashboard-header">
          <div>
            <span className="developer-eyebrow">
              DEVELOPER DASHBOARD
            </span>
            <h1>
              Welcome back,{" "}
              {user?.name || "Developer"}
            </h1>
            <p>
              Focus on your assigned tasks and
              keep your projects moving forward.
            </p>
          </div>

          <button
            className="developer-tasks-button"
            onClick={() =>
              navigate("/developer/tasks")
            }
          >
            View All Tasks
          </button>
        </section>

        <section className="developer-stats-grid">
          <div className="developer-stat-card">
            <span className="developer-stat-label">
              TOTAL TASKS
            </span>
            <strong>{stats.total}</strong>
            <small>
              All assigned tasks
            </small>
          </div>

          <div className="developer-stat-card">
            <span className="developer-stat-label">
              TO DO
            </span>
            <strong>{stats.toDo}</strong>
            <small>
              Waiting to start
            </small>
          </div>

          <div className="developer-stat-card">
            <span className="developer-stat-label">
              IN PROGRESS
            </span>
            <strong>{stats.inProgress}</strong>
            <small>
              Currently working
            </small>
          </div>

          <div className="developer-stat-card">
            <span className="developer-stat-label">
              IN REVIEW
            </span>
            <strong>{stats.inReview}</strong>
            <small>
              Waiting for review
            </small>
          </div>

          <div className="developer-stat-card">
            <span className="developer-stat-label">
              COMPLETED
            </span>
            <strong>{stats.completed}</strong>
            <small>
              Finished tasks
            </small>
          </div>

          <div className="developer-stat-card developer-stat-danger">
            <span className="developer-stat-label">
              OVERDUE
            </span>
            <strong>{stats.overdue}</strong>
            <small>
              Need attention
            </small>
          </div>
        </section>

        <section className="developer-main-grid">
          <div className="developer-tasks-panel">
            <div className="developer-panel-header">
              <div>
                <span>MY WORK</span>
                <h2>Assigned Tasks</h2>
              </div>

              <span className="developer-task-count">
                {tasks.length} Tasks
              </span>
            </div>

            {tasks.length === 0 ? (
              <div className="developer-empty-state">
                <div className="developer-empty-icon">
                  ✓
                </div>
                <h3>No tasks assigned</h3>
                <p>
                  You currently have no assigned
                  tasks.
                </p>
              </div>
            ) : (
              <div className="developer-task-list">
                {tasks.slice(0, 10).map(
                  (task) => (
                    <button
                      type="button"
                      className="developer-task-row"
                      key={task.id}
                      onClick={() =>
                        handleTaskClick(
                          task.id
                        )
                      }
                    >
                      <div className="developer-task-priority">
                        <span
                          className={`priority-dot ${
                            task.priority?.toLowerCase() ||
                            "medium"
                          }`}
                        ></span>
                      </div>

                      <div className="developer-task-info">
                        <strong>
                          {task.title}
                        </strong>

                        <span>
                          {task.project?.name ||
                            "Project"}
                        </span>
                      </div>

                      <span
                        className={`developer-status ${
                          task.status?.toLowerCase() ||
                          "to_do"
                        }`}
                      >
                        {formatStatus(
                          task.status
                        )}
                      </span>

                      <div className="developer-task-due">
                        <small>DUE</small>
                        <span
                          className={
                            task.isOverdue
                              ? "overdue"
                              : ""
                          }
                        >
                          {formatDate(
                            task.dueDate
                          )}
                        </span>
                      </div>

                      <span className="developer-task-arrow">
                        →
                      </span>
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <div className="developer-overview-panel">
            <div className="developer-panel-header">
              <div>
                <span>OVERVIEW</span>
                <h2>Task Progress</h2>
              </div>
            </div>

            <div className="developer-progress-circle">
              <div>
                <strong>
                  {stats.total === 0
                    ? 0
                    : Math.round(
                        (stats.completed /
                          stats.total) *
                          100
                      )}
                  %
                </strong>
                <span>Completed</span>
              </div>
            </div>

            <div className="developer-progress-list">
              <div>
                <span>
                  <i className="progress-dot todo"></i>
                  To Do
                </span>
                <strong>
                  {stats.toDo}
                </strong>
              </div>

              <div>
                <span>
                  <i className="progress-dot progress"></i>
                  In Progress
                </span>
                <strong>
                  {stats.inProgress}
                </strong>
              </div>

              <div>
                <span>
                  <i className="progress-dot review"></i>
                  In Review
                </span>
                <strong>
                  {stats.inReview}
                </strong>
              </div>

              <div>
                <span>
                  <i className="progress-dot done"></i>
                  Done
                </span>
                <strong>
                  {stats.completed}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section className="developer-bottom-grid">
          <div className="developer-priority-panel">
            <div className="developer-panel-header">
              <div>
                <span>ATTENTION</span>
                <h2>Priority Tasks</h2>
              </div>
            </div>

            <div className="developer-priority-content">
              <strong>
                {stats.highPriority}
              </strong>
              <span>
                High or Critical priority tasks
              </span>
            </div>
          </div>

          <div className="developer-overdue-panel">
            <div className="developer-panel-header">
              <div>
                <span>DEADLINES</span>
                <h2>Overdue Tasks</h2>
              </div>
            </div>

            <div className="developer-overdue-content">
              <strong>
                {stats.overdue}
              </strong>
              <span>
                {stats.overdue === 0
                  ? "Everything is on schedule"
                  : "Tasks need your attention"}
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DeveloperDashboard;