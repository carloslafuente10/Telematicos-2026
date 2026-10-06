import { Link, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useReports } from '../../context/ReportsContext.jsx';
import ReportSummary from '../../components/reports/ReportSummary.jsx';
import ReportTimeline from '../../components/reports/ReportTimeline.jsx';
import Icon from '../../components/ui/Icon.jsx';

export default function CitizenReportDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { getReport, loading } = useReports();
  const report = getReport(id);

  if (loading) return <div className="screen-message inline-screen">Cargando reporte...</div>;
  if (!report || report.citizenId !== user.id) return <Navigate to="/ciudadano/reportes" replace />;

  return (
    <div className="page-stack">
      <Link className="back-link" to="/ciudadano/reportes">← Volver a mis reportes</Link>
      <section className="surface-card detail-card">
        <ReportSummary report={report} />
        <ReportTimeline status={report.status} date={report.date} />
        {report.observations && (
          <div className="observation-card"><Icon name="reports" /><div><strong>Última actualización</strong><p>{report.observations}</p></div></div>
        )}
      </section>
    </div>
  );
}
