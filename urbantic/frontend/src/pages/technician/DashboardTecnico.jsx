import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useReports } from '../../context/ReportsContext.jsx';
import ReportTable from '../../components/reports/ReportTable.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Icon from '../../components/ui/Icon.jsx';

export default function DashboardTecnico() {
  const { user } = useAuth();
  const { reports } = useReports();
  const assignedReports = reports.filter((report) => report.assignedTo === user.id);

  return (
    <div className="page-stack">
      <section className="hero-card technician-hero">
        <div>
          <span className="eyebrow">Jornada de trabajo</span>
          <h1>Panel técnico</h1>
          <p>Hola, {user.first_name}. Estas son las tareas urbanas asignadas a tu equipo.</p>
        </div>
        <Link className="button button-primary" to="/tecnico/tareas">Ver mis tareas <Icon name="arrow" size={16} /></Link>
      </section>

      <section className="stats-grid stats-grid-3" aria-label="Resumen de tareas">
        <StatCard value={assignedReports.filter((report) => ['ASIGNADO', 'EN_PROCESO'].includes(report.status)).length} label="Asignadas" tone="blue" icon="tasks" />
        <StatCard value={assignedReports.filter((report) => report.status === 'EN_PROCESO').length} label="En proceso" tone="orange" icon="clock" />
        <StatCard value={assignedReports.filter((report) => ['RESUELTO', 'CERRADO'].includes(report.status)).length} label="Resueltas" tone="green" icon="check" />
      </section>

      <section className="surface-card">
        <PageHeader eyebrow="Asignaciones" title="Mis reportes asignados" />
        <ReportTable reports={assignedReports.slice(0, 5)} getViewPath={(report) => `/tecnico/tareas/${report.id}`} />
      </section>
    </div>
  );
}
