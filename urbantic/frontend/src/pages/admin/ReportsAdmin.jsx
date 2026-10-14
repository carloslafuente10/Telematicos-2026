import { useMemo, useState } from 'react';
import { useReports } from '../../context/ReportsContext.jsx';
import { REPORT_PRIORITIES, REPORT_STATUSES, REPORT_TYPES } from '../../data/reportData.js';
import ReportTable from '../../components/reports/ReportTable.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Icon from '../../components/ui/Icon.jsx';

export default function ReportsAdmin() {
  const { reports } = useReports();
  const [filters, setFilters] = useState({ type: 'TODOS', status: 'TODOS', priority: 'TODAS', search: '' });

  const filteredReports = useMemo(() => reports.filter((report) => {
    const term = filters.search.trim().toLowerCase();
    return (filters.type === 'TODOS' || report.type === filters.type)
      && (filters.status === 'TODOS' || report.status === filters.status)
      && (filters.priority === 'TODAS' || report.priority === filters.priority)
      && (!term || `${report.id} ${report.title} ${report.location} ${report.zone}`.toLowerCase().includes(term));
  }), [filters, reports]);

  function setFilter(event) {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  return (
    <section className="surface-card page-card">
      <PageHeader eyebrow="Operaciones" title="Todos los reportes" description="Filtra, prioriza y coordina las incidencias recibidas por la ciudadanía." />

      <div className="filter-bar admin-filters sprint3-filters">
        <label>Tipo
          <select name="type" value={filters.type} onChange={setFilter}>
            <option value="TODOS">Todos</option>
            {REPORT_TYPES.map((type) => <option value={type.value} key={type.value}>{type.label}</option>)}
          </select>
        </label>
        <label>Estado
          <select name="status" value={filters.status} onChange={setFilter}>
            <option value="TODOS">Todos</option>
            {Object.entries(REPORT_STATUSES).map(([value, item]) => <option value={value} key={value}>{item.label}</option>)}
          </select>
        </label>
        <label>Prioridad
          <select name="priority" value={filters.priority} onChange={setFilter}>
            <option value="TODAS">Todas</option>
            {Object.entries(REPORT_PRIORITIES).map(([value, item]) => <option value={value} key={value}>{item.label}</option>)}
          </select>
        </label>
        <label className="search-field">Buscar
          <span><Icon name="search" size={17} /><input name="search" value={filters.search} onChange={setFilter} placeholder="Código, título o zona..." /></span>
        </label>
        <span className="result-count">{filteredReports.length} reportes</span>
      </div>

      <ReportTable reports={filteredReports} showPriority getViewPath={(report) => `/admin/reportes/${report.id}`} />
    </section>
  );
}
