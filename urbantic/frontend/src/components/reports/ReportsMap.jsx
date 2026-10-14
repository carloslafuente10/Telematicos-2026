import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function createPopup(location) {
  const wrapper = document.createElement('div');
  const title = document.createElement('strong');
  const detail = document.createElement('span');
  title.textContent = location.title;
  detail.textContent = `${location.type} · ${location.priority}`;
  wrapper.className = 'map-popup';
  wrapper.append(title, detail);
  return wrapper;
}

export default function ReportsMap({ locations = [] }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const validLocations = locations
      .map((location) => ({ ...location, latitude: Number(location.latitude), longitude: Number(location.longitude) }))
      .filter((location) => Number.isFinite(location.latitude) && Number.isFinite(location.longitude));

    const map = L.map(containerRef.current, { scrollWheelZoom: false, zoomControl: true })
      .setView([-17.3895, -66.1568], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const bounds = [];
    validLocations.forEach((location) => {
      const coordinates = [location.latitude, location.longitude];
      bounds.push(coordinates);
      L.circleMarker(coordinates, {
        radius: location.priority === 'CRITICA' ? 10 : 8,
        color: '#ffffff',
        weight: 2,
        fillColor: location.color || '#077ca8',
        fillOpacity: 0.92
      }).addTo(map).bindPopup(createPopup(location));
    });

    if (bounds.length > 1) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 14 });
    if (bounds.length === 1) map.setView(bounds[0], 15);
    window.setTimeout(() => map.invalidateSize(), 0);

    return () => map.remove();
  }, [locations]);

  return <div className="reports-map" ref={containerRef} aria-label="Mapa de incidencias urbanas" />;
}
