import Icon from '../ui/Icon.jsx';

const visualClass = {
  Bache: 'road',
  Luminaria: 'light',
  Basura: 'waste',
  Semáforo: 'traffic',
  Agua: 'water'
};

export default function ReportVisual({ report, large = false }) {
  if (report.image) {
    return <img className={`report-image ${large ? 'report-image-large' : ''}`} src={report.image} alt={`Evidencia de ${report.title}`} />;
  }

  return (
    <div className={`report-visual visual-${visualClass[report.type] || 'road'} ${large ? 'report-visual-large' : ''}`}>
      <span className="visual-glow" />
      <span className="visual-mark"><Icon name={report.type === 'Agua' ? 'pin' : 'alert'} size={large ? 38 : 24} /></span>
      <span>{report.type}</span>
    </div>
  );
}
