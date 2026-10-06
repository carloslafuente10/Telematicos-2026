import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useReports } from '../../context/ReportsContext.jsx';
import { REPORT_TYPES } from '../../data/reportData.js';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Icon from '../../components/ui/Icon.jsx';

export default function CreateReportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createReport } = useReports();
  const [form, setForm] = useState({ type: 'Bache', title: '', description: '', location: '', zone: '', latitude: null, longitude: null });
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState('');
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setLocationMessage('La imagen debe pesar menos de 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  }

  function locateMe() {
    setLocating(true);
    setLocationMessage('');
    if (!navigator.geolocation) {
      setLocationMessage('Tu navegador no permite obtener la ubicación.');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((current) => ({
          ...current,
          location: `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`,
          zone: 'Ubicación actual',
          latitude: coords.latitude,
          longitude: coords.longitude
        }));
        setLocationMessage('Ubicación obtenida correctamente.');
        setLocating(false);
      },
      () => {
        setLocationMessage('No se pudo acceder a tu ubicación. Puedes escribirla manualmente.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const report = await createReport({ ...form, image, citizenId: user.id });
      navigate(`/ciudadano/reportes/${report.id}`, { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'No se pudo crear el reporte.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="surface-card page-card">
      <PageHeader eyebrow="Nuevo reporte" title="Reporta un problema urbano" description="Completa la información para que el municipio pueda atender la incidencia." />

      <form className="report-form" onSubmit={handleSubmit}>
        <div className="form-column">
          <label>
            Tipo de problema
            <select name="type" value={form.type} onChange={handleChange}>
              {REPORT_TYPES.map((type) => <option value={type.value} key={type.value}>{type.label}</option>)}
            </select>
          </label>
          <label>
            Título
            <input name="title" value={form.title} onChange={handleChange} placeholder="Ej. Bache en la avenida" maxLength="80" required />
          </label>
          <label>
            Descripción
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe el problema y alguna referencia útil..." rows="5" required />
          </label>
          <label>
            Dirección o referencia
            <input name="location" value={form.location} onChange={handleChange} placeholder="Ej. Av. América, frente a la plaza" required />
          </label>
          <label>
            Zona
            <input name="zone" value={form.zone} onChange={handleChange} placeholder="Ej. Zona Norte" />
          </label>
          <button className="button button-outline locate-button" type="button" onClick={locateMe} disabled={locating}>
            <Icon name="pin" size={17} /> {locating ? 'Obteniendo ubicación...' : 'Usar mi ubicación'}
          </button>
          {locationMessage && <p className="form-helper">{locationMessage}</p>}
          <div className="mini-map" aria-label="Vista previa de ubicación">
            <div className="map-grid" />
            <span className="map-road road-one" />
            <span className="map-road road-two" />
            <span className="map-pin"><Icon name="pin" size={26} /></span>
            <small>{form.location || 'Selecciona una ubicación'}</small>
          </div>
        </div>

        <div className="upload-column">
          <span className="field-label">Fotografía</span>
          <label className={`upload-zone ${image ? 'has-image' : ''}`}>
            {image ? <img src={image} alt="Vista previa de la evidencia" /> : <Icon name="camera" size={40} />}
            <strong>{imageName || 'Arrastra una imagen o haz clic'}</strong>
            <small>PNG o JPG · máximo 5 MB</small>
            <input type="file" accept="image/png,image/jpeg" onChange={handleImage} />
          </label>
          <div className="tip-card">
            <Icon name="alert" size={20} />
            <div><strong>Consejo para una buena foto</strong><p>Procura mostrar el problema completo y una referencia del lugar.</p></div>
          </div>
        </div>

        <div className="form-actions full-width">
          {error && <p className="form-error action-error">{error}</p>}
          <button className="button button-ghost" type="button" onClick={() => navigate('/ciudadano/reportes')}>Cancelar</button>
          <button className="button button-primary" type="submit" disabled={submitting}>{submitting ? 'Enviando...' : 'Enviar reporte'} <Icon name="arrow" size={16} /></button>
        </div>
      </form>
    </section>
  );
}
