import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useReports } from '../../context/ReportsContext.jsx';
import ReportTable from '../../components/reports/ReportTable.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Icon from '../../components/ui/Icon.jsx';

export default function DashboardCiudadano() {
  const { user } = useAuth();
  const { reports } = useReports();
  const ownReports = reports.filter((report) => report.citizenId === user.id);

  return (
    <div className="page-stack">
      <section className="hero-card citizen-hero">
        <div>
          <span className="eyebrow">Panel ciudadano</span>
          <h1>Hola, {user.first_name}</h1>
          <p>Ayúdanos a construir una ciudad mejor reportando los problemas de tu zona.</p>
        </div>
        <Link className="button button-primary" to="/ciudadano/reportes/nuevo">
          <Icon name="add" size={18} /> Nuevo reporte
        </Link>
      </section>

      <section className="stats-grid stats-grid-3" aria-label="Resumen de reportes">
        <StatCard value={ownReports.length} label="Mis reportes" tone="blue" icon="reports" />
        <StatCard value={ownReports.filter((report) => ['EN_REVISION', 'ASIGNADO', 'EN_PROCESO'].includes(report.status)).length} label="En seguimiento" tone="orange" icon="clock" />
        <StatCard value={ownReports.filter((report) => ['RESUELTO', 'CERRADO'].includes(report.status)).length} label="Resueltos" tone="green" icon="check" />
      </section>

      <section className="surface-card">
        <PageHeader
          eyebrow="Actividad"
          title="Reportes recientes"
          action={<Link className="text-link" to="/ciudadano/reportes">Ver todos <Icon name="arrow" size={15} /></Link>}
        />
        <ReportTable reports={ownReports.slice(0, 4)} showZone={false} getViewPath={(report) => `/ciudadano/reportes/${report.id}`} />
      </section>
    </div>
  );
}
