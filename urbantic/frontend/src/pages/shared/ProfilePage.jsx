import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

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
    <section className="profile">
      <h1>Mi perfil</h1>
      <form onSubmit={handleSubmit} className="form narrow">
        <label>
          Nombre
          <input name="firstName" value={form.firstName} onChange={handleChange} required />
        </label>
        <label>
          Apellido
          <input name="lastName" value={form.lastName} onChange={handleChange} required />
        </label>
        <label>
          Telefono
          <input name="phone" value={form.phone} onChange={handleChange} />
        </label>
        <label>
          Correo
          <input value={user.email} disabled />
        </label>
        <label>
          Rol
          <input value={user.role} disabled />
        </label>
        {message && <p className="form-success">{message}</p>}
        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </section>
  );
}
