import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUser";
import Layout from "./pages/components/Layout";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminActivity from "./pages/admin/AdminActivity";


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/dashboard" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="/admin/users" element={<Layout><AdminUsers /></Layout>} />
        <Route path="/admin/projects" element={<Layout><AdminProjects /></Layout>} />
        <Route path="/admin/tasks" element={<Layout><AdminTasks /></Layout>} />
        <Route path="/admin/activity" element={<Layout><AdminActivity /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;