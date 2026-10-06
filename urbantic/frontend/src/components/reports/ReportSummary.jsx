import StatusBadge from '../ui/StatusBadge.jsx';
import ReportVisual from './ReportVisual.jsx';

export default function ReportSummary({ report }) {
  return (
    <>
      <div className="detail-heading">
        <div>
          <span className="eyebrow">Reporte #{report.id}</span>
          <h1>{report.title}</h1>
        </div>
        <StatusBadge status={report.status} />
      </div>

      <div className="report-summary">
        <ReportVisual report={report} large />
        <dl className="detail-list">
          <div><dt>Tipo</dt><dd>{report.type}</dd></div>
          <div><dt>Ubicación</dt><dd>{report.location}</dd></div>
          <div><dt>Zona</dt><dd>{report.zone}</dd></div>
          <div><dt>Fecha</dt><dd>{report.date}</dd></div>
          <div className="detail-description"><dt>Descripción</dt><dd>{report.description}</dd></div>
        </dl>
      </div>
    </>
  );
}
