import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useReports } from '../../context/ReportsContext.jsx';
import { REPORT_STATUSES } from '../../data/reportData.js';
import * as usersApi from '../../api/users.api.js';
import ReportSummary from '../../components/reports/ReportSummary.jsx';
import Icon from '../../components/ui/Icon.jsx';

export default function AdminReportDetail() {
  const { id } = useParams();
  const { getReport, assignReport, updateReportStatus, loading } = useReports();
  const report = getReport(id);
  const [technician, setTechnician] = useState(report?.assignedTo || '');
  const [status, setStatus] = useState(report?.status || 'EN_REVISION');
  const [technicians, setTechnicians] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    usersApi.listTechnicians()
      .then(setTechnicians)
      .catch(() => setError('No se pudieron cargar los técnicos.'));
  }, []);

  useEffect(() => {
    if (!report) return;
    setTechnician(report.assignedTo || '');
    setStatus(report.status);
  }, [report?.id, report?.assignedTo, report?.status]);

  if (loading) return <div className="screen-message inline-screen">Cargando reporte...</div>;
  if (!report) return <Navigate to="/admin/reportes" replace />;

  async function assignTechnician() {
    if (!technician) return;
    setError('');
    setMessage('');
    try {
      const updated = await assignReport(report.id, technician);
      setStatus(updated.status);
      setMessage(`Reporte asignado a ${updated.technicianName}.`);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'No se pudo asignar el técnico.');
    }
  }

  async function changeStatus() {
    setError('');
    setMessage('');
    try {
      await updateReportStatus(report.id, { status });
      setMessage('Estado actualizado correctamente.');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'No se pudo actualizar el estado.');
    }
  }

  return (
    <div className="page-stack">
      <Link className="back-link" to="/admin/reportes">← Volver a reportes</Link>
      <div className="admin-detail-grid">
        <section className="surface-card detail-card"><ReportSummary report={report} /></section>
        <aside className="action-panel">
          <section className="surface-card compact-card">
            <span className="panel-icon"><Icon name="user" /></span>
            <h2>Asignar técnico</h2>
            <p>Selecciona al responsable de atender esta incidencia.</p>
            <label>Técnico
              <select value={technician} onChange={(event) => setTechnician(event.target.value)}>
                <option value="">Seleccionar técnico</option>
                {technicians.map((item) => <option value={item.id} key={item.id}>{item.name} · {item.specialty}</option>)}
              </select>
            </label>
            <button className="button button-primary button-full" type="button" onClick={assignTechnician} disabled={!technician}>Asignar reporte</button>
          </section>

          <section className="surface-card compact-card">
            <span className="panel-icon orange"><Icon name="clock" /></span>
            <h2>Cambiar estado</h2>
            <label>Nuevo estado
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                {Object.entries(REPORT_STATUSES).map(([value, item]) => <option value={value} key={value}>{item.label}</option>)}
              </select>
            </label>
            <button className="button button-dark button-full" type="button" onClick={changeStatus}>Actualizar estado</button>
          </section>
          {message && <p className="toast-message"><Icon name="check" size={16} /> {message}</p>}
          {error && <p className="form-error panel-error">{error}</p>}
        </aside>
      </div>
    </div>
  );
}
