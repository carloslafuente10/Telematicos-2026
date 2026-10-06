import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useReports } from '../../context/ReportsContext.jsx';
import ReportSummary from '../../components/reports/ReportSummary.jsx';
import Icon from '../../components/ui/Icon.jsx';

export default function TechnicianReportDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { getReport, updateReportStatus, loading } = useReports();
  const report = getReport(id);
  const [status, setStatus] = useState(report?.status || 'ASIGNADO');
  const [observations, setObservations] = useState(report?.observations || '');
  const [evidence, setEvidence] = useState(report?.evidence || null);
  const [evidenceName, setEvidenceName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!report) return;
    setStatus(report.status);
    setObservations(report.observations || '');
    setEvidence(report.evidence || null);
  }, [report?.id, report?.status, report?.observations, report?.evidence]);

  if (loading) return <div className="screen-message inline-screen">Cargando tarea...</div>;
  if (!report || report.assignedTo !== user.id) return <Navigate to="/tecnico/tareas" replace />;

  function handleEvidence(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage('La evidencia debe pesar menos de 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setEvidence(reader.result);
      setEvidenceName(file.name);
    };
    reader.readAsDataURL(file);
  }

  async function saveChanges(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      await updateReportStatus(report.id, { status, observations, evidence });
      setMessage('Cambios guardados correctamente.');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'No se pudieron guardar los cambios.');
    }
  }

  async function closeReport() {
    setMessage('');
    setError('');
    try {
      await updateReportStatus(report.id, { status: 'RESUELTO', observations, evidence });
      setStatus('RESUELTO');
      setMessage('El reporte fue marcado como resuelto.');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'No se pudo cerrar el reporte.');
    }
  }

  const isFinished = ['RESUELTO', 'CERRADO'].includes(report.status);

  return (
    <div className="page-stack">
      <Link className="back-link" to="/tecnico/tareas">← Volver a mis tareas</Link>
      <div className="technician-detail-grid">
        <section className="surface-card detail-card">
          <ReportSummary report={report} />
          {report.evidence && (
            <div className="resolution-evidence">
              <span className="eyebrow">Evidencia de resolución</span>
              <img src={report.evidence} alt="Evidencia de resolución" />
            </div>
          )}
        </section>

        <form className="surface-card update-panel" onSubmit={saveChanges}>
          <div className="panel-heading"><span className="panel-icon orange"><Icon name="tasks" /></span><div><span className="eyebrow">Atención técnica</span><h2>{isFinished ? 'Reporte resuelto' : 'Actualizar estado'}</h2></div></div>
          <label>Estado
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="ASIGNADO">Asignado</option>
              <option value="EN_PROCESO">En proceso</option>
              <option value="RESUELTO">Resuelto</option>
            </select>
          </label>
          <label>Observación
            <textarea value={observations} onChange={(event) => setObservations(event.target.value)} rows="5" placeholder="Describe el trabajo realizado o el avance..." required />
          </label>
          <span className="field-label">Evidencia de resolución</span>
          <label className={`upload-zone upload-zone-small ${evidence ? 'has-image' : ''}`}>
            {evidence ? <img src={evidence} alt="Vista previa de evidencia" /> : <Icon name="camera" size={34} />}
            <strong>{evidenceName || (evidence ? 'Evidencia cargada' : 'Agregar fotografía')}</strong>
            <small>PNG o JPG · máximo 5 MB</small>
            <input type="file" accept="image/png,image/jpeg" onChange={handleEvidence} />
          </label>
          {message && <p className="form-success"><Icon name="check" size={16} /> {message}</p>}
          {error && <p className="form-error">{error}</p>}
          <button className="button button-dark button-full" type="submit">Guardar cambios</button>
          {!isFinished && <button className="button button-success button-full" type="button" onClick={closeReport}><Icon name="check" size={17} /> Cerrar como resuelto</button>}
        </form>
      </div>
    </div>
  );
}
