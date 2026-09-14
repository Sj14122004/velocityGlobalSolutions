import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../public/pages/developer/DeveloperTask.css";

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
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  isOverdue: boolean;
  project: {
    id: number;
    name: string;
  };
};

type TasksResponse = {
  success: boolean;
  data: Task[];
};

const DeveloperTasks = () => {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");
  const [priorityFilter, setPriorityFilter] =
    useState("ALL");
  const [updatingTaskId, setUpdatingTaskId] =
    useState<number | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
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
          "Developer tasks error:",
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
  }, [
    accessToken,
    user,
    logout,
    navigate,
  ]);

  const filteredTasks = useMemo(() => {
    const value = search
      .toLowerCase()
      .trim();

    return tasks.filter((task) => {
      const matchesSearch =
        !value ||
        task.title
          .toLowerCase()
          .includes(value) ||
        task.project.name
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

  const getNextStatus = (
    status: TaskStatus
  ): TaskStatus | null => {
    if (status === "TO_DO") {
      return "IN_PROGRESS";
    }

    if (status === "IN_PROGRESS") {
      return "IN_REVIEW";
    }

    if (status === "IN_REVIEW") {
      return "DONE";
    }

    return null;
  };

  const updateStatus = async (
    taskId: number,
    currentStatus: TaskStatus
  ) => {
    const nextStatus =
      getNextStatus(currentStatus);

    if (!nextStatus || !accessToken) {
      return;
    }

    setUpdatingTaskId(taskId);

    try {
      const response = await axios.patch(
        `${API_URL}/api/tasks/${taskId}/status`,
        {
          status: nextStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );

      const updatedTask =
        response.data.data.task;

      setTasks((previous) =>
        previous.map((task) =>
          task.id === taskId
            ? {
                ...task,
                ...updatedTask,
                status: nextStatus,
              }
            : task
        )
      );
    } catch (error) {
      console.error(
        "Update task status error:",
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

      setError(
        axios.isAxiosError(error)
          ? error.response?.data?.error?.message ||
              "Failed to update task status."
          : "Failed to update task status."
      );
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (loading) {
    return (
      <div className="developer-tasks-loading">
        <div className="developer-tasks-spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (error && tasks.length === 0) {
    return (
      <div className="developer-tasks-error">
        <div className="developer-tasks-error-card">
          <h2>Unable to load tasks</h2>
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
    <div className="developer-tasks">
      <main className="developer-tasks-content">
        <section className="developer-tasks-header">
          <div>
            <span>MY WORK</span>
            <h1>My Tasks</h1>
            <p>
              Manage the tasks assigned to you.
            </p>
          </div>

          <button
            className="developer-dashboard-button"
            onClick={() =>
              navigate(
                "/developer/dashboard"
              )
            }
          >
            Dashboard
          </button>
        </section>

        {error && (
          <div className="developer-inline-error">
            {error}
          </div>
        )}

        <section className="developer-task-stats">
          <div>
            <span>TOTAL</span>
            <strong>{tasks.length}</strong>
          </div>

          <div>
            <span>TO DO</span>
            <strong>
              {
                tasks.filter(
                  (task) =>
                    task.status === "TO_DO"
                ).length
              }
            </strong>
          </div>

          <div>
            <span>IN PROGRESS</span>
            <strong>
              {
                tasks.filter(
                  (task) =>
                    task.status ===
                    "IN_PROGRESS"
                ).length
              }
            </strong>
          </div>

          <div>
            <span>IN REVIEW</span>
            <strong>
              {
                tasks.filter(
                  (task) =>
                    task.status ===
                    "IN_REVIEW"
                ).length
              }
            </strong>
          </div>

          <div>
            <span>DONE</span>
            <strong>
              {
                tasks.filter(
                  (task) =>
                    task.status === "DONE"
                ).length
              }
            </strong>
          </div>

          <div className="developer-stat-overdue">
            <span>OVERDUE</span>
            <strong>
              {
                tasks.filter(
                  (task) =>
                    task.isOverdue
                ).length
              }
            </strong>
          </div>
        </section>

        <section className="developer-task-card">
          <div className="developer-task-toolbar">
            <div className="developer-search">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search tasks or projects..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="developer-filters">
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
                <option value="LOW">
                  Low
                </option>
                <option value="MEDIUM">
                  Medium
                </option>
                <option value="HIGH">
                  High
                </option>
                <option value="CRITICAL">
                  Critical
                </option>
              </select>
            </div>
          </div>

          <div className="developer-task-table-wrapper">
            <table className="developer-task-table">
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
                  filteredTasks.map(
                    (task) => {
                      const nextStatus =
                        getNextStatus(
                          task.status
                        );

                      return (
                        <tr key={task.id}>
                          <td>
                            <button
                              type="button"
                              className="developer-task-name"
                              onClick={() =>
                                navigate(
                                  `/developer/tasks/${task.id}`
                                )
                              }
                            >
                              <strong>
                                {task.title}
                              </strong>
                              <span>
                                Task #{task.id}
                              </span>
                            </button>
                          </td>

                          <td>
                            <span className="developer-project-name">
                              {task.project.name}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`developer-status-badge ${task.status.toLowerCase()}`}
                            >
                              {formatStatus(
                                task.status
                              )}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`developer-priority-badge ${task.priority.toLowerCase()}`}
                            >
                              {formatPriority(
                                task.priority
                              )}
                            </span>
                          </td>

                          <td>
                            <span
                              className={
                                task.isOverdue
                                  ? "developer-due-overdue"
                                  : "developer-due-date"
                              }
                            >
                              {formatDate(
                                task.dueDate
                              )}
                              {task.isOverdue &&
                                " • Overdue"}
                            </span>
                          </td>

                          <td>
                            {nextStatus ? (
                              <button
                                type="button"
                                className="developer-status-action"
                                disabled={
                                  updatingTaskId ===
                                  task.id
                                }
                                onClick={() =>
                                  updateStatus(
                                    task.id,
                                    task.status
                                  )
                                }
                              >
                                {updatingTaskId ===
                                task.id
                                  ? "Updating..."
                                  : `Move to ${formatStatus(
                                      nextStatus
                                    )}`}
                              </button>
                            ) : (
                              <span className="developer-completed-label">
                                Completed
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="developer-no-tasks"
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

export default DeveloperTasks;