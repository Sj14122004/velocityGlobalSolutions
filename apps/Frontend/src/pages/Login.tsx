
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import "../public/pages/login.css";

type Role = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";

type LoginResponse = {
  success: boolean;
  data?: {
    user: {
      id: number;
      name: string;
      email: string;
      role: Role;
    };
    accessToken: string;
  };
  error?: {
    code: string;
    message: string;
  };
};

const roles: { value: Role; label: string }[] = [
  {
    value: "ADMIN",
    label: "Admin",
  },
  {
    value: "PROJECT_MANAGER",
    label: "Project Manager",
  },
  {
    value: "DEVELOPER",
    label: "Developer",
  },
];

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const Login = () => {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] =
    useState<Role>("ADMIN");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const result: LoginResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error?.message || "Login failed"
        );
      }

      if (!result.data?.accessToken || !result.data.user) {
        throw new Error("Invalid login response");
      }

      const user = result.data.user;
      const accessToken = result.data.accessToken;

      // Store access token for authenticated API and Socket.IO requests
      sessionStorage.setItem("accessToken", accessToken);

      // Store basic user information for the current session
      sessionStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      // Check selected role against backend role
      if (user.role !== selectedRole) {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("user");

        throw new Error(
          `This account belongs to ${user.role.replace(
            "_",
            " "
          )}, not ${selectedRole.replace("_", " ")}.`
        );
      }

      toast.success("Login successful");

      if (user.role === "ADMIN") {
        navigate("/admin/dashboard", {
          replace: true,
        });
        return;
      }

      if (user.role === "PROJECT_MANAGER") {
        navigate("/pm/dashboard", {
          replace: true,
        });
        return;
      }

      if (user.role === "DEVELOPER") {
        navigate("/developer/dashboard", {
          replace: true,
        });
        return;
      }
    } catch (error) {
      console.error("Login error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-container">
        <div className="login-card">
          <div className="login-header">
            <p className="login-brand">VELOZITY</p>

            <h1>Project Dashboard</h1>

            <p className="login-subtitle">
              Sign in to continue
            </p>
          </div>

          <div className="role-section">
            <p className="section-label">
              Select your role
            </p>

            <div className="role-buttons">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  className={`role-button ${
                    selectedRole === role.value
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedRole(role.value)
                  }
                  disabled={loading}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Logging in..."
                : `Login as ${
                    roles.find(
                      (role) =>
                        role.value === selectedRole
                    )?.label
                  }`}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Login;