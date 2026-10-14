import { useMemo, useState } from 'react';
import { useReports } from '../../context/ReportsContext.jsx';
import ReportTable from '../../components/reports/ReportTable.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';

export default function TasksTecnico() {
  const { reports } = useReports();
  const [status, setStatus] = useState('ACTIVAS');

  const tasks = useMemo(() => reports.filter((report) => {
    if (status === 'ACTIVAS') return ['ASIGNADO', 'EN_PROCESO'].includes(report.status);
    if (status === 'FINALIZADAS') return ['RESUELTO', 'CERRADO'].includes(report.status);
    return true;
  }), [reports, status]);

  return (
    <section className="surface-card page-card">
      <PageHeader eyebrow="Trabajo de campo" title="Mis tareas" description="La bandeja está ordenada por prioridad. Inicia la atención y registra la evidencia de la solución." />
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
      <ReportTable reports={tasks} showPriority getViewPath={(report) => `/tecnico/tareas/${report.id}`} emptyMessage="No tienes tareas en esta categoría." />
    </section>
  );
}
