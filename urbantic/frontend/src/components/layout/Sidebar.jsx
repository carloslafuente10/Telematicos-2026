import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Icon from '../ui/Icon.jsx';

const roleLinks = {
  CIUDADANO: [
    { to: '/ciudadano', label: 'Inicio', icon: 'home', end: true },
    { to: '/ciudadano/reportes', label: 'Mis reportes', icon: 'reports', end: true },
    { to: '/ciudadano/reportes/nuevo', label: 'Crear reporte', icon: 'add' }
  ],
  ADMINISTRADOR: [
    { to: '/admin', label: 'Inicio', icon: 'home', end: true },
    { to: '/admin/reportes', label: 'Reportes', icon: 'reports' },
    { to: '/admin/usuarios', label: 'Usuarios', icon: 'users' },
    { to: '/admin/categorias', label: 'Categorías', icon: 'categories' }
  ],
  TECNICO: [
    { to: '/tecnico', label: 'Inicio', icon: 'home', end: true },
    { to: '/tecnico/tareas', label: 'Mis tareas', icon: 'tasks' }
  ]
};

export default function Sidebar() {
  const { user } = useAuth();
  const links = roleLinks[user?.role] || [];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav" aria-label="Navegación principal">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end}>
            <Icon name={link.icon} size={19} />
            <span>{link.label}</span>
          </NavLink>
        ))}
        <NavLink to="/perfil">
          <Icon name="user" size={19} />
          <span>Perfil</span>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <span>URBANTIC</span>
        <small>Sprint 2 · 2026</small>
      </div>
    </aside>
  );
}
