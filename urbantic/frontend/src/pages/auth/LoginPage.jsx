import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Icon from '../../components/ui/Icon.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, signIn, getDashboardPath } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const loggedUser = await signIn(form);
      navigate(getDashboardPath(loggedUser.role), { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'No se pudo iniciar sesion.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-backdrop" aria-hidden="true"><span /><span /><span /></div>
      <section className="auth-panel">
        <div className="auth-brand"><span className="brand-mark"><Icon name="building" size={30} /></span><span>URBANTIC</span></div>
        <h1>Ingresar a URBANTIC</h1>
        <p className="auth-intro">Reporta y acompaña las mejoras de tu ciudad.</p>
        <form onSubmit={handleSubmit} className="form">
          <label>
            Correo
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@correo.com" autoComplete="email" required />
          </label>
          <label>
            Contraseña
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" autoComplete="current-password" required />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="button button-primary button-full" type="submit" disabled={submitting}>
            {submitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <p className="auth-switch">
          ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
        </p>
      </section>
    </main>
  );
}
