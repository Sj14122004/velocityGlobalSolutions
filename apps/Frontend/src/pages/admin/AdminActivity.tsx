import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../public/pages/admin/AdminAcitivity.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

type Activity = {
  id: number;
  taskId: number;
  projectId: number;
  userId: number;
  oldStatus: string;
  newStatus: string;
  createdAt: string;
  user?: {
    name: string;
  };
  task?: {
    title: string;
  };
  project?: {
    name: string;
  };
};

type ActivityResponse = {
  success: boolean;
  data: Activity[];
};

const AdminActivity = () => {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActivities = async () => {
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
        const response = await axios.get<ActivityResponse>(
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
        console.error("Activity error:", error);

        if (axios.isAxiosError(error) && error.response?.status === 401) {
          logout();
          navigate("/", { replace: true });
          return;
        }

        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.error?.message ||
              "Failed to load activity."
          );
        } else {
          setError("Failed to load activity.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [accessToken, user, logout, navigate]);

  const formatStatus = (status: string) => {
    if (status === "IN_PROGRESS") return "In Progress";
    if (status === "IN_REVIEW") return "In Review";
    if (status === "DONE") return "Done";
    return "To Do";
  };

  const formatTime = (date: string) => {
    const value = new Date(date);
    const seconds = Math.floor((Date.now() - value.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  if (loading) {
    return (
      <div className="activity-loading">
        <div className="loading-spinner"></div>
        <p>Loading activity...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="activity-error">
        <div className="activity-error-card">
          <h2>Unable to load activity</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-activity">
      <main className="activity-content">
        <section className="recent-users card">
  <div className="card-title-row">
    <div>
      <h2>Live Activity</h2>
      <p>Latest project and task status changes</p>
    </div>
  </div>

  <div className="live-activity-list">
    {activities.length === 0 ? (
      <div className="live-activity-empty">
        No recent activity.
      </div>
    ) : (
      activities.map((activity) => (
        <div
          className="live-activity-item"
          key={activity.id}
        >
          <div className="live-activity-icon">
            ↗
          </div>

          <div className="live-activity-content">
            <p className="live-activity-title">
              {activity.user?.name || "User"} changed{" "}
              {activity.task?.title || "task"} status
            </p>

            <p className="live-activity-meta">
              {activity.project?.name || "Project"}
            </p>

            <div className="live-activity-status">
              <span>
                {formatStatus(activity.oldStatus)}
              </span>

              <span className="status-arrow">
                →
              </span>

              <span>
                {formatStatus(activity.newStatus)}
              </span>
            </div>
          </div>

          <span className="live-activity-time">
          {new Date(
            activity.createdAt
              ).toLocaleString()}
              </span>
            </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminActivity;