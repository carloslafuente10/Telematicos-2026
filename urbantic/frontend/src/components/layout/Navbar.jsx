import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="navbar">
      <Link className="brand" to="/">
        URBANTIC
      </Link>

      {user && (
        <div className="nav-user">
          <span>{user.first_name} {user.last_name}</span>
          <button type="button" onClick={signOut}>Salir</button>
        </div>
      )}
    </header>
  );
}
