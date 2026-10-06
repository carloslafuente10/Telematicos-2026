import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Icon from '../ui/Icon.jsx';

const roleNames = {
  CIUDADANO: 'Ciudadano',
  ADMINISTRADOR: 'Administrador',
  TECNICO: 'Técnico'
};

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="navbar">
      <Link className="brand" to="/">
        <span className="brand-mark"><Icon name="building" size={27} /></span>
        <span>URBANTIC</span>
      </Link>

      {user && (
        <div className="nav-user">
          <span className="nav-identity">
            <strong>{roleNames[user.role] || user.role}</strong>
            <small>{user.first_name} {user.last_name}</small>
          </span>
          <button className="button button-small" type="button" onClick={signOut}>Salir</button>
        </div>
      )}
    </header>
  );
}
