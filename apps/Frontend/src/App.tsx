import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUser";
import Layout from "./pages/components/Layout";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminActivity from "./pages/admin/AdminActivity";
import AdminCreateUser from "./pages/admin/AdminCreateUser";
import AdminUserDetails from "./pages/admin/AdminUserDetails";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminProjectDetails from "./pages/admin/AdminProjectsDetails";
import AdminTaskDetails from "./pages/admin/AdminTaskDetails";
import ProjectManagerDashboard from "./pages/projectManager/ProjectManagerDashboard";
import ProjectManagerTasks from "./pages/projectManager/ProjectManagerTasks";
import ProjectManagerProjects from "./pages/projectManager/ProjectManagerProjects";
import ProjectManagerProjectDetails from "./pages/projectManager/ProjectManagerProjectDetails";
import ProjectManagerActivity from "./pages/projectManager/ProjectManagerActivity";
import CreateProject from "./pages/projectManager/CreateProject";
import DeveloperDashboard from "./pages/developer/DeveloperDashboard";
import DeveloperTasks from "./pages/developer/DeveloperTask";
import DeveloperActivity from "./pages/developer/DeveloperActivity";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/admin/dashboard" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="/admin/users" element={<Layout><AdminUsers /></Layout>} />
        <Route path="/admin/users/create" element={<Layout><AdminCreateUser /></Layout>} />
        <Route path="/admin/users/:role/:id" element={<Layout><AdminUserDetails /></Layout>} />
        <Route path="/admin/profile" element={<Layout><AdminProfile /></Layout>} />
        <Route path="/admin/projects" element={<Layout><AdminProjects /></Layout>} />
        <Route path="/admin/projects/:id" element={<Layout><AdminProjectDetails /></Layout>} />
        <Route path="/admin/tasks" element={<Layout><AdminTasks /></Layout>} />
        <Route path="/admin/tasks/:id" element={<Layout><AdminTaskDetails /></Layout>} />
        <Route path="/admin/activity" element={<Layout><AdminActivity /></Layout>} />

        <Route path="/pm/dashboard" element={<Layout><ProjectManagerDashboard /></Layout>} />
        <Route path="/pm/projects" element={<Layout><ProjectManagerProjects /></Layout>} />
        <Route path="/pm/projects/create" element={<Layout><CreateProject /></Layout>} />
        <Route path="/pm/projects/:id" element={<Layout><ProjectManagerProjectDetails /></Layout>} />
        <Route path="/pm/tasks" element={<Layout><ProjectManagerTasks /></Layout>} />
        <Route path="/pm/activity" element={<Layout><ProjectManagerActivity /></Layout>} />

        <Route path="/developer/dashboard" element={<Layout><DeveloperDashboard /></Layout>} />
        <Route path="/developer/tasks" element={<Layout><DeveloperTasks /></Layout>} />
        <Route path="/developer/activity" element={<Layout><DeveloperActivity /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;