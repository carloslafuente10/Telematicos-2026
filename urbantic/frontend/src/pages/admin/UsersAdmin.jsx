import { useEffect, useState } from 'react';
import * as usersApi from '../../api/users.api.js';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Icon from '../../components/ui/Icon.jsx';

export default function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'CIUDADANO', password: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    usersApi.list()
      .then(setUsers)
      .catch((apiError) => setError(apiError.response?.data?.message || 'No se pudieron cargar los usuarios.'))
      .finally(() => setLoading(false));
  }, []);

  async function toggleUser(user) {
    setError('');
    try {
      await usersApi.setStatus(user.id, !user.active);
      setUsers((current) => current.map((item) => item.id === user.id ? { ...item, active: !item.active } : item));
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'No se pudo actualizar el usuario.');
    }
  }

  async function addUser(event) {
    event.preventDefault();
    setError('');
    try {
      const user = await usersApi.create(form);
      setUsers((current) => [...current, user]);
      setForm({ name: '', email: '', role: 'CIUDADANO', password: '' });
      setShowForm(false);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'No se pudo crear el usuario.');
    }
  }

  return (
    <section className="surface-card page-card">
      <PageHeader
        eyebrow="Administración"
        title="Usuarios del sistema"
        description="Gestiona el acceso y el estado de ciudadanos, técnicos y administradores."
        action={<button className="button button-primary" type="button" onClick={() => setShowForm((value) => !value)}><Icon name="add" size={17} /> Nuevo usuario</button>}
      />

      {showForm && (
        <form className="inline-create-form" onSubmit={addUser}>
          <label>Nombre completo<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
          <label>Correo<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
          <label>Rol<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value="CIUDADANO">Ciudadano</option><option value="TECNICO">Técnico</option><option value="ADMINISTRADOR">Administrador</option></select></label>
          <label>Contraseña<input type="password" minLength="8" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></label>
          <button className="button button-dark" type="submit">Guardar</button>
        </form>
      )}

      {error && <p className="form-error table-message">{error}</p>}
      {loading && <div className="empty-state"><p>Cargando usuarios...</p></div>}

      {!loading && <div className="table-wrap">
        <table className="report-table users-table">
          <thead><tr><th>#</th><th>Nombre</th><th>Rol</th><th>Correo</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id}>
                <td data-label="#">{index + 1}</td>
                <td data-label="Nombre"><strong>{user.name}</strong></td>
                <td data-label="Rol">{user.role}</td>
                <td data-label="Correo">{user.email}</td>
                <td data-label="Estado"><span className={`status-badge ${user.active ? 'status-success' : 'status-danger'}`}>{user.active ? 'Activo' : 'Inactivo'}</span></td>
                <td className="table-action"><button className="button button-small button-light" type="button" onClick={() => toggleUser(user)}>{user.active ? 'Desactivar' : 'Activar'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
    </section>
  );
}
