import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useReports } from '../../context/ReportsContext.jsx';
import ReportTable from '../../components/reports/ReportTable.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Icon from '../../components/ui/Icon.jsx';

export default function DashboardAdmin() {
  const { user } = useAuth();
  const { reports } = useReports();

  return (
    <div className="page-stack">
      <section className="hero-card admin-hero">
        <div>
          <span className="eyebrow">Vista general</span>
          <h1>Panel administrador</h1>
          <p>Bienvenido, {user.first_name}. Revisa las incidencias y coordina su atención.</p>
        </div>
        <div className="hero-date"><Icon name="clock" size={18} /> Actualizado ahora</div>
      </section>

      <section className="stats-grid stats-grid-4" aria-label="Indicadores del sistema">
        <StatCard value={reports.length} label="Total reportes" tone="blue" icon="reports" />
        <StatCard value={reports.filter((report) => report.status === 'EN_REVISION').length} label="En revisión" tone="yellow" icon="clock" />
        <StatCard value={reports.filter((report) => ['ASIGNADO', 'EN_PROCESO'].includes(report.status)).length} label="En proceso" tone="orange" icon="tasks" />
        <StatCard value={reports.filter((report) => ['RESUELTO', 'CERRADO'].includes(report.status)).length} label="Resueltos" tone="green" icon="check" />
      </section>

      <section className="surface-card">
        <PageHeader
          eyebrow="Prioridad operativa"
          title="Reportes recientes"
          action={<Link className="text-link" to="/admin/reportes">Ver todos <Icon name="arrow" size={15} /></Link>}
        />
        <ReportTable reports={reports.slice(0, 5)} getViewPath={(report) => `/admin/reportes/${report.id}`} />
      </section>
    </div>
  );
}
