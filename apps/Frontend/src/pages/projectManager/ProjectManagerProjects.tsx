import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../public/pages/projectManager/ProjectManagerProjects.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

type Project = {
  id: number;
  name: string;
  description: string | null;
  createdById: number | null;
  createdAt: string;
  updatedAt: string;
};

type ProjectsResponse = {
  success: boolean;
  data: Project[];
};

const ProjectManagerProjects = () => {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
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
          await axios.get<ProjectsResponse>(
            `${API_URL}/api/projects`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              withCredentials: true,
            }
          );

        setProjects(response.data.data);
      } catch (error) {
        console.error(
          "Project Manager projects error:",
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
              "Failed to load projects."
          );
        } else {
          setError("Failed to load projects.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [accessToken, user, logout, navigate]);

  const filteredProjects = useMemo(() => {
    const value = search.toLowerCase().trim();

    return projects.filter((project) => {
      return (
        !value ||
        project.name.toLowerCase().includes(value) ||
        project.description?.toLowerCase().includes(value)
      );
    });
  }, [projects, search]);

  if (loading) {
    return (
      <div className="pm-projects-loading">
        <div className="loading-spinner"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pm-projects-error">
        <div className="pm-projects-error-card">
          <h2>Unable to load projects</h2>
          <p>{error}</p>
          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pm-projects">
      <main className="pm-projects-content">
        <header className="pm-projects-header">
          <div>
            <h1>My Projects</h1>
            <p>
              View and manage the projects you own.
            </p>
          </div>

          <div className="pm-projects-header-actions">
            <div className="pm-projects-count">
              {filteredProjects.length} Projects
            </div>

            <button
              type="button"
              className="pm-create-project-button"
              onClick={() =>
                navigate("/pm/projects/create")
              }
            >
              + Create Project
            </button>
          </div>
        </header>

        <section className="pm-projects-card">
          <div className="pm-projects-toolbar">
            <div className="pm-projects-search">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>
          </div>

          <div className="pm-projects-grid">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <article
                  className="pm-project-card"
                  key={project.id}
                >
                  <div className="pm-project-card-top">
                    <div className="pm-project-avatar">
                      {project.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <span className="pm-project-id">
                      #{project.id}
                    </span>
                  </div>

                  <div className="pm-project-card-body">
                    <h2>{project.name}</h2>

                    <p>
                      {project.description ||
                        "No project description available."}
                    </p>
                  </div>

                  <div className="pm-project-card-footer">
                    <span>
                      Created{" "}
                      {new Date(
                        project.createdAt
                      ).toLocaleDateString()}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/pm/projects/${project.id}`
                        )
                      }
                    >
                      View Details →
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="pm-projects-empty">
                <div className="pm-empty-icon">▣</div>
                <h2>No projects found</h2>
                <p>
                  {search
                    ? "Try a different search term."
                    : "You do not have any projects yet."}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProjectManagerProjects;