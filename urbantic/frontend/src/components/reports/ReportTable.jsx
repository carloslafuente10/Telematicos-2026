import { Link } from 'react-router-dom';
import StatusBadge from '../ui/StatusBadge.jsx';
import Icon from '../ui/Icon.jsx';

export default function ReportTable({ reports, getViewPath, showZone = true, emptyMessage = 'No hay reportes para mostrar.' }) {
  if (!reports.length) {
    return <div className="empty-state"><Icon name="reports" size={32} /><p>{emptyMessage}</p></div>;
  }

  return (
    <div className="table-wrap">
      <table className="report-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Título</th>
            <th>Tipo</th>
            {showZone && <th>Zona</th>}
            <th>Estado</th>
            <th>Fecha</th>
            <th><span className="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td data-label="#">{report.id}</td>
              <td data-label="Título"><strong>{report.title}</strong></td>
              <td data-label="Tipo">{report.type}</td>
              {showZone && <td data-label="Zona">{report.zone}</td>}
              <td data-label="Estado"><StatusBadge status={report.status} /></td>
              <td data-label="Fecha">{report.date}</td>
              <td className="table-action">
                <Link className="button button-small button-light" to={getViewPath(report)}>
                  Ver <Icon name="arrow" size={14} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
