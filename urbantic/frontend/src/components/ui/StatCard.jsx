import Icon from './Icon.jsx';

export default function StatCard({ value, label, tone = 'blue', icon = 'reports' }) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <span className="stat-icon"><Icon name={icon} /></span>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </article>
  );
}
