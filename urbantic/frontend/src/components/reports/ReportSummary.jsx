import StatusBadge from '../ui/StatusBadge.jsx';
import PriorityBadge from '../ui/PriorityBadge.jsx';
import ReportVisual from './ReportVisual.jsx';

export default function ReportSummary({ report }) {
  return (
    <>
      <div className="detail-heading">
        <div>
          <span className="eyebrow">Reporte #{report.id}</span>
          <h1>{report.title}</h1>
        </div>
        <div className="detail-badges">
          <PriorityBadge priority={report.priority} />
          <StatusBadge status={report.status} />
        </div>
      </div>

      <div className="report-summary">
        <ReportVisual report={report} large />
        <dl className="detail-list">
          <div><dt>Tipo</dt><dd>{report.type}</dd></div>
          <div><dt>Ubicación</dt><dd>{report.location}</dd></div>
          <div><dt>Zona</dt><dd>{report.zone}</dd></div>
          <div><dt>Fecha</dt><dd>{report.date}</dd></div>
          {report.technicianName && <div><dt>Técnico</dt><dd>{report.technicianName}</dd></div>}
          <div className="detail-description"><dt>Descripción</dt><dd>{report.description}</dd></div>
          {report.rejectionReason && <div className="detail-description rejection-detail"><dt>Motivo de rechazo</dt><dd>{report.rejectionReason}</dd></div>}
        </dl>
      </div>
    </>
  );
}
