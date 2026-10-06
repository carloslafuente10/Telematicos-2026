import Icon from '../ui/Icon.jsx';

const steps = [
  { status: 'CREADO', label: 'Creado' },
  { status: 'EN_REVISION', label: 'En revisión' },
  { status: 'ASIGNADO', label: 'Asignado' },
  { status: 'EN_PROCESO', label: 'En proceso' },
  { status: 'RESUELTO', label: 'Resuelto' },
  { status: 'CERRADO', label: 'Cerrado' }
];

export default function ReportTimeline({ status, date }) {
  const currentIndex = Math.max(steps.findIndex((step) => step.status === status), 0);

  return (
    <section className="tracking-section">
      <div className="section-heading compact"><div><span className="eyebrow">Progreso</span><h2>Seguimiento</h2></div></div>
      <div className="timeline">
        {steps.map((step, index) => (
          <div className={`timeline-step ${index <= currentIndex ? 'complete' : ''} ${index === currentIndex ? 'current' : ''}`} key={step.status}>
            <span className="timeline-dot">{index < currentIndex ? <Icon name="check" size={12} /> : index + 1}</span>
            <span className="timeline-label">{step.label}</span>
            {index === 0 && <small>{date}</small>}
          </div>
        ))}
      </div>
    </section>
  );
}
