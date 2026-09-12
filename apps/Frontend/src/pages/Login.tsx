// Login Page
import { useState } from "react";
import "../public/pages/login.css";

type Role = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";

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

const Login = () => {
  const [selectedRole, setSelectedRole] =
    useState<Role>("ADMIN");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    console.log({
      role: selectedRole,
      email,
      password,
    });
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
              />
            </div>

            <button
              type="submit"
              className="login-button"
            >
              Login as{" "}
              {
                roles.find(
                  (role) =>
                    role.value === selectedRole
                )?.label
              }
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Login;