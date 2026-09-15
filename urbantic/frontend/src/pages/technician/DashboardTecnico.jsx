import { useAuth } from '../../context/AuthContext.jsx';

export default function DashboardTecnico() {
  const { user } = useAuth();

  return (
    <section className="dashboard">
      <h1>Panel tecnico</h1>
      <p>{user.first_name} {user.last_name}</p>
      <span>{user.role}</span>
    </section>
  );
}
