import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../public/pages/components/Navbar.css";

const Navbar = () => {
  const {
    user,
    notifications,
    unreadCount,
    logout,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useAuth();

  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] =
    useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleProfile = () => {
    if (user?.role === "ADMIN") {
      navigate("/admin/profile");
    }
  };

  const handleDashboard = () => {
    if (user?.role === "ADMIN") {
      navigate("/admin/dashboard");
      return;
    }

    if (user?.role === "PROJECT_MANAGER") {
      navigate("/pm/dashboard");
      return;
    }

    navigate("/developer/dashboard");
  };

  const handleNotificationClick = async (
    notificationId: number,
    isRead: boolean
  ) => {
    if (isRead) {
      return;
    }

    await markNotificationAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    await markAllNotificationsAsRead();
  };

  const formatNotificationTime = (
    createdAt: string
  ) => {
    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString();
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="navbar-logo"
          onClick={() => navigate("/")}
        >
          <span className="navbar-logo-icon">
            V
          </span>
          <span>Velozity</span>
        </button>

        <div className="navbar-links">
          <button
            type="button"
            className="navbar-link"
            onClick={handleDashboard}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 9.5V21h14V9.5" />
              <path d="M9 21v-7h6v7" />
            </svg>
            <span>Dashboard</span>
          </button>

          {user?.role === "ADMIN" && (
            <button
              type="button"
              className="navbar-link"
              onClick={() => navigate("/admin/users")}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Users</span>
            </button>
          )}

          <button
            type="button"
            className="navbar-link"
            onClick={() => navigate("/admin/projects")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="3"
                width="7"
                height="7"
                rx="1"
              />
              <rect
                x="14"
                y="3"
                width="7"
                height="7"
                rx="1"
              />
              <rect
                x="3"
                y="14"
                width="7"
                height="7"
                rx="1"
              />
              <rect
                x="14"
                y="14"
                width="7"
                height="7"
                rx="1"
              />
            </svg>
            <span>Projects</span>
          </button>

          <button
            type="button"
            className="navbar-link"
            onClick={() => navigate("/admin/tasks")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect
                x="4"
                y="3"
                width="16"
                height="18"
                rx="2"
              />
              <path d="M8 7h8" />
              <path d="m8 11 1.5 1.5L12 10" />
              <path d="M8 16h8" />
            </svg>
            <span>Tasks</span>
          </button>

          <button
            type="button"
            className="navbar-link"
            onClick={() => navigate("/admin/activity")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M3 12h4l3-8 4 16 3-8h4" />
            </svg>
            <span>Activity</span>
          </button>
        </div>
      </div>

      <div className="navbar-right">
        <div className="notification-wrapper">
          <button
            type="button"
            className="notification-button"
            onClick={() =>
              setShowNotifications(
                (previous) => !previous
              )
            }
            aria-label="Notifications"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <div>
                  <h3>Notifications</h3>
                  <span>
                    {unreadCount} unread
                  </span>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="mark-all-read-btn"
                    onClick={
                      handleMarkAllAsRead
                    }
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="no-notifications">
                    No notifications
                  </div>
                ) : (
                  notifications.map(
                    (notification) => (
                      <button
                        type="button"
                        key={notification.id}
                        className={`notification-item ${
                          notification.isRead
                            ? "read"
                            : "unread"
                        }`}
                        onClick={() =>
                          handleNotificationClick(
                            notification.id,
                            notification.isRead
                          )
                        }
                      >
                        <div className="notification-content">
                          <p>
                            {notification.message}
                          </p>
                          <span>
                            {formatNotificationTime(
                              notification.createdAt
                            )}
                          </span>
                        </div>

                        {!notification.isRead && (
                          <span className="notification-dot" />
                        )}
                      </button>
                    )
                  )
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="navbar-profile"
          onClick={handleProfile}
          disabled={user?.role !== "ADMIN"}
        >
          <div className="navbar-avatar">
            {user?.name
              ?.charAt(0)
              .toUpperCase() || "U"}
          </div>

          <div className="navbar-user-info">
            <span className="navbar-user-name">
              {user?.name || "User"}
            </span>

            <span className="navbar-user-role">
              {user?.role
                ?.replace("_", " ")
                .toLowerCase()}
            </span>
          </div>
        </button>

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
            <path d="M21 3v18" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;