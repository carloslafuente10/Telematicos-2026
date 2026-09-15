import { useAuth } from '../../context/AuthContext.jsx';

export default function DashboardCiudadano() {
  const { user } = useAuth();

  return (
    <section className="dashboard">
      <h1>Panel ciudadano</h1>
      <p>{user.first_name} {user.last_name}</p>
      <span>{user.role}</span>
    </section>
  );
}
