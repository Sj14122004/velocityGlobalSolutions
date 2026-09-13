import { useState, type FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import "../../public/pages/admin/AdminCreateUser.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

type Role = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";

const AdminCreateUser = () => {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "DEVELOPER" as Role,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!accessToken) {
      logout();
      navigate("/", { replace: true });
      return;
    }

    if (user?.role !== "ADMIN") {
      navigate("/", { replace: true });
      return;
    }

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        form.role === "ADMIN"
          ? "/api/admins"
          : form.role === "PROJECT_MANAGER"
            ? "/api/project-managers"
            : "/api/developers";

      const response = await axios.post(
        `${API_URL}${endpoint}`,
        {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
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
          response.data.error?.message || "Failed to create user."
        );
      }

      toast.success("User created successfully.");
      navigate("/admin/users");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logout();
        navigate("/", { replace: true });
        return;
      }

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.error?.message || "Failed to create user."
        );
      } else {
        toast.error(
          error instanceof Error ? error.message : "Failed to create user."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-create-user">
      <main className="create-user-content">
        <header className="create-user-topbar">
          <div>
            <h1>Create User</h1>
            <p>Add a new member to the organization.</p>
          </div>
          <button
            className="back-button"
            onClick={() => navigate("/admin/users")}
          >
            ← Go to Users
          </button>
        </header>

        <section className="create-user-card">
          <div className="create-user-card-header">
            <h2>User Information</h2>
            <p>Enter the details for the new organization member.</p>
          </div>

          <form onSubmit={handleSubmit} className="create-user-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email address"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="ADMIN">Admin</option>
                <option value="PROJECT_MANAGER">Project Manager</option>
                <option value="DEVELOPER">Developer</option>
              </select>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => navigate("/admin/users")}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="create-button"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default AdminCreateUser;