import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import DashboardCiudadano from './pages/citizen/DashboardCiudadano.jsx';
import DashboardAdmin from './pages/admin/DashboardAdmin.jsx';
import DashboardTecnico from './pages/technician/DashboardTecnico.jsx';
import ProfilePage from './pages/shared/ProfilePage.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import RoleRoute from './routes/RoleRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';

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
            </Route>
            <Route element={<RoleRoute roles={['ADMINISTRADOR']} />}>
              <Route path="/admin" element={<DashboardAdmin />} />
            </Route>
            <Route element={<RoleRoute roles={['TECNICO']} />}>
              <Route path="/tecnico" element={<DashboardTecnico />} />
            </Route>
            <Route path="/perfil" element={<ProfilePage />} />
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
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<ProtectedLayout />} />
      </Route>
      <Route path="/" element={<HomeRedirect />} />
    </Routes>
  );
}
