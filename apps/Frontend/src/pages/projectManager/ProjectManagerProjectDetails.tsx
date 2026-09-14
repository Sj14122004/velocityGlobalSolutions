import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../public/pages/projectManager/ProjectManagerProjectDetails.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive?: boolean;
};

type Task = {
  id: number;
  title: string;
  description: string | null;
  status: "TO_DO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  dueDate: string;
  isOverdue: boolean;
  assignedTo: User | null;
};

type Activity = {
  id: number;
  oldStatus: string;
  newStatus: string;
  createdAt: string;
  user: User | null;
  task: {
    id: number;
    title: string;
  };
};

type Project = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: User | null;
  members: {
    id: number;
    joinedAt: string;
    user: User;
  }[];
  tasks: Task[];
  activityLogs: Activity[];
};

type ProjectResponse = {
  success: boolean;
  data: Project;
};

const ProjectManagerProjectDetails = () => {
  const { id } = useParams();
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] =
    useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateTask, setShowCreateTask] =
    useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] =
    useState("");
  const [assignedToId, setAssignedToId] =
    useState("");
  const [priority, setPriority] =
    useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">(
      "MEDIUM"
    );
  const [dueDate, setDueDate] = useState("");
  const [creatingTask, setCreatingTask] =
    useState(false);
  const [taskError, setTaskError] =
    useState("");

  useEffect(() => {
    const fetchProject = async () => {
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
          await axios.get<ProjectResponse>(
            `${API_URL}/api/projects/${id}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              withCredentials: true,
            }
          );

        setProject(response.data.data);
      } catch (error) {
        console.error(
          "Project details error:",
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

        if (
          axios.isAxiosError(error) &&
          error.response?.status === 404
        ) {
          setError("Project not found.");
          return;
        }

        setError(
          "Failed to load project details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [
    id,
    accessToken,
    user,
    logout,
    navigate,
  ]);

  const handleCreateTask = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!accessToken || !project) {
      return;
    }

    if (!taskTitle.trim()) {
      setTaskError("Task title is required.");
      return;
    }

    if (!assignedToId) {
      setTaskError(
        "Please select a developer."
      );
      return;
    }

    if (!dueDate) {
      setTaskError("Due date is required.");
      return;
    }

    setCreatingTask(true);
    setTaskError("");

    try {
      const response = await axios.post(
  `${API_URL}/api/tasks`,
  {
    projectId: project.id,
    title: taskTitle.trim(),
    description:
      taskDescription.trim() || undefined,
    assignedToId: Number(assignedToId),
    priority,
    dueDate: new Date(
      `${dueDate}T23:59:59`
    ).toISOString(),
  },
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    withCredentials: true,
  }
);

console.log(
  "Create task response:",
  response.data
);

const projectResponse =
  await axios.get<ProjectResponse>(
    `${API_URL}/api/projects/${project.id}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    }
  );

setProject(projectResponse.data.data);

      setTaskTitle("");
      setTaskDescription("");
      setAssignedToId("");
      setPriority("MEDIUM");
      setDueDate("");
      setShowCreateTask(false);
    } catch (error) {
      console.error(
        "Create task error:",
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
        setTaskError(
          error.response?.data?.error?.message ||
            "Failed to create task."
        );
      } else {
        setTaskError(
          "Failed to create task."
        );
      }
    } finally {
      setCreatingTask(false);
    }
  };

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

  if (loading) {
    return (
      <div className="pm-project-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading project...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="pm-project-details-error">
        <div className="pm-project-details-error-card">
          <h2>Unable to load project</h2>
          <p>
            {error || "Project not found."}
          </p>
          <button
            type="button"
            onClick={() =>
              navigate("/pm/projects")
            }
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const completedTasks = project.tasks.filter(
    (task) => task.status === "DONE"
  ).length;

  const inProgressTasks = project.tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  ).length;

  const reviewTasks = project.tasks.filter(
    (task) => task.status === "IN_REVIEW"
  ).length;

  const overdueTasks = project.tasks.filter(
    (task) => task.isOverdue
  ).length;

  const developers = project.members.filter(
    (member) =>
      member.user.role === "DEVELOPER" &&
      member.user.isActive !== false
  );

  return (
    <div className="pm-project-details">
      <main className="pm-project-details-content">
        <button
          type="button"
          className="pm-back-button"
          onClick={() =>
            navigate("/pm/projects")
          }
        >
          ← Back to Projects
        </button>

        <section className="pm-project-hero">
          <div className="pm-project-hero-main">
            <div className="pm-project-details-avatar">
              {project.name
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <span className="pm-project-details-id">
                Project #{project.id}
              </span>

              <h1>{project.name}</h1>

              <p>
                {project.description ||
                  "No project description available."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="pm-project-task-button"
            onClick={() =>
              navigate("/pm/tasks")
            }
          >
            View All Tasks
          </button>
        </section>

        <section className="pm-project-stats">
          <div className="pm-project-stat">
            <span>Total Tasks</span>
            <strong>
              {project.tasks.length}
            </strong>
          </div>

          <div className="pm-project-stat">
            <span>Completed</span>
            <strong>{completedTasks}</strong>
          </div>

          <div className="pm-project-stat">
            <span>In Progress</span>
            <strong>{inProgressTasks}</strong>
          </div>

          <div className="pm-project-stat">
            <span>In Review</span>
            <strong>{reviewTasks}</strong>
          </div>

          <div className="pm-project-stat overdue">
            <span>Overdue</span>
            <strong>{overdueTasks}</strong>
          </div>
        </section>

        <section className="pm-project-details-grid">
          <div className="pm-project-section">
            <div className="pm-project-section-header">
              <div>
                <h2>Team Members</h2>
                <p>
                  Developers working on this
                  project
                </p>
              </div>

              <span>
                {project.members.length} Members
              </span>
            </div>

            <div className="pm-members-list">
              {project.members.length > 0 ? (
                project.members.map(
                  (member) => (
                    <div
                      className="pm-member"
                      key={member.id}
                    >
                      <div className="pm-member-avatar">
                        {member.user.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {member.user.name}
                        </strong>

                        <span>
                          {member.user.email}
                        </span>
                      </div>

                      <span
                        className={
                          member.user.isActive
                            ? "pm-active"
                            : "pm-inactive"
                        }
                      >
                        {member.user.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>
                  )
                )
              ) : (
                <div className="pm-empty-details">
                  No team members assigned.
                </div>
              )}
            </div>
          </div>

          <div className="pm-project-section">
            <div className="pm-project-section-header">
              <div>
                <h2>Project Information</h2>
                <p>
                  Project ownership and dates
                </p>
              </div>
            </div>

            <div className="pm-project-info-list">
              <div>
                <span>Project Manager</span>

                <strong>
                  {project.createdBy?.name ||
                    user?.name ||
                    "You"}
                </strong>
              </div>

              <div>
                <span>Created</span>

                <strong>
                  {new Date(
                    project.createdAt
                  ).toLocaleDateString()}
                </strong>
              </div>

              <div>
                <span>Last Updated</span>

                <strong>
                  {new Date(
                    project.updatedAt
                  ).toLocaleDateString()}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section className="pm-project-section pm-project-tasks">
          <div className="pm-project-section-header">
            <div>
              <h2>Project Tasks</h2>
              <p>
                Tasks currently belonging to this
                project
              </p>
            </div>

            <div className="pm-project-task-actions">
              <button
                type="button"
                onClick={() => {
                  setShowCreateTask(
                    (previous) => !previous
                  );
                  setTaskError("");
                }}
              >
                {showCreateTask
                  ? "Cancel"
                  : "+ Create Task"}
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/pm/tasks")
                }
              >
                Manage Tasks →
              </button>
            </div>
          </div>

          {showCreateTask && (
            <form
              className="pm-create-task-form"
              onSubmit={handleCreateTask}
            >
              <div className="pm-create-task-form-header">
                <div>
                  <h3>Create Task</h3>

                  <p>
                    Create a new task for{" "}
                    {project.name}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowCreateTask(false);
                    setTaskError("");
                  }}
                >
                  ×
                </button>
              </div>

              {taskError && (
                <div className="pm-create-task-error">
                  {taskError}
                </div>
              )}

              <div className="pm-create-task-fields">
                <div className="pm-create-task-field full">
                  <label htmlFor="task-title">
                    Task Title
                  </label>

                  <input
                    id="task-title"
                    type="text"
                    placeholder="Enter task title"
                    value={taskTitle}
                    onChange={(event) =>
                      setTaskTitle(
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="pm-create-task-field full">
                  <label htmlFor="task-description">
                    Description
                  </label>

                  <textarea
                    id="task-description"
                    placeholder="Enter task description"
                    value={taskDescription}
                    onChange={(event) =>
                      setTaskDescription(
                        event.target.value
                      )
                    }
                    rows={4}
                  />
                </div>

                <div className="pm-create-task-field">
                  <label htmlFor="task-developer">
                    Developer
                  </label>

                  <select
                    id="task-developer"
                    value={assignedToId}
                    onChange={(event) =>
                      setAssignedToId(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Select developer
                    </option>

                    {developers.map(
                      (member) => (
                        <option
                          key={member.user.id}
                          value={
                            member.user.id
                          }
                        >
                          {member.user.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="pm-create-task-field">
                  <label htmlFor="task-priority">
                    Priority
                  </label>

                  <select
                    id="task-priority"
                    value={priority}
                    onChange={(event) =>
                      setPriority(
                        event.target.value as
                          | "LOW"
                          | "MEDIUM"
                          | "HIGH"
                          | "CRITICAL"
                      )
                    }
                  >
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

                <div className="pm-create-task-field">
                  <label htmlFor="task-due-date">
                    Due Date
                  </label>

                  <input
                    id="task-due-date"
                    type="date"
                    value={dueDate}
                    onChange={(event) =>
                      setDueDate(
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="pm-create-task-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateTask(false);
                    setTaskError("");
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingTask}
                >
                  {creatingTask
                    ? "Creating..."
                    : "Create Task"}
                </button>
              </div>
            </form>
          )}

          <div className="pm-project-task-list">
            {project.tasks.length > 0 ? (
              project.tasks.map((task) => (
                <div
                  className="pm-project-task"
                  key={task.id}
                >
                  <div className="pm-project-task-main">
                    <strong>
                      {task.title}
                    </strong>

                    <span>
                      {task.assignedTo
                        ? `Assigned to ${task.assignedTo.name}`
                        : "Unassigned"}
                    </span>
                  </div>

                  <span
                    className={`pm-task-status ${(task.status || "TO_DO").toLowerCase()}`}
                  >
                    {formatStatus(
                      task.status
                    )}
                  </span>

                  <span
                    className={`pm-task-priority ${(task.priority || "MEDIUM").toLowerCase()}`}
                  >
                    {formatPriority(
                      task.priority
                    )}
                  </span>

                  <span
                    className={
                      task.isOverdue
                        ? "pm-task-overdue"
                        : "pm-task-due"
                    }
                  >
                    {new Date(
                      task.dueDate
                    ).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="pm-empty-details">
                No tasks in this project.
              </div>
            )}
          </div>
        </section>

        <section className="pm-project-section">
          <div className="pm-project-section-header">
            <div>
              <h2>Recent Activity</h2>
              <p>
                Latest task status changes
              </p>
            </div>
          </div>

          <div className="pm-activity-list">
            {project.activityLogs.length > 0 ? (
              project.activityLogs.map(
                (activity) => (
                  <div
                    className="pm-activity-item"
                    key={activity.id}
                  >
                    <div className="pm-activity-dot"></div>

                    <div className="pm-activity-content">
                      <strong>
                        {activity.user?.name ||
                          "User"}{" "}
                        changed{" "}
                        {activity.task.title}
                      </strong>

                      <span>
                        {formatStatus(
                          activity.oldStatus
                        )}{" "}
                        →{" "}
                        {formatStatus(
                          activity.newStatus
                        )}
                      </span>
                    </div>

                    <time>
                      {new Date(
                        activity.createdAt
                      ).toLocaleString()}
                    </time>
                  </div>
                )
              )
            ) : (
              <div className="pm-empty-details">
                No activity yet.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProjectManagerProjectDetails;