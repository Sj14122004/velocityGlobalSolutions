import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../public/pages/projectManager/CreateProject.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

type Developer = {
  id: number;
  name: string;
  email: string;
  role: "DEVELOPER";
  isActive: boolean;
};

type DevelopersResponse = {
  success: boolean;
  data: Developer[];
};

type ProjectResponse = {
  success: boolean;
  data: {
    id: number;
    name: string;
  };
};

const CreateProject = () => {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [developers, setDevelopers] =
    useState<Developer[]>([]);
  const [selectedDevelopers, setSelectedDevelopers] =
    useState<number[]>([]);
  const [loadingDevelopers, setLoadingDevelopers] =
    useState(true);
  const [creating, setCreating] =
    useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDevelopers = async () => {
      if (!accessToken) {
        logout();
        navigate("/", { replace: true });
        return;
      }

      if (user?.role !== "PROJECT_MANAGER") {
        navigate("/", { replace: true });
        return;
      }

      try {
        const response =
          await axios.get<DevelopersResponse>(
            `${API_URL}/api/developers`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              withCredentials: true,
            }
          );

        setDevelopers(
          response.data.data.filter(
            (developer) =>
              developer.isActive
          )
        );
      } catch (error) {
        console.error(
          "Developers error:",
          error
        );

        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401
        ) {
          logout();
          navigate("/", { replace: true });
          return;
        }

        setError(
          "Failed to load developers."
        );
      } finally {
        setLoadingDevelopers(false);
      }
    };

    fetchDevelopers();
  }, [
    accessToken,
    user,
    logout,
    navigate,
  ]);

  const handleDeveloperChange = (
    developerId: number
  ) => {
    setSelectedDevelopers((previous) => {
      if (previous.includes(developerId)) {
        return previous.filter(
          (id) => id !== developerId
        );
      }

      return [
        ...previous,
        developerId,
      ];
    });
  };

  const handleCreateProject = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!accessToken) {
      return;
    }

    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    if (selectedDevelopers.length === 0) {
      setError(
        "Select at least one developer."
      );
      return;
    }

    setCreating(true);
    setError("");

    try {
      const response =
        await axios.post<ProjectResponse>(
          `${API_URL}/api/projects`,
          {
            name: name.trim(),
            description:
              description.trim() || undefined,
            developerIds:
              selectedDevelopers,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        );

      navigate(
        `/pm/projects/${response.data.data.id}`
      );
    } catch (error) {
      console.error(
        "Create project error:",
        error
      );

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
            "Failed to create project."
        );
      } else {
        setError(
          "Failed to create project."
        );
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="pm-create-project">
      <main className="pm-create-project-content">
        <button
          type="button"
          className="pm-create-project-back"
          onClick={() =>
            navigate("/pm/projects")
          }
        >
          ← Back to Projects
        </button>

        <div className="pm-create-project-header">
          <div>
            <span>Create Project</span>
            <h1>New Project</h1>
            <p>
              Create a project and assign its
              developers.
            </p>
          </div>
        </div>

        <form
          className="pm-create-project-card"
          onSubmit={handleCreateProject}
        >
          {error && (
            <div className="pm-create-project-error">
              {error}
            </div>
          )}

          <div className="pm-create-project-field full">
            <label htmlFor="project-name">
              Project Name
            </label>

            <input
              id="project-name"
              type="text"
              placeholder="Enter project name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
            />
          </div>

          <div className="pm-create-project-field full">
            <label htmlFor="project-description">
              Description
            </label>

            <textarea
              id="project-description"
              placeholder="Enter project description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              rows={5}
            />
          </div>

          <div className="pm-create-project-field full">
            <div className="pm-developer-header">
              <div>
                <label>
                  Project Developers
                </label>
                <p>
                  Select the developers who will
                  work on this project.
                </p>
              </div>

              <span>
                {selectedDevelopers.length} selected
              </span>
            </div>

            {loadingDevelopers ? (
              <div className="pm-developers-loading">
                Loading developers...
              </div>
            ) : developers.length === 0 ? (
              <div className="pm-developers-empty">
                No active developers available.
              </div>
            ) : (
              <div className="pm-developers-list">
                {developers.map(
                  (developer) => {
                    const selected =
                      selectedDevelopers.includes(
                        developer.id
                      );

                    return (
                      <button
                        type="button"
                        className={`pm-developer-option ${
                          selected
                            ? "selected"
                            : ""
                        }`}
                        key={developer.id}
                        onClick={() =>
                          handleDeveloperChange(
                            developer.id
                          )
                        }
                      >
                        <span className="pm-developer-checkbox">
                          {selected ? "✓" : ""}
                        </span>

                        <span className="pm-developer-avatar">
                          {developer.name
                            .charAt(0)
                            .toUpperCase()}
                        </span>

                        <span className="pm-developer-info">
                          <strong>
                            {developer.name}
                          </strong>
                          <small>
                            {developer.email}
                          </small>
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </div>

          <div className="pm-create-project-actions">
            <button
              type="button"
              onClick={() =>
                navigate("/pm/projects")
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                creating ||
                loadingDevelopers
              }
            >
              {creating
                ? "Creating..."
                : "Create Project"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateProject;