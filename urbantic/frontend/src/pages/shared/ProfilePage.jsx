import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Icon from '../../components/ui/Icon.jsx';

export default function ProfilePage() {
  const { user, saveProfile } = useAuth();
  const [form, setForm] = useState({
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone || ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);

    try {
      await saveProfile(form);
      setMessage('Perfil actualizado correctamente.');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'No se pudo actualizar el perfil.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="surface-card page-card profile-page">
      <PageHeader eyebrow="Cuenta personal" title="Mi perfil" description="Mantén actualizada tu información de contacto." />
      <div className="profile-layout">
        <aside className="profile-summary">
          <span className="profile-avatar">{user.first_name?.[0]}{user.last_name?.[0]}</span>
          <h2>{user.first_name} {user.last_name}</h2>
          <span>{user.role_name || user.role}</span>
          <small>{user.email}</small>
        </aside>
        <form onSubmit={handleSubmit} className="form profile-form">
          <div className="form-row">
            <label>Nombre<input name="firstName" value={form.firstName} onChange={handleChange} required /></label>
            <label>Apellido<input name="lastName" value={form.lastName} onChange={handleChange} required /></label>
          </div>
          <label>Teléfono<input name="phone" value={form.phone} onChange={handleChange} placeholder="Ej. 71234567" /></label>
          <label>Correo<input value={user.email} disabled /></label>
          {message && <p className="form-success"><Icon name="check" size={16} /> {message}</p>}
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button className="button button-primary" type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
