import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../public/pages/components/Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-logo" onClick={() => navigate("/")}>
        <span>V</span>
        <div>
          <h2>Velozity</h2>
          <p>Global Solutions</p>
        </div>
      </div>
      <nav className="navbar-links">
        <button onClick={() => navigate(`/${user?.role === "ADMIN" ? "admin" : user?.role === "PROJECT_MANAGER" ? "pm" : "developer"}/dashboard`)}>
          Dashboard
        </button>
        {user?.role === "ADMIN" && (
          <button onClick={() => navigate("/admin/users")}>Users</button>
        )}
        <button onClick={() => navigate("/admin/projects")}>Projects</button>
        <button onClick={() => navigate("/admin/tasks")}>Tasks</button>
        <button onClick={() => navigate("/admin/activity")}>Activity</button>
      </nav>
      <div className="navbar-user">
        <div className="navbar-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
        <div className="navbar-user-info">
          <strong>{user?.name}</strong>
          <span>{user?.role?.replace("_", " ")}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
};

export default Navbar;