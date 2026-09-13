import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../public/pages/admin/AdminUser.css";

const API_URL = "http://localhost:5000";

type Role = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";

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
        const [adminsResponse, managersResponse, developersResponse] =
          await Promise.all([
            axios.get<UsersResponse>(`${API_URL}/api/admins`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              withCredentials: true,
            }),
            axios.get<UsersResponse>(
              `${API_URL}/api/project-managers`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
                withCredentials: true,
              }
            ),
            axios.get<UsersResponse>(`${API_URL}/api/developers`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              withCredentials: true,
            }),
          ]);

        setUsers([
          ...adminsResponse.data.data,
          ...managersResponse.data.data,
          ...developersResponse.data.data,
        ]);
      } catch (error) {
        console.error("Users error:", error);

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
              "Failed to load users."
          );
        } else {
          setError("Failed to load users.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [accessToken, user, logout, navigate]);

  const filteredUsers = useMemo(() => {
    const value = search.toLowerCase().trim();

    return users.filter((item) => {
      const matchesSearch =
        !value ||
        item.name.toLowerCase().includes(value) ||
        item.email.toLowerCase().includes(value) ||
        item.role.toLowerCase().includes(value);

      const matchesRole =
        roleFilter === "ALL" ||
        item.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const formatRole = (role: Role) => {
    if (role === "PROJECT_MANAGER") return "Project Manager";
    if (role === "DEVELOPER") return "Developer";
    return "Admin";
  };

  if (loading) {
    return (
      <div className="users-loading">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-error">
        <div className="users-error-card">
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

        <section className="users-card">
          <div className="users-card-header">
            <div>
              <h2>All Users</h2>
              <p>View and manage organization members.</p>
            </div>

            <div className="users-count">
              {filteredUsers.length} Users
            </div>
          </div>

          <div className="users-filters">
            <div className="users-search">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(
                  event.target.value as "ALL" | Role
                )
              }
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="PROJECT_MANAGER">
                Project Manager
              </option>
              <option value="DEVELOPER">Developer</option>
            </select>
          </div>

          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                  <th>CREATED</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="table-user">
                          <div className="table-avatar">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{item.name}</strong>
                            <span>{item.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="table-role">
                          {formatRole(item.role)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            item.isActive
                              ? "table-status active"
                              : "table-status inactive"
                          }
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          className="table-action"
                          title="View user"
                        >
                          →
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="empty-table">
                      No users found.
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

export default AdminUsers;