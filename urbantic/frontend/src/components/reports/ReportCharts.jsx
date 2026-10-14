import { getStatus } from '../../data/reportData.js';

const statusColors = {
  CREADO: '#8293a0',
  EN_REVISION: '#e0a125',
  ASIGNADO: '#3979c6',
  EN_PROCESO: '#e56f2d',
  RESUELTO: '#25a273',
  CERRADO: '#607583',
  RECHAZADO: '#c84b4b'
};

function BarChart({ title, data, type }) {
  const max = Math.max(...data.map((item) => Number(item.value)), 1);
  return (
    <section className="chart-card">
      <span className="eyebrow">Distribución</span>
      <h3>{title}</h3>
      <div className="bar-chart">
        {data.map((item) => {
          const value = Number(item.value);
          const label = type === 'status' ? getStatus(item.key).label : item.key;
          const color = type === 'status' ? statusColors[item.key] : item.color;
          return (
            <div className="bar-row" key={item.key}>
              <div className="bar-meta"><span>{label}</span><strong>{value}</strong></div>
              <span className="bar-track"><span style={{ width: `${(value / max) * 100}%`, background: color || '#077ca8' }} /></span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function ReportCharts({ byStatus = [], byCategory = [] }) {
  return (
    <div className="charts-grid">
      <BarChart title="Reportes por estado" data={byStatus} type="status" />
      <BarChart title="Reportes por categoría" data={byCategory} type="category" />
    </div>
  );
}
