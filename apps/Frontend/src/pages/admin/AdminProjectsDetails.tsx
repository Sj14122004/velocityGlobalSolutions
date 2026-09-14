import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../public/pages/admin/AdminProjectsDetails.css";

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
  status: string;
  priority: string;
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
  createdById: number | null;
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

const AdminProjectDetails = () => {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [project, setProject] =
    useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
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

        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.error?.message ||
              "Failed to load project details."
          );
        } else {
          setError(
            "Failed to load project details."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [
    accessToken,
    user,
    id,
    logout,
    navigate,
  ]);

  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const formatPriority = (priority: string) => {
    return (
      priority.charAt(0).toUpperCase() +
      priority.slice(1).toLowerCase()
    );
  };

  if (loading) {
    return (
      <div className="project-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-details-error">
        <div className="project-details-error-card">
          <h2>Unable to load project</h2>
          <p>
            {error || "Project not found."}
          </p>
          <button
            type="button"
            onClick={() =>
              navigate("/admin/projects")
            }
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-project-details">
      <main className="project-details-content">
        <div className="project-details-back">
          <button
            type="button"
            onClick={() =>
              navigate("/admin/projects")
            }
          >
            ← Back to Projects
          </button>
        </div>

        <section className="project-details-hero card">
          <div>
            <div className="project-details-title">
              <div className="project-details-avatar">
                {project.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <h1>{project.name}</h1>
                <span>
                  Project #{project.id}
                </span>
              </div>
            </div>

            <p className="project-details-description">
              {project.description ||
                "No description available."}
            </p>
          </div>

          <div className="project-details-dates">
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
        </section>

        <section className="project-details-stats">
          <div className="project-detail-stat card">
            <span>Total Tasks</span>
            <strong>{project.tasks.length}</strong>
          </div>

          <div className="project-detail-stat card">
            <span>Team Members</span>
            <strong>
              {project.members.length}
            </strong>
          </div>

          <div className="project-detail-stat card">
            <span>Completed</span>
            <strong>
              {
                project.tasks.filter(
                  (task) => task.status === "DONE"
                ).length
              }
            </strong>
          </div>

          <div className="project-detail-stat card">
            <span>Overdue</span>
            <strong>
              {
                project.tasks.filter(
                  (task) => task.isOverdue
                ).length
              }
            </strong>
          </div>
        </section>

        <section className="project-details-grid">
          <div className="project-team card">
            <div className="project-section-header">
              <div>
                <h2>Project Manager</h2>
                <p>Project owner</p>
              </div>
            </div>

            {project.createdBy ? (
              <div className="manager-card">
                <div className="manager-avatar">
                  {project.createdBy.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>
                    {project.createdBy.name}
                  </strong>
                  <span>
                    {project.createdBy.email}
                  </span>
                </div>
              </div>
            ) : (
              <p className="details-empty">
                No project manager assigned.
              </p>
            )}

            <div className="project-section-header members-header">
              <div>
                <h2>Team Members</h2>
                <p>
                  Developers and project members
                </p>
              </div>
            </div>

            <div className="members-list">
              {project.members.length === 0 ? (
                <p className="details-empty">
                  No team members.
                </p>
              ) : (
                project.members.map((member) => (
                  <div
                    className="member-row"
                    key={member.id}
                  >
                    <div className="member-avatar">
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
                          ? "member-status active"
                          : "member-status inactive"
                      }
                    >
                      {member.user.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="project-activity card">
            <div className="project-section-header">
              <div>
                <h2>Activity History</h2>
                <p>Latest project activity</p>
              </div>
            </div>

            <div className="project-activity-list">
              {project.activityLogs.length === 0 ? (
                <p className="details-empty">
                  No activity yet.
                </p>
              ) : (
                project.activityLogs.map(
                  (activity) => (
                    <div
                      className="project-activity-item"
                      key={activity.id}
                    >
                      <div className="activity-marker">
                        ✓
                      </div>

                      <div className="activity-details">
                        <strong>
                          {activity.user?.name ||
                            "User"}{" "}
                          changed{" "}
                          {activity.task.title}
                        </strong>

                        <div className="activity-status">
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
                  )
                )
              )}
            </div>
          </div>
        </section>

        <section className="project-tasks card">
          <div className="project-section-header">
            <div>
              <h2>Project Tasks</h2>
              <p>
                All tasks belonging to this project
              </p>
            </div>
          </div>

          <div className="project-tasks-wrapper">
            <table className="project-tasks-table">
              <thead>
                <tr>
                  <th>TASK</th>
                  <th>ASSIGNED TO</th>
                  <th>STATUS</th>
                  <th>PRIORITY</th>
                  <th>DUE DATE</th>
                </tr>
              </thead>

              <tbody>
                {project.tasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="details-empty"
                    >
                      No tasks found.
                    </td>
                  </tr>
                ) : (
                  project.tasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <div className="task-name">
                          <strong>
                            {task.title}
                          </strong>
                          <span>
                            Task #{task.id}
                          </span>
                        </div>
                      </td>

                      <td>
                        {task.assignedTo ? (
                          <div className="assigned-user">
                            <div className="small-avatar">
                              {task.assignedTo.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <span>
                              {task.assignedTo.name}
                            </span>
                          </div>
                        ) : (
                          <span>
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td>
                        <span className="task-status">
                          {formatStatus(
                            task.status
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`task-priority ${task.priority.toLowerCase()}`}
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
                              ? "task-due overdue"
                              : "task-due"
                          }
                        >
                          {new Date(
                            task.dueDate
                          ).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminProjectDetails;