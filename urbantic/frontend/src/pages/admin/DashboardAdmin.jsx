import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useReports } from '../../context/ReportsContext.jsx';
import * as reportsApi from '../../api/reports.api.js';
import ReportTable from '../../components/reports/ReportTable.jsx';
import ReportCharts from '../../components/reports/ReportCharts.jsx';
import ReportsMap from '../../components/reports/ReportsMap.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Icon from '../../components/ui/Icon.jsx';

export default function DashboardAdmin() {
  const { user } = useAuth();
  const { reports } = useReports();
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState('');

  useEffect(() => {
    let active = true;
    reportsApi.getStats()
      .then((data) => { if (active) setStats(data); })
      .catch(() => { if (active) setStatsError('No se pudieron actualizar las estadísticas.'); });
    return () => { active = false; };
  }, [reports]);

  const summary = stats?.summary || {
    total: reports.length,
    inReview: reports.filter((report) => report.status === 'EN_REVISION').length,
    inProgress: reports.filter((report) => ['ASIGNADO', 'EN_PROCESO'].includes(report.status)).length,
    critical: reports.filter((report) => report.priority === 'CRITICA' && !['CERRADO', 'RECHAZADO'].includes(report.status)).length
  };

  return (
    <div className="page-stack">
      <section className="hero-card admin-hero">
        <div>
          <span className="eyebrow">Vista general · Sprint 3</span>
          <h1>Panel administrador</h1>
          <p>Bienvenido, {user.first_name}. Prioriza incidencias, distribuye la carga y analiza los puntos críticos de la ciudad.</p>
        </div>
        <div className="hero-date"><Icon name="clock" size={18} /> Actualizado ahora</div>
      </section>

      <section className="stats-grid stats-grid-4" aria-label="Indicadores del sistema">
        <StatCard value={summary.total} label="Total reportes" tone="blue" icon="reports" />
        <StatCard value={summary.inReview} label="En revisión" tone="yellow" icon="clock" />
        <StatCard value={summary.inProgress} label="En atención" tone="orange" icon="tasks" />
        <StatCard value={summary.critical} label="Prioridad crítica" tone="red" icon="alert" />
      </section>

      {stats && (
        <section className="surface-card analytics-section">
          <PageHeader eyebrow="Inteligencia operativa" title="Estadísticas de incidencias" description="Compara los estados y los tipos de problema para orientar la atención municipal." />
          <ReportCharts byStatus={stats.byStatus} byCategory={stats.byCategory} />
        </section>
      )}

      <section className="surface-card map-section">
        <PageHeader eyebrow="Cobertura territorial" title="Mapa de incidencias" description="Los puntos más grandes representan reportes con prioridad crítica." />
        {stats?.locations?.length ? <ReportsMap locations={stats.locations} /> : <div className="map-loading">Cargando ubicaciones...</div>}
        {statsError && <p className="form-error panel-error stats-error">{statsError}</p>}
      </section>

      <section className="surface-card">
        <PageHeader
          eyebrow="Prioridad operativa"
          title="Reportes que requieren atención"
          action={<Link className="text-link" to="/admin/reportes">Ver todos <Icon name="arrow" size={15} /></Link>}
        />
        <ReportTable reports={reports.filter((report) => !['CERRADO', 'RECHAZADO'].includes(report.status)).slice(0, 6)} showPriority getViewPath={(report) => `/admin/reportes/${report.id}`} />
      </section>
    </div>
  );
}
