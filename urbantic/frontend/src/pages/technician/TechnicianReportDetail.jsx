import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useReports } from '../../context/ReportsContext.jsx';
import ReportSummary from '../../components/reports/ReportSummary.jsx';
import Icon from '../../components/ui/Icon.jsx';

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function TechnicianReportDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { getReport, updateReportStatus, loading } = useReports();
  const report = getReport(id);
  const [observations, setObservations] = useState('');
  const [evidenceImages, setEvidenceImages] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!report) return;
    setObservations(report.observations || '');
    setEvidenceImages(report.evidenceImages?.length ? report.evidenceImages : (report.evidence ? [report.evidence] : []));
  }, [report?.id, report?.observations, report?.evidence, report?.evidenceImages]);

  if (loading) return <div className="screen-message inline-screen">Cargando tarea...</div>;
  if (!report || Number(report.assignedTo) !== Number(user.id)) return <Navigate to="/tecnico/tareas" replace />;

  async function handleEvidence(event) {
    const selectedFiles = Array.from(event.target.files || []);
    setError('');
    if (!selectedFiles.length) return;
    if (evidenceImages.length + selectedFiles.length > 5) {
      setError('Solo puedes adjuntar hasta 5 fotografías.');
      event.target.value = '';
      return;
    }
    if (selectedFiles.some((file) => !['image/png', 'image/jpeg'].includes(file.type))) {
      setError('Todas las evidencias deben ser imágenes PNG o JPG.');
      event.target.value = '';
      return;
    }
    if (selectedFiles.some((file) => file.size > 5 * 1024 * 1024)) {
      setError('Cada fotografía debe pesar menos de 5 MB.');
      event.target.value = '';
      return;
    }

    try {
      const images = await Promise.all(selectedFiles.map(readImage));
      setEvidenceImages((current) => [...current, ...images]);
    } catch {
      setError('No se pudieron leer las fotografías seleccionadas.');
    }
    event.target.value = '';
  }

  async function startWork() {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await updateReportStatus(report.id, { status: 'EN_PROCESO' });
      setMessage('Trabajo iniciado. El reporte ahora está en proceso.');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'No se pudo iniciar el trabajo.');
    } finally {
      setSaving(false);
    }
  }

  async function resolveReport(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await updateReportStatus(report.id, { status: 'RESUELTO', observations, evidenceImages });
      setMessage('Reporte marcado como resuelto y enviado para validación.');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'No se pudo resolver el reporte.');
    } finally {
      setSaving(false);
    }
  }

  const isFinished = ['RESUELTO', 'CERRADO'].includes(report.status);

  return (
    <div className="page-stack">
      <Link className="back-link" to="/tecnico/tareas">← Volver a mis tareas</Link>
      <div className="technician-detail-grid">
        <section className="surface-card detail-card">
          <ReportSummary report={report} />
          {report.observations && (
            <div className="observation-card"><Icon name="tasks" size={20} /><div><strong>Observación técnica</strong><p>{report.observations}</p></div></div>
          )}
          {isFinished && evidenceImages.length > 0 && (
            <div className="resolution-evidence">
              <span className="eyebrow">Evidencia de resolución</span>
              <div className="evidence-gallery">
                {evidenceImages.map((image, index) => <img src={image} alt={`Evidencia ${index + 1}`} key={`${report.id}-${index}`} />)}
              </div>
            </div>
          )}
        </section>

        {report.status === 'ASIGNADO' && (
          <section className="surface-card update-panel start-work-panel">
            <div className="panel-heading"><span className="panel-icon orange"><Icon name="tasks" /></span><div><span className="eyebrow">Nueva asignación</span><h2>Iniciar atención</h2></div></div>
            <p>Cuando estés listo para trabajar en esta incidencia, inicia la atención. El estado cambiará a “En proceso”.</p>
            {message && <p className="form-success"><Icon name="check" size={16} /> {message}</p>}
            {error && <p className="form-error">{error}</p>}
            <button className="button button-primary button-full" type="button" onClick={startWork} disabled={saving}><Icon name="tasks" size={17} /> {saving ? 'Iniciando...' : 'Iniciar trabajo'}</button>
          </section>
        )}

        {report.status === 'EN_PROCESO' && (
          <form className="surface-card update-panel" onSubmit={resolveReport}>
            <div className="panel-heading"><span className="panel-icon orange"><Icon name="check" /></span><div><span className="eyebrow">Trabajo en curso</span><h2>Registrar solución</h2></div></div>
            <label>Observación técnica
              <textarea value={observations} onChange={(event) => setObservations(event.target.value)} rows="5" minLength="10" placeholder="Describe el trabajo realizado y el resultado..." required />
            </label>
            <span className="field-label">Fotos de la solución ({evidenceImages.length}/5)</span>
            {evidenceImages.length > 0 && (
              <div className="evidence-preview-grid">
                {evidenceImages.map((image, index) => (
                  <div className="evidence-preview" key={`preview-${index}`}>
                    <img src={image} alt={`Vista previa ${index + 1}`} />
                    <button type="button" aria-label={`Quitar evidencia ${index + 1}`} onClick={() => setEvidenceImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Icon name="close" size={14} /></button>
                  </div>
                ))}
              </div>
            )}
            {evidenceImages.length < 5 && (
              <label className="upload-zone upload-zone-small multi-upload">
                <Icon name="camera" size={34} />
                <strong>Agregar fotografías</strong>
                <small>Hasta 5 archivos PNG o JPG · máximo 5 MB cada uno</small>
                <input type="file" multiple accept="image/png,image/jpeg" onChange={handleEvidence} />
              </label>
            )}
            {message && <p className="form-success"><Icon name="check" size={16} /> {message}</p>}
            {error && <p className="form-error">{error}</p>}
            <button className="button button-success button-full" type="submit" disabled={saving || observations.trim().length < 10 || evidenceImages.length === 0}><Icon name="check" size={17} /> {saving ? 'Guardando...' : 'Marcar como resuelto'}</button>
          </form>
        )}

        {isFinished && (
          <section className="surface-card update-panel finished-panel">
            <span className="panel-icon success-icon"><Icon name="check" /></span>
            <h2>{report.status === 'CERRADO' ? 'Reporte cerrado' : 'Solución enviada'}</h2>
            <p>{report.status === 'CERRADO' ? 'El administrador validó la solución y concluyó la atención.' : 'La solución está pendiente de validación administrativa.'}</p>
            {message && <p className="form-success"><Icon name="check" size={16} /> {message}</p>}
          </section>
        )}
      </div>
    </div>
  );
}
