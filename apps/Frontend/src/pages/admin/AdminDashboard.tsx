import React from "react";
import {
  Users,
  UserPlus,
  FolderKanban,
  CheckCircle2,
  Clock3,
  TrendingUp,
  MoreVertical,
  Search,
  Bell,
  Plus,
} from "lucide-react";
import "../../public/pages/admin/AdminDashboard.css";

interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Project Manager" | "Developer";
  status: "Active" | "Inactive";
}

const recentUsers: User[] = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@velozity.com",
    role: "Project Manager",
    status: "Active",
  },
  {
    id: 2,
    name: "Priya Singh",
    email: "priya@velozity.com",
    role: "Developer",
    status: "Active",
  },
  {
    id: 3,
    name: "Aman Verma",
    email: "aman@velozity.com",
    role: "Developer",
    status: "Active",
  },
  {
    id: 4,
    name: "Neha Patel",
    email: "neha@velozity.com",
    role: "Project Manager",
    status: "Inactive",
  },
];

const AdminDashboard: React.FC = () => {
  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">V</div>
          <div>
            <h2>Velozity</h2>
            <span>Global Solutions</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-title">MAIN MENU</p>

          <a href="/admin/dashboard" className="nav-item active">
            <TrendingUp size={19} />
            <span>Dashboard</span>
          </a>

          <a href="/admin/users" className="nav-item">
            <Users size={19} />
            <span>Users</span>
          </a>

          <a href="/admin/projects" className="nav-item">
            <FolderKanban size={19} />
            <span>Projects</span>
          </a>

          <p className="nav-title management-title">MANAGEMENT</p>

          <a href="/admin/users/create" className="nav-item">
            <UserPlus size={19} />
            <span>Add User</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="admin-profile">
            <div className="profile-avatar">A</div>

            <div className="profile-info">
              <strong>Admin</strong>
              <span>Administrator</span>
            </div>

            <MoreVertical size={18} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, Admin. Here's what's happening today.</p>
          </div>

          <div className="header-actions">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search..."
              />
            </div>

            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>

            <button
              className="add-user-btn"
              onClick={() => {
                window.location.href = "/admin/users/create";
              }}
            >
              <Plus size={18} />
              Add User
            </button>
          </div>
        </header>

        {/* Stats */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon users-icon">
                <Users size={22} />
              </div>

              <span className="stat-growth">
                <TrendingUp size={14} />
                12.5%
              </span>
            </div>

            <div className="stat-content">
              <span>Total Users</span>
              <h2>48</h2>
            </div>

            <p className="stat-footer">Compared to last month</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon manager-icon">
                <UserPlus size={22} />
              </div>

              <span className="stat-label">Active</span>
            </div>

            <div className="stat-content">
              <span>Project Managers</span>
              <h2>8</h2>
            </div>

            <p className="stat-footer">Managing current projects</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon developer-icon">
                <Users size={22} />
              </div>

              <span className="stat-label">Active</span>
            </div>

            <div className="stat-content">
              <span>Developers</span>
              <h2>38</h2>
            </div>

            <p className="stat-footer">Working on assigned tasks</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon project-icon">
                <FolderKanban size={22} />
              </div>

              <span className="stat-growth">
                <TrendingUp size={14} />
                8.2%
              </span>
            </div>

            <div className="stat-content">
              <span>Total Projects</span>
              <h2>24</h2>
            </div>

            <p className="stat-footer">Across all teams</p>
          </div>
        </section>

        {/* Middle Section */}
        <section className="dashboard-content-grid">
          {/* Project Overview */}
          <div className="dashboard-card project-overview">
            <div className="card-header">
              <div>
                <h3>Project Overview</h3>
                <p>Current project status</p>
              </div>

              <button className="view-btn">View All</button>
            </div>

            <div className="project-status-grid">
              <div className="project-status">
                <div className="status-icon completed">
                  <CheckCircle2 size={20} />
                </div>

                <div>
                  <span>Completed</span>
                  <strong>9</strong>
                </div>
              </div>

              <div className="project-status">
                <div className="status-icon progress">
                  <TrendingUp size={20} />
                </div>

                <div>
                  <span>In Progress</span>
                  <strong>11</strong>
                </div>
              </div>

              <div className="project-status">
                <div className="status-icon pending">
                  <Clock3 size={20} />
                </div>

                <div>
                  <span>Pending</span>
                  <strong>4</strong>
                </div>
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-heading">
                <span>Overall completion</span>
                <strong>72%</strong>
              </div>

              <div className="progress-bar">
                <div className="progress-value"></div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card quick-actions">
            <div className="card-header">
              <div>
                <h3>Quick Actions</h3>
                <p>Manage your workspace</p>
              </div>
            </div>

            <button
              className="quick-action"
              onClick={() => {
                window.location.href = "/admin/users/create";
              }}
            >
              <div className="quick-icon">
                <UserPlus size={19} />
              </div>

              <div>
                <strong>Add New User</strong>
                <span>Create an admin, manager or developer</span>
              </div>
            </button>

            <button
              className="quick-action"
              onClick={() => {
                window.location.href = "/admin/users";
              }}
            >
              <div className="quick-icon">
                <Users size={19} />
              </div>

              <div>
                <strong>Manage Users</strong>
                <span>View and manage all users</span>
              </div>
            </button>

            <button
              className="quick-action"
              onClick={() => {
                window.location.href = "/admin/projects";
              }}
            >
              <div className="quick-icon">
                <FolderKanban size={19} />
              </div>

              <div>
                <strong>View Projects</strong>
                <span>Monitor all active projects</span>
              </div>
            </button>
          </div>
        </section>

        {/* Recent Users */}
        <section className="dashboard-card recent-users">
          <div className="card-header">
            <div>
              <h3>Recent Users</h3>
              <p>Recently added team members</p>
            </div>

            <button
              className="view-btn"
              onClick={() => {
                window.location.href = "/admin/users";
              }}
            >
              View All Users
            </button>
          </div>

          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {user.name.charAt(0)}
                        </div>

                        <div>
                          <strong>{user.name}</strong>
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="role-badge">
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          user.status === "Active"
                            ? "active-status"
                            : "inactive-status"
                        }`}
                      >
                        <span className="status-dot"></span>
                        {user.status}
                      </span>
                    </td>

                    <td>
                      <button className="table-action">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;