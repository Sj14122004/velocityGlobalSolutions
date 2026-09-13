import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import "../../public/pages/admin/AdminUserDetails.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

type Role = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";

type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
};

type UserResponse = {
  success: boolean;
  data: User;
};

const AdminUserDetails = () => {
  const { role, id } = useParams();
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
  });
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!accessToken) {
        logout();
        navigate("/", { replace: true });
        return;
      }

      if (user?.role !== "ADMIN") {
        navigate("/", { replace: true });
        return;
      }

      if (!id || !role) {
        toast.error("Invalid user information.");
        navigate("/admin/users");
        return;
      }

      try {
        const endpoint =
          role === "PROJECT_MANAGER"
            ? `/api/project-managers/${id}`
            : role === "DEVELOPER"
              ? `/api/developers/${id}`
              : `/api/admins/${id}`;

        const response = await axios.get<UserResponse>(
          `${API_URL}${endpoint}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        );

        const selectedUser = response.data.data;

        setUserData(selectedUser);
        setForm({
          name: selectedUser.name,
          email: selectedUser.email,
        });
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401
        ) {
          logout();
          navigate("/", { replace: true });
          return;
        }

        toast.error(
          axios.isAxiosError(error)
            ? error.response?.data?.error?.message ||
                "Failed to load user."
            : "Failed to load user."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [accessToken, user, role, id, logout, navigate]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!accessToken || !id || !role) {
      return;
    }

    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }

    setSaving(true);

    try {
      const endpoint =
        role === "PROJECT_MANAGER"
          ? `/api/project-managers/${id}`
          : role === "DEVELOPER"
            ? `/api/developers/${id}`
            : `/api/admins/${id}`;

      const response = await axios.patch(
        `${API_URL}${endpoint}`,
        {
          name: form.name.trim(),
          email: form.email.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.error?.message ||
            "Failed to update user."
        );
      }

      toast.success("User updated successfully.");
      navigate("/admin/users");
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        logout();
        navigate("/", { replace: true });
        return;
      }

      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.error?.message ||
              "Failed to update user."
          : error instanceof Error
            ? error.message
            : "Failed to update user."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!accessToken || !id || !role) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete this ${formatRole(
        role as Role
      )}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const endpoint =
        role === "PROJECT_MANAGER"
          ? `/api/project-managers/${id}`
          : role === "DEVELOPER"
            ? `/api/developers/${id}`
            : `/api/admins/${id}`;

      const response = await axios.delete(
        `${API_URL}${endpoint}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.error?.message ||
            "Failed to delete user."
        );
      }

      toast.success("User deleted successfully.");
      navigate("/admin/users");
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        logout();
        navigate("/", { replace: true });
        return;
      }

      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.error?.message ||
              "Failed to delete user."
          : error instanceof Error
            ? error.message
            : "Failed to delete user."
      );
    }
  };

  const formatRole = (userRole: Role) => {
    if (userRole === "PROJECT_MANAGER") {
      return "Project Manager";
    }

    if (userRole === "DEVELOPER") {
      return "Developer";
    }

    return "Admin";
  };

  if (loading) {
    return (
      <div className="admin-user-loading">
        <div className="loading-spinner"></div>
        <p>Loading user...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="admin-user-error">
        <div className="admin-user-error-card">
          <h2>User not found</h2>
          <button
            onClick={() => navigate("/admin/users")}
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-user-details">
      <main className="user-details-content">
        <div className="user-details-header">
          <div>
            <h1>User Details</h1>
            <p>View and update user information.</p>
          </div>

          <button
            className="back-button"
            onClick={() => navigate("/admin/users")}
          >
            ← Back to Users
          </button>
        </div>

        <section className="user-details-card">
          <div className="user-details-card-header">
            <div className="details-avatar">
              {userData.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2>{userData.name}</h2>
              <p>{userData.email}</p>
            </div>
          </div>

          <form
            className="user-details-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="user-info">
              <div>
                <span>Role</span>
                <strong>
                  {formatRole(userData.role)}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {userData.isActive
                    ? "Active"
                    : "Inactive"}
                </strong>
              </div>

              <div>
                <span>Created</span>
                <strong>
                  {new Date(
                    userData.createdAt
                  ).toLocaleDateString()}
                </strong>
              </div>
            </div>
            <div className="user-details-actions">
              <button
                type="button"
                className="delete-button"
                onClick={handleDelete}
              >
                Delete User
              </button>

              <button
                type="submit"
                className="save-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default AdminUserDetails;