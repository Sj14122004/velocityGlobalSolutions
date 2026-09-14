import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { socket } from "../../socket/socket";
import "../../public/pages/developer/DeveloperActivity.css";

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

type ActivitiesResponse = {
  success: boolean;
  data: Activity[];
};

const DeveloperActivity = () => {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();

  const [activities, setActivities] =
    useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) {
      logout();
      navigate("/", { replace: true });
      return;
    }

    if (user?.role !== "DEVELOPER") {
      navigate("/", { replace: true });
      return;
    }

    const fetchActivities = async () => {
      try {
        const response =
          await axios.get<ActivitiesResponse>(
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
          "Developer activity error:",
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
                "Failed to load activity."
            : "Failed to load activity."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    const handleActivityCreated = (
      activity: Activity
    ) => {
      if (!activity?.id) {
        return;
      }

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
      handleActivityCreated
    );

    return () => {
      socket.off(
        "activity-created",
        handleActivityCreated
      );
    };
  }, [
    accessToken,
    user,
    logout,
    navigate,
  ]);

  const formatStatus = (
    status: string
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

  const formatTime = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="developer-activity-loading">
        <div className="developer-activity-spinner"></div>
        <p>Loading activity...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="developer-activity-error">
        <div className="developer-activity-error-card">
          <h2>Unable to load activity</h2>
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
    <div className="developer-activity">
      <main className="developer-activity-content">
        <section className="developer-activity-header">
          <div>
            <span>LIVE UPDATES</span>
            <h1>Activity</h1>
            <p>
              Activity from projects and tasks
              assigned to you.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/developer/dashboard"
              )
            }
          >
            Dashboard
          </button>
        </section>

        <section className="developer-activity-card">
          <div className="developer-activity-card-header">
            <div>
              <span>RECENT ACTIVITY</span>
              <h2>Task Activity</h2>
            </div>

            <div className="developer-live-indicator">
              <span></span>
              Live
            </div>
          </div>

          {activities.length === 0 ? (
            <div className="developer-activity-empty">
              <div>✓</div>
              <h3>No activity yet</h3>
              <p>
                Activity for your assigned tasks
                will appear here.
              </p>
            </div>
          ) : (
            <div className="developer-activity-list">
              {activities.map(
                (activity) => (
                  <div
                    className="developer-activity-item"
                    key={activity.id}
                  >
                    <div className="developer-activity-icon">
                      ↻
                    </div>

                    <div className="developer-activity-info">
                      <div className="developer-activity-title">
                        <strong>
                          {activity.task?.title ||
                            "Task"}
                        </strong>

                        <span>
                          {activity.project?.name ||
                            "Project"}
                        </span>
                      </div>

                      <div className="developer-activity-change">
                        <span
                          className="developer-old-status"
                        >
                          {formatStatus(
                            activity.oldStatus
                          )}
                        </span>

                        <span className="developer-arrow">
                          →
                        </span>

                        <span
                          className={`developer-new-status ${activity.newStatus.toLowerCase()}`}
                        >
                          {formatStatus(
                            activity.newStatus
                          )}
                        </span>
                      </div>

                      <div className="developer-activity-meta">
                        <span>
                          {activity.user?.name ||
                            "System"}
                        </span>

                        <span>•</span>

                        <span>
                          {formatTime(
                            activity.createdAt
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default DeveloperActivity;