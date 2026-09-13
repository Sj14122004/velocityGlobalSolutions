import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../public/pages/admin/AdminUser.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

type Role = "PROJECT_MANAGER" | "DEVELOPER";

type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
};

type UsersResponse = {
  success: boolean;
  data: User[];
};

const AdminUsers = () => {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | Role>("ALL");

  useEffect(() => {
    const fetchUsers = async () => {
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
        setLoading(true);
        setError("");

        const requestConfig = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        };

        const [projectManagerResponse, developerResponse] =
          await Promise.all([
            axios.get<UsersResponse>(
              `${API_URL}/api/project-managers`,
              requestConfig
            ),
            axios.get<UsersResponse>(
              `${API_URL}/api/developers`,
              requestConfig
            ),
          ]);

        if (
          !projectManagerResponse.data.success ||
          !developerResponse.data.success
        ) {
          throw new Error("Failed to load users.");
        }

        const projectManagers = projectManagerResponse.data.data;
        const developers = developerResponse.data.data;

        setUsers([...projectManagers, ...developers]);
      } catch (error) {
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
                "Failed to load users."
            : error instanceof Error
              ? error.message
              : "Failed to load users."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [accessToken, user, logout, navigate]);

  const filteredUsers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return users.filter((item) => {
      const matchesSearch =
        !searchValue ||
        item.name.toLowerCase().includes(searchValue) ||
        item.email.toLowerCase().includes(searchValue);

      const matchesRole =
        roleFilter === "ALL" || item.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const formatRole = (role: Role) => {
    if (role === "PROJECT_MANAGER") {
      return "Project Manager";
    }

    return "Developer";
  };

  if (loading) {
    return (
      <div className="admin-user-loading">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-user-error">
        <div className="admin-user-error-card">
          <h2>Unable to load users</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <main className="users-content">
        <div className="users-header">
          <div>
            <h1>Users</h1>
            <p>
              View and manage project managers and developers.
            </p>
          </div>

          <button
            className="create-user-button"
            onClick={() => navigate("/admin/users/create")}
          >
            + Create User
          </button>
        </div>

        <section className="users-card">
          <div className="users-card-header">
            <div>
              <h2>All Users</h2>
              <p>
                Project Managers and Developers in the organization.
              </p>
            </div>

            <div className="users-count">
              {filteredUsers.length} Users
            </div>
          </div>

          <div className="users-filters">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(
                  event.target.value as "ALL" | Role
                )
              }
            >
              <option value="ALL">All Roles</option>
              <option value="PROJECT_MANAGER">
                Project Manager
              </option>
              <option value="DEVELOPER">
                Developer
              </option>
            </select>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="users-empty">
              <h3>No users found</h3>
              <p>
                Try changing your search or role filter.
              </p>
            </div>
          ) : (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((item) => (
                    <tr key={`${item.role}-${item.id}`}>
                      <td>
                        <div className="user-name-cell">
                          <div className="user-table-avatar">
                            {item.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <span>{item.name}</span>
                        </div>
                      </td>

                      <td>{item.email}</td>

                      <td>
                        <span className="role-badge">
                          {formatRole(item.role)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            item.isActive
                              ? "status-badge status-active"
                              : "status-badge status-inactive"
                          }
                        >
                          {item.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        {new Date(
                          item.createdAt
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        <button
                          className="table-action"
                          title="View user"
                          onClick={() =>
                            navigate(
                              `/admin/users/${item.role}/${item.id}`
                            )
                          }
                        >
                          →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminUsers;