import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../public/pages/admin/AdminTaskDetails.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive?: boolean;
};

type Activity = {
  id: number;
  oldStatus: string;
  newStatus: string;
  createdAt: string;
  user: User | null;
};

type Task = {
  id: number;
  projectId: number;
  title: string;
  description: string | null;
  assignedToId: number | null;
  status: string;
  priority: string;
  dueDate: string;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
  project: {
    id: number;
    name: string;
    description: string | null;
    createdBy: User | null;
  };
  assignedTo: User | null;
  activityLogs: Activity[];
};

type TaskResponse = {
  success: boolean;
  data: Task;
};

const AdminTaskDetails = () => {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      if (!accessToken) {
        logout();
        navigate("/", { replace: true });
        return;
      }

      if (user?.role !== "ADMIN") {
        navigate("/", { replace: true });
        return;
      }

      try {
        const response = await axios.get<TaskResponse>(
          `${API_URL}/api/tasks/${id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        );

        setTask(response.data.data);
      } catch (error) {
        console.error("Task details error:", error);

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
              "Failed to load task details."
          );
        } else {
          setError("Failed to load task details.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [accessToken, user, id, logout, navigate]);

  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatPriority = (priority: string) => {
    return (
      priority.charAt(0).toUpperCase() +
      priority.slice(1).toLowerCase()
    );
  };

  if (loading) {
    return (
      <div className="task-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading task details...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="task-details-error">
        <div className="task-details-error-card">
          <h2>Unable to load task</h2>
          <p>{error || "Task not found."}</p>
          <button
            type="button"
            onClick={() => navigate("/admin/tasks")}
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-task-details">
      <main className="task-details-content">
        <div className="task-details-back">
          <button
            type="button"
            onClick={() => navigate("/admin/tasks")}
          >
            ← Back to Tasks
          </button>
        </div>

        <section className="task-details-hero card">
          <div className="task-details-main">
            <div className="task-details-avatar">
              {task.title.charAt(0).toUpperCase()}
            </div>

            <div>
              <span className="task-details-id">
                Task #{task.id}
              </span>
              <h1>{task.title}</h1>
              <p>
                {task.description ||
                  "No description available."}
              </p>
            </div>
          </div>

          <div className="task-details-badges">
            <span
              className={`task-detail-status ${task.status.toLowerCase()}`}
            >
              {formatStatus(task.status)}
            </span>

            <span
              className={`task-detail-priority ${task.priority.toLowerCase()}`}
            >
              {formatPriority(task.priority)}
            </span>

            {task.isOverdue && (
              <span className="task-detail-overdue">
                Overdue
              </span>
            )}
          </div>
        </section>

        <section className="task-details-stats">
          <div className="task-detail-stat card">
            <span>Status</span>
            <strong>{formatStatus(task.status)}</strong>
          </div>

          <div className="task-detail-stat card">
            <span>Priority</span>
            <strong>{formatPriority(task.priority)}</strong>
          </div>

          <div className="task-detail-stat card">
            <span>Due Date</span>
            <strong>
              {new Date(task.dueDate).toLocaleDateString()}
            </strong>
          </div>

          <div className="task-detail-stat card">
            <span>Activity Events</span>
            <strong>{task.activityLogs.length}</strong>
          </div>
        </section>

        <section className="task-details-grid">
          <div className="task-information card">
            <div className="task-section-header">
              <div>
                <h2>Task Information</h2>
                <p>Task and project details</p>
              </div>
            </div>

            <div className="task-info-list">
              <div className="task-info-row">
                <span>Project</span>
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/admin/projects/${task.project.id}`
                    )
                  }
                >
                  {task.project.name}
                </button>
              </div>

              <div className="task-info-row">
                <span>Project Manager</span>
                <strong>
                  {task.project.createdBy?.name ||
                    "Not assigned"}
                </strong>
              </div>

              <div className="task-info-row">
                <span>Assigned Developer</span>
                <strong>
                  {task.assignedTo?.name ||
                    "Unassigned"}
                </strong>
              </div>

              <div className="task-info-row">
                <span>Developer Email</span>
                <strong>
                  {task.assignedTo?.email || "—"}
                </strong>
              </div>

              <div className="task-info-row">
                <span>Due Date</span>
                <strong>
                  {new Date(
                    task.dueDate
                  ).toLocaleString()}
                </strong>
              </div>

              <div className="task-info-row">
                <span>Created</span>
                <strong>
                  {new Date(
                    task.createdAt
                  ).toLocaleString()}
                </strong>
              </div>

              <div className="task-info-row">
                <span>Last Updated</span>
                <strong>
                  {new Date(
                    task.updatedAt
                  ).toLocaleString()}
                </strong>
              </div>

              <div className="task-info-row">
                <span>Overdue</span>
                <strong
                  className={
                    task.isOverdue
                      ? "overdue-text"
                      : "normal-text"
                  }
                >
                  {task.isOverdue ? "Yes" : "No"}
                </strong>
              </div>
            </div>
          </div>

          <div className="task-activity card">
            <div className="task-section-header">
              <div>
                <h2>Activity History</h2>
                <p>Latest task status changes</p>
              </div>
            </div>

            <div className="task-activity-list">
              {task.activityLogs.length === 0 ? (
                <div className="task-details-empty">
                  No activity yet.
                </div>
              ) : (
                task.activityLogs.map((activity) => (
                  <div
                    className="task-activity-item"
                    key={activity.id}
                  >
                    <div className="task-activity-marker">
                      ✓
                    </div>

                    <div className="task-activity-content">
                      <strong>
                        {activity.user?.name ||
                          "User"}{" "}
                        changed the task status
                      </strong>

                      <div className="task-activity-status">
                        <span>
                          {formatStatus(
                            activity.oldStatus
                          )}
                        </span>
                        <b>→</b>
                        <span>
                          {formatStatus(
                            activity.newStatus
                          )}
                        </span>
                      </div>

                      <small>
                        {new Date(
                          activity.createdAt
                        ).toLocaleString()}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminTaskDetails;