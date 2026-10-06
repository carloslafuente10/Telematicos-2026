import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Icon from '../../components/ui/Icon.jsx';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, signUp, getDashboardPath } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: ''
  });
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
      const registeredUser = await signUp(form);
      navigate(getDashboardPath(registeredUser.role), { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'No se pudo registrar el usuario.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-backdrop" aria-hidden="true"><span /><span /><span /></div>
      <section className="auth-panel">
        <div className="auth-brand"><span className="brand-mark"><Icon name="building" size={30} /></span><span>URBANTIC</span></div>
        <h1>Crear cuenta</h1>
        <p className="auth-intro">Únete y ayuda a mejorar tu entorno urbano.</p>
        <form onSubmit={handleSubmit} className="form">
          <label>
            Nombre
            <input name="firstName" value={form.firstName} onChange={handleChange} required />
          </label>
          <label>
            Apellido
            <input name="lastName" value={form.lastName} onChange={handleChange} required />
          </label>
          <label>
            Teléfono
            <input name="phone" value={form.phone} onChange={handleChange} />
          </label>
          <label>
            Correo
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Contraseña
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Mínimo 8 caracteres" required />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="button button-primary button-full" type="submit" disabled={submitting}>
            {submitting ? 'Registrando...' : 'Registrarme'}
          </button>
        </form>
        <p className="auth-switch">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </section>
    </main>
  );
}
