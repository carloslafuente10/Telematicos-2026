import { getStatus } from '../../data/reportData.js';

export default function StatusBadge({ status }) {
  const current = getStatus(status);
  return <span className={`status-badge status-${current.tone}`}>{current.label}</span>;
}
