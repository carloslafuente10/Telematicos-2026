import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useReports } from '../../context/ReportsContext.jsx';
import ReportTable from '../../components/reports/ReportTable.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';

export default function TasksTecnico() {
  const { user } = useAuth();
  const { reports } = useReports();
  const [status, setStatus] = useState('ACTIVAS');

  const tasks = useMemo(() => reports.filter((report) => {
    if (report.assignedTo !== user.id) return false;
    if (status === 'ACTIVAS') return !['RESUELTO', 'CERRADO'].includes(report.status);
    if (status === 'FINALIZADAS') return ['RESUELTO', 'CERRADO'].includes(report.status);
    return true;
  }), [reports, status, user.id]);

  return (
    <section className="surface-card page-card">
      <PageHeader eyebrow="Trabajo de campo" title="Mis tareas" description="Actualiza el avance y registra la evidencia de las incidencias asignadas." />
      <div className="filter-bar simple-filter">
        <label>Mostrar
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="ACTIVAS">Tareas activas</option>
            <option value="FINALIZADAS">Tareas finalizadas</option>
            <option value="TODAS">Todas las tareas</option>
          </select>
        </label>
        <span className="result-count">{tasks.length} tarea{tasks.length === 1 ? '' : 's'}</span>
      </div>
      <ReportTable reports={tasks} getViewPath={(report) => `/tecnico/tareas/${report.id}`} emptyMessage="No tienes tareas en esta categoría." />
    </section>
  );
}
