import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Sidebar() {
  const { user, getDashboardPath } = useAuth();

  return (
    <aside className="sidebar">
      <NavLink to={getDashboardPath(user?.role)}>Inicio</NavLink>
      <NavLink to="/perfil">Perfil</NavLink>
    </aside>
  );
}
