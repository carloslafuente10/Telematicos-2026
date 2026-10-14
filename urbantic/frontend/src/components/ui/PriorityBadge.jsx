import { getPriority } from '../../data/reportData.js';

export default function PriorityBadge({ priority }) {
  const current = getPriority(priority);
  return <span className={`priority-badge priority-${current.tone}`}>{current.label}</span>;
}
