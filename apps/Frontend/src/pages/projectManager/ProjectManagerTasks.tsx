import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../public/pages/projectManager/ProjectManagerTasks.css";

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

type Task = {
  id: number;
  title: string;
  description: string | null;
  assignedToId: number | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
  project: {
    id: number;
    name: string;
  };
  assignedTo: {
    id: number;
    name: string;
    email: string;
  } | null;
};

type TasksResponse = {
  success: boolean;
  data: Task[];
};

const ProjectManagerTasks = () => {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");
  const [priorityFilter, setPriorityFilter] =
    useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
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
          await axios.get<TasksResponse>(
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
        console.error(
          "Project Manager tasks error:",
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
        task.project.name
          .toLowerCase()
          .includes(value) ||
        task.assignedTo?.name
          .toLowerCase()
          .includes(value);

      const matchesStatus =
        statusFilter === "ALL" ||
        task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ||
        task.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    tasks,
    search,
    statusFilter,
    priorityFilter,
  ]);

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
      <div className="pm-tasks-loading">
        <div className="loading-spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pm-tasks-error">
        <div className="pm-tasks-error-card">
          <h2>Unable to load tasks</h2>
          <p>{error}</p>
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
    <div className="pm-tasks">
      <main className="pm-tasks-content">
        <header className="pm-tasks-header">
          <div>
            <h1>My Tasks</h1>
            <p>
              Manage tasks across your projects.
            </p>
          </div>

          <div className="pm-tasks-count">
            {filteredTasks.length} Tasks
          </div>
        </header>

        <section className="pm-tasks-card">
          <div className="pm-tasks-toolbar">
            <div className="pm-tasks-search">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search tasks, projects or developers..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <div className="pm-task-filters">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
              >
                <option value="ALL">
                  All Status
                </option>
                <option value="TO_DO">
                  To Do
                </option>
                <option value="IN_PROGRESS">
                  In Progress
                </option>
                <option value="IN_REVIEW">
                  In Review
                </option>
                <option value="DONE">
                  Done
                </option>
              </select>

              <select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(
                    event.target.value
                  )
                }
              >
                <option value="ALL">
                  All Priority
                </option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">
                  Medium
                </option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">
                  Critical
                </option>
              </select>
            </div>
          </div>

          <div className="pm-tasks-table-wrapper">
            <table className="pm-tasks-table">
              <thead>
                <tr>
                  <th>TASK</th>
                  <th>PROJECT</th>
                  <th>DEVELOPER</th>
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
                        <div className="pm-task-name">
                          <div className="pm-task-avatar">
                            {task.title
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {task.title}
                            </strong>
                            <span>
                              Task #{task.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="pm-project-name">
                          {task.project.name}
                        </span>
                      </td>

                      <td>
                        {task.assignedTo ? (
                          <div className="pm-developer">
                            <div className="pm-developer-avatar">
                              {task.assignedTo.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {
                                  task.assignedTo
                                    .name
                                }
                              </strong>
                              <span>
                                {
                                  task.assignedTo
                                    .email
                                }
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="pm-unassigned">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`pm-status ${task.status.toLowerCase()}`}
                        >
                          {formatStatus(
                            task.status
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`pm-priority ${task.priority.toLowerCase()}`}
                        >
                          {formatPriority(
                            task.priority
                          )}
                        </span>
                      </td>

                      <td>
                        <div
                          className={
                            task.isOverdue
                              ? "pm-overdue-date"
                              : "pm-due-date"
                          }
                        >
                          {new Date(
                            task.dueDate
                          ).toLocaleDateString()}

                          {task.isOverdue && (
                            <span>Overdue</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="pm-task-action"
                          title="View task"
                          onClick={() =>
                            navigate(
                              `/pm/tasks/${task.id}`
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
                    <td
                      colSpan={7}
                      className="pm-empty-tasks"
                    >
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

export default ProjectManagerTasks;