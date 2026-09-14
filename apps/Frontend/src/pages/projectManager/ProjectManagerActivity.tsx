import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { socket } from "../../socket/socket";
import "../../public/pages/projectManager/ProjectManagerActivity.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

type Activity = {
  id: number;
  projectId: number;
  taskId: number;
  userId: number | null;
  oldStatus: string;
  newStatus: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    role: string;
  } | null;
  task: {
    id: number;
    title: string;
  };
  project: {
    id: number;
    name: string;
  };
};

type ActivityResponse = {
  success: boolean;
  data: Activity[];
};

const ProjectManagerActivity = () => {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();

  const [activities, setActivities] =
    useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActivities = async () => {
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
          await axios.get<ActivityResponse>(
            `${API_URL}/api/activities`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              withCredentials: true,
            }
          );

        setActivities(response.data.data);
      } catch (error) {
        console.error(
          "Project Manager activity error:",
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

        setError("Failed to load activity.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [
    accessToken,
    user,
    logout,
    navigate,
  ]);

  useEffect(() => {
    if (!accessToken || user?.role !== "PROJECT_MANAGER") {
      return;
    }

    const handleActivity = (
      activity: Activity
    ) => {
      setActivities((previous) => {
        if (
          previous.some(
            (item) => item.id === activity.id
          )
        ) {
          return previous;
        }

        return [
          activity,
          ...previous,
        ].slice(0, 20);
      });
    };

    socket.on(
      "activity-created",
      handleActivity
    );

    return () => {
      socket.off(
        "activity-created",
        handleActivity
      );
    };
  }, [accessToken, user]);

  const formatStatus = (status: string) => {
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

  const formatTime = (createdAt: string) => {
    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="pm-activity-loading">
        <div className="loading-spinner"></div>
        <p>Loading activity...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pm-activity-error">
        <div className="pm-activity-error-card">
          <h2>Unable to load activity</h2>
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
    <div className="pm-activity">
      <main className="pm-activity-content">
        <header className="pm-activity-header">
          <div>
            <h1>Activity</h1>
            <p>
              Live activity from your projects.
            </p>
          </div>

          <div className="pm-activity-live">
            <span></span>
            Live
          </div>
        </header>

        <section className="pm-activity-card">
          <div className="pm-activity-card-header">
            <div>
              <h2>Recent Activity</h2>
              <p>
                Latest task status changes across
                your projects.
              </p>
            </div>

            <span>
              {activities.length} Activities
            </span>
          </div>

          <div className="pm-activity-list">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div
                  className="pm-activity-row"
                  key={activity.id}
                >
                  <div className="pm-activity-icon">
                    ↗
                  </div>

                  <div className="pm-activity-main">
                    <div className="pm-activity-title">
                      <strong>
                        {activity.user?.name ||
                          "User"}
                      </strong>

                      <span>changed</span>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/pm/tasks/${activity.task.id}`
                          )
                        }
                      >
                        {activity.task.title}
                      </button>
                    </div>

                    <div className="pm-activity-meta">
                      <span>
                        {activity.project.name}
                      </span>

                      <span>•</span>

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
                  </div>

                  <time>
                    {formatTime(
                      activity.createdAt
                    )}
                  </time>
                </div>
              ))
            ) : (
              <div className="pm-activity-empty">
                <div>⌁</div>
                <h3>No activity yet</h3>
                <p>
                  Activity from your projects will
                  appear here automatically.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProjectManagerActivity;