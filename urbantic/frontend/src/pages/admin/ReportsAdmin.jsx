import { useMemo, useState } from 'react';
import { useReports } from '../../context/ReportsContext.jsx';
import { REPORT_TYPES } from '../../data/reportData.js';
import ReportTable from '../../components/reports/ReportTable.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Icon from '../../components/ui/Icon.jsx';

export default function ReportsAdmin() {
  const { reports } = useReports();
  const [filters, setFilters] = useState({ type: 'TODOS', status: 'TODOS', search: '' });

  const filteredReports = useMemo(() => reports.filter((report) => {
    const term = filters.search.trim().toLowerCase();
    return (filters.type === 'TODOS' || report.type === filters.type)
      && (filters.status === 'TODOS' || report.status === filters.status)
      && (!term || `${report.id} ${report.title} ${report.location} ${report.zone}`.toLowerCase().includes(term));
  }), [filters, reports]);

  function setFilter(event) {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  return (
    <section className="surface-card page-card">
      <PageHeader eyebrow="Operaciones" title="Todos los reportes" description="Filtra, revisa y asigna las incidencias recibidas por la ciudadanía." />

      <div className="filter-bar admin-filters">
        <label>Tipo
          <select name="type" value={filters.type} onChange={setFilter}>
            <option value="TODOS">Todos</option>
            {REPORT_TYPES.map((type) => <option value={type.value} key={type.value}>{type.label}</option>)}
          </select>
        </label>
        <label>Estado
          <select name="status" value={filters.status} onChange={setFilter}>
            <option value="TODOS">Todos</option>
            <option value="EN_REVISION">En revisión</option>
            <option value="ASIGNADO">Asignado</option>
            <option value="EN_PROCESO">En proceso</option>
            <option value="RESUELTO">Resuelto</option>
            <option value="CERRADO">Cerrado</option>
          </select>
        </label>
        <label className="search-field">Buscar
          <span><Icon name="search" size={17} /><input name="search" value={filters.search} onChange={setFilter} placeholder="Código, título o zona..." /></span>
        </label>
        <span className="result-count">{filteredReports.length} reportes</span>
      </div>

      <ReportTable reports={filteredReports} getViewPath={(report) => `/admin/reportes/${report.id}`} />
    </section>
  );
}
