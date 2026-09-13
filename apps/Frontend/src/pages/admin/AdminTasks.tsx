import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../public/pages/admin/AdminTasks.css";

const API_URL = "http://localhost:5000";

type TaskStatus = "TO_DO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type Task = {
  id: number;
  projectId: number;
  title: string;
  description: string | null;
  assignedToId: number;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  isOverdue: boolean;
  createdAt: string;
};

type TasksResponse = {
  success: boolean;
  data: Task[];
};

const AdminTasks = () => {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TaskStatus>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | Priority>("ALL");

  useEffect(() => {
    const fetchTasks = async () => {
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
        const response = await axios.get<TasksResponse>(
          `${API_URL}/api/tasks`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        );

        setTasks(response.data.data);
      } catch (error) {
        console.error("Tasks error:", error);

        if (axios.isAxiosError(error) && error.response?.status === 401) {
          logout();
          navigate("/", { replace: true });
          return;
        }

        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.error?.message ||
              "Failed to load tasks."
          );
        } else {
          setError("Failed to load tasks.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [accessToken, user, logout, navigate]);

  const filteredTasks = useMemo(() => {
    const value = search.toLowerCase().trim();

    return tasks.filter((task) => {
      const matchesSearch =
        !value ||
        task.title.toLowerCase().includes(value) ||
        task.description?.toLowerCase().includes(value);

      const matchesStatus =
        statusFilter === "ALL" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const formatStatus = (status: TaskStatus) => {
    if (status === "IN_PROGRESS") return "In Progress";
    if (status === "IN_REVIEW") return "In Review";
    if (status === "DONE") return "Done";
    return "To Do";
  };

  const formatPriority = (priority: Priority) => {
    return priority.charAt(0) + priority.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="tasks-loading">
        <div className="loading-spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tasks-error">
        <div className="tasks-error-card">
          <h2>Unable to load tasks</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-tasks">
      <main className="tasks-content">
        <section className="tasks-card">
          <div className="tasks-card-header">
            <div>
              <h2>All Tasks</h2>
              <p>View tasks across all projects.</p>
            </div>
            <div className="tasks-count">
              {filteredTasks.length} Tasks
            </div>
          </div>

          <div className="tasks-filters">
            <div className="tasks-search">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as "ALL" | TaskStatus
                )
              }
            >
              <option value="ALL">All Status</option>
              <option value="TO_DO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value as "ALL" | Priority
                )
              }
            >
              <option value="ALL">All Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div className="tasks-table-wrapper">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>TASK</th>
                  <th>PROJECT</th>
                  <th>STATUS</th>
                  <th>PRIORITY</th>
                  <th>DUE DATE</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <div className="task-user">
                          <div className="task-avatar">
                            {task.title.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{task.title}</strong>
                            <span>Task #{task.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span>Project #{task.projectId}</span>
                      </td>
                      <td>
                        <span
                          className={`task-status ${task.status.toLowerCase()}`}
                        >
                          {formatStatus(task.status)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`task-priority ${task.priority.toLowerCase()}`}
                        >
                          {formatPriority(task.priority)}
                        </span>
                      </td>
                      <td>
                        <span className={task.isOverdue ? "overdue" : ""}>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <button
                          className="task-action"
                          title="View task"
                          onClick={() =>
                            navigate(`/admin/tasks/${task.id}`)
                          }
                        >
                          →
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="empty-tasks">
                      No tasks found.
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

export default AdminTasks;