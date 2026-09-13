import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../public/pages/admin/AdminProjects.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

type Project = {
  id: number;
  name: string;
  description: string | null;
  createdById: number;
  createdAt: string;
  updatedAt: string;
};

type ProjectsResponse = {
  success: boolean;
  data: Project[];
};

const AdminProjects = () => {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
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
        const response = await axios.get<ProjectsResponse>(
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
        console.error("Projects error:", error);

        if (axios.isAxiosError(error) && error.response?.status === 401) {
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
      <div className="projects-loading">
        <div className="loading-spinner"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="projects-error">
        <div className="projects-error-card">
          <h2>Unable to load projects</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-projects">
      <main className="projects-content">

        <section className="projects-card">
          <div className="projects-card-header">
            <div>
              <h2>All Projects</h2>
              <p>View and manage organization projects.</p>
            </div>
            <div className="projects-count">
              {filteredProjects.length} Projects
            </div>
          </div>

          <div className="projects-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="projects-table-wrapper">
            <table className="projects-table">
              <thead>
                <tr>
                  <th>PROJECT</th>
                  <th>DESCRIPTION</th>
                  <th>CREATED</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <div className="project-user">
                          <div className="project-avatar">
                            {project.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{project.name}</strong>
                            <span>Project #{project.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="project-description">
                          {project.description || "No description"}
                        </span>
                      </td>
                      <td>
                        {new Date(project.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          className="project-action"
                          title="View project"
                          onClick={() =>
                            navigate(`/admin/projects/${project.id}`)
                          }
                        >
                          →
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="empty-projects">
                      No projects found.
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

export default AdminProjects;