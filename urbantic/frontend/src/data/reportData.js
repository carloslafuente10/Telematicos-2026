export const REPORT_TYPES = [
  { value: 'Bache', label: 'Bache', color: '#f59e0b' },
  { value: 'Luminaria', label: 'Luminaria', color: '#8b5cf6' },
  { value: 'Basura', label: 'Basura', color: '#10b981' },
  { value: 'Semáforo', label: 'Semáforo', color: '#ef4444' },
  { value: 'Agua', label: 'Fuga de agua', color: '#0ea5e9' }
];

export const REPORT_STATUSES = {
  CREADO: { label: 'Creado', tone: 'neutral' },
  EN_REVISION: { label: 'En revisión', tone: 'warning' },
  ASIGNADO: { label: 'Asignado', tone: 'info' },
  EN_PROCESO: { label: 'En proceso', tone: 'orange' },
  RESUELTO: { label: 'Resuelto', tone: 'success' },
  CERRADO: { label: 'Cerrado', tone: 'neutral' }
};

export function getStatus(status) {
  return REPORT_STATUSES[status] || REPORT_STATUSES.CREADO;
}
