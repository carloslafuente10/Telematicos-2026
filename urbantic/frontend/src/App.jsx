import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import DashboardCiudadano from './pages/citizen/DashboardCiudadano.jsx';
import ReportsCiudadano from './pages/citizen/ReportsCiudadano.jsx';
import CreateReportPage from './pages/citizen/CreateReportPage.jsx';
import CitizenReportDetail from './pages/citizen/CitizenReportDetail.jsx';
import DashboardAdmin from './pages/admin/DashboardAdmin.jsx';
import ReportsAdmin from './pages/admin/ReportsAdmin.jsx';
import AdminReportDetail from './pages/admin/AdminReportDetail.jsx';
import UsersAdmin from './pages/admin/UsersAdmin.jsx';
import CategoriesAdmin from './pages/admin/CategoriesAdmin.jsx';
import DashboardTecnico from './pages/technician/DashboardTecnico.jsx';
import TasksTecnico from './pages/technician/TasksTecnico.jsx';
import TechnicianReportDetail from './pages/technician/TechnicianReportDetail.jsx';
import ProfilePage from './pages/shared/ProfilePage.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import RoleRoute from './routes/RoleRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname]);
  return null;
}

function ProtectedLayout() {
  return (
    <>
      <Navbar />
      <div className="app-layout">
        <Sidebar />
        <main className="content">
          <Routes>
            <Route element={<RoleRoute roles={['CIUDADANO']} />}>
              <Route path="/ciudadano" element={<DashboardCiudadano />} />
              <Route path="/ciudadano/reportes" element={<ReportsCiudadano />} />
              <Route path="/ciudadano/reportes/nuevo" element={<CreateReportPage />} />
              <Route path="/ciudadano/reportes/:id" element={<CitizenReportDetail />} />
            </Route>
            <Route element={<RoleRoute roles={['ADMINISTRADOR']} />}>
              <Route path="/admin" element={<DashboardAdmin />} />
              <Route path="/admin/reportes" element={<ReportsAdmin />} />
              <Route path="/admin/reportes/:id" element={<AdminReportDetail />} />
              <Route path="/admin/usuarios" element={<UsersAdmin />} />
              <Route path="/admin/categorias" element={<CategoriesAdmin />} />
            </Route>
            <Route element={<RoleRoute roles={['TECNICO']} />}>
              <Route path="/tecnico" element={<DashboardTecnico />} />
              <Route path="/tecnico/tareas" element={<TasksTecnico />} />
              <Route path="/tecnico/tareas/:id" element={<TechnicianReportDetail />} />
            </Route>
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="*" element={<HomeRedirect />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

function HomeRedirect() {
  const { isAuthenticated, user, loading, getDashboardPath } = useAuth();

  if (loading) {
    return <div className="screen-message">Cargando sesion...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPath(user.role)} replace />;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<ProtectedLayout />} />
        </Route>
        <Route path="/" element={<HomeRedirect />} />
      </Routes>
    </>
  );
}
