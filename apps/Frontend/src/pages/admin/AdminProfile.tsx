import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import "../../public/pages/admin/AdminProfile.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

type Admin = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN";
  isActive: boolean;
  createdAt: string;
};

type AdminResponse = {
  success: boolean;
  data: Admin;
};

const AdminProfile = () => {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();

  const [admin, setAdmin] = useState<Admin | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!accessToken) {
        logout();
        navigate("/", { replace: true });
        return;
      }

      if (!user || user.role !== "ADMIN") {
        navigate("/", { replace: true });
        return;
      }

      try {
        const response = await axios.get<AdminResponse>(
          `${API_URL}/api/admins/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        );

        const adminData = response.data.data;

        setAdmin(adminData);
        setForm({
          name: adminData.name,
          email: adminData.email,
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
                "Failed to load profile."
            : "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [accessToken, user, logout, navigate]);

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

    if (!accessToken || !admin) {
      return;
    }

    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }

    setSaving(true);

    try {
      const response = await axios.patch<AdminResponse>(
        `${API_URL}/api/admins/${admin.id}`,
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
        throw new Error("Failed to update profile.");
      }

      setAdmin(response.data.data);

      toast.success("Profile updated successfully.");
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
              "Failed to update profile."
          : error instanceof Error
            ? error.message
            : "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="admin-profile-error">
        <div className="admin-profile-error-card">
          <h2>Profile not found</h2>
          <button onClick={() => navigate("/admin/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-profile">
      <main className="profile-content">
        <div className="profile-header">
          <div>
            <h1>My Profile</h1>
            <p>View and update your administrator profile.</p>
          </div>

          <button
            className="profile-back-button"
            onClick={() => navigate("/admin/dashboard")}
          >
            ← Dashboard
          </button>
        </div>

        <section className="profile-card">
          <div className="profile-card-header">
            <div className="profile-avatar">
              {admin.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2>{admin.name}</h2>
              <p>{admin.email}</p>
            </div>
          </div>

          <form
            className="profile-form"
            onSubmit={handleSubmit}
          >
            <div className="profile-form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="profile-info">
              <div>
                <span>Role</span>
                <strong>Admin</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {admin.isActive ? "Active" : "Inactive"}
                </strong>
              </div>

              <div>
                <span>Created</span>
                <strong>
                  {new Date(
                    admin.createdAt
                  ).toLocaleDateString()}
                </strong>
              </div>
            </div>

            <div className="profile-actions">
              <button
                type="submit"
                className="profile-save-button"
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

export default AdminProfile;