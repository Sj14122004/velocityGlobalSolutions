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
        <section className="activity-card">
          <div className="activity-card-header">
            <div>
              <h2>Recent Activity</h2>
              <p>Latest task status changes from your organization.</p>
            </div>
            <div className="activity-count">
              {activities.length} Events
            </div>
          </div>

          <div className="activity-list">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div className="activity-item" key={activity.id}>
                  <div className="activity-avatar">
                    {(activity.user?.name || "U").charAt(0).toUpperCase()}
                  </div>

                  <div className="activity-details">
                    <div className="activity-message">
                      <strong>{activity.user?.name || "User"}</strong>
                      <span> moved </span>
                      <strong>
                        {activity.task?.title || `Task #${activity.taskId}`}
                      </strong>
                      <span> from </span>
                      <span className="activity-old-status">
                        {formatStatus(activity.oldStatus)}
                      </span>
                      <span> → </span>
                      <span className="activity-new-status">
                        {formatStatus(activity.newStatus)}
                      </span>
                    </div>

                    <div className="activity-meta">
                      <span>
                        {activity.project?.name ||
                          `Project #${activity.projectId}`}
                      </span>
                      <span>·</span>
                      <span>{formatTime(activity.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-activity">
                No activity found.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminActivity;