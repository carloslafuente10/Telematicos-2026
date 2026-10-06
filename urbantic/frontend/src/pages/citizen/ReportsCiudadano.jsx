import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useReports } from '../../context/ReportsContext.jsx';
import ReportTable from '../../components/reports/ReportTable.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Icon from '../../components/ui/Icon.jsx';

export default function ReportsCiudadano() {
  const { user } = useAuth();
  const { reports } = useReports();
  const [status, setStatus] = useState('TODOS');

  const ownReports = useMemo(() => reports.filter((report) => (
    report.citizenId === user.id && (status === 'TODOS' || report.status === status)
  )), [reports, status, user.id]);

  return (
    <section className="surface-card page-card">
      <PageHeader
        eyebrow="Participación ciudadana"
        title="Mis reportes"
        description="Consulta el estado y seguimiento de las incidencias que reportaste."
        action={(
          <Link className="button button-primary" to="/ciudadano/reportes/nuevo">
            <Icon name="add" size={17} /> Nuevo reporte
          </Link>
        )}
      />

      <div className="filter-bar simple-filter">
        <label>
          Estado
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="TODOS">Todos los estados</option>
            <option value="EN_REVISION">En revisión</option>
            <option value="ASIGNADO">Asignado</option>
            <option value="EN_PROCESO">En proceso</option>
            <option value="RESUELTO">Resuelto</option>
          </select>
        </label>
        <span className="result-count">{ownReports.length} resultado{ownReports.length === 1 ? '' : 's'}</span>
      </div>

      <ReportTable reports={ownReports} showZone={false} getViewPath={(report) => `/ciudadano/reportes/${report.id}`} />
    </section>
  );
}
