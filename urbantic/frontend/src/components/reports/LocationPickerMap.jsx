import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [-17.3895, -66.1568];
const SEARCH_ENDPOINT = 'https://nominatim.openstreetmap.org/search';

function hasCoordinates(latitude, longitude) {
  if (latitude === null || latitude === undefined || latitude === '' || longitude === null || longitude === undefined || longitude === '') {
    return false;
  }
  return Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));
}

function createMarker(map, markerRef, onLocationChangeRef, coordinates) {
  if (!markerRef.current) {
    const icon = L.divIcon({
      className: 'location-picker-marker',
      html: '<span aria-hidden="true"></span>',
      iconAnchor: [14, 36],
      iconSize: [28, 38]
    });

    markerRef.current = L.marker(coordinates, { draggable: true, icon }).addTo(map);
    markerRef.current.on('dragend', (event) => {
      const position = event.target.getLatLng();
      onLocationChangeRef.current?.({ latitude: position.lat, longitude: position.lng });
    });
  } else {
    markerRef.current.setLatLng(coordinates);
  }
}

export default function LocationPickerMap({ latitude, longitude, onLocationChange }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onLocationChangeRef = useRef(onLocationChange);
  const searchCacheRef = useRef(new Map());
  const lastSearchAtRef = useRef(0);
  const searchAbortRef = useRef(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;

    const hasInitialLocation = hasCoordinates(latitude, longitude);
    const initialCenter = hasInitialLocation
      ? [Number(latitude), Number(longitude)]
      : DEFAULT_CENTER;
    const map = L.map(containerRef.current, { scrollWheelZoom: false })
      .setView(initialCenter, hasInitialLocation ? 16 : 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    map.on('click', ({ latlng }) => {
      createMarker(map, markerRef, onLocationChangeRef, latlng);
      map.panTo(latlng);
      onLocationChangeRef.current?.({ latitude: latlng.lat, longitude: latlng.lng });
    });

    mapRef.current = map;
    const resizeTimer = window.setTimeout(() => map.invalidateSize(), 0);

    return () => {
      window.clearTimeout(resizeTimer);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !hasCoordinates(latitude, longitude)) return;
    const coordinates = [Number(latitude), Number(longitude)];
    createMarker(mapRef.current, markerRef, onLocationChangeRef, coordinates);
    mapRef.current.flyTo(coordinates, 16, { duration: 0.65 });
  }, [latitude, longitude]);

  useEffect(() => () => searchAbortRef.current?.abort(), []);

  async function searchLocation() {
    if (searching) return;
    const query = search.trim();
    if (query.length < 3) {
      setSearchError('Escribe al menos 3 caracteres para buscar.');
      setResults([]);
      return;
    }

    const cacheKey = query.toLocaleLowerCase('es');
    const cachedResults = searchCacheRef.current.get(cacheKey);
    if (cachedResults) {
      setResults(cachedResults);
      setSearchError(cachedResults.length ? '' : 'No encontramos esa ubicación.');
      return;
    }

    setSearching(true);
    setSearchError('');
    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;

    try {
      const elapsed = Date.now() - lastSearchAtRef.current;
      if (elapsed < 1000) await new Promise((resolve) => window.setTimeout(resolve, 1000 - elapsed));
      lastSearchAtRef.current = Date.now();

      const parameters = new URLSearchParams({
        format: 'jsonv2',
        q: query,
        limit: '5',
        countrycodes: 'bo',
        'accept-language': 'es'
      });
      const response = await fetch(`${SEARCH_ENDPOINT}?${parameters}`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data = await response.json();
      const nextResults = data
        .map((result) => ({
          id: result.place_id,
          name: result.display_name,
          latitude: Number(result.lat),
          longitude: Number(result.lon)
        }))
        .filter((result) => hasCoordinates(result.latitude, result.longitude));

      searchCacheRef.current.set(cacheKey, nextResults);
      setResults(nextResults);
      setSearchError(nextResults.length ? '' : 'No encontramos esa ubicación en Bolivia.');
    } catch (error) {
      if (error.name !== 'AbortError') {
        setSearchError('No se pudo realizar la búsqueda. Intenta nuevamente.');
        setResults([]);
      }
    } finally {
      if (searchAbortRef.current === controller) setSearching(false);
    }
  }

  function selectResult(result) {
    if (!mapRef.current) return;
    const coordinates = [result.latitude, result.longitude];
    createMarker(mapRef.current, markerRef, onLocationChangeRef, coordinates);
    mapRef.current.flyTo(coordinates, 17, { duration: 0.7 });
    onLocationChangeRef.current?.({
      latitude: result.latitude,
      longitude: result.longitude,
      address: result.name.slice(0, 255)
    });
    setSearch(result.name);
    setResults([]);
    setSearchError('');
  }

  return (
    <div className="location-picker">
      <div className="location-search-box">
        <label htmlFor="map-location-search">Buscar otra ubicación</label>
        <div className="location-search-controls">
          <input
            id="map-location-search"
            type="search"
            value={search}
            maxLength="120"
            placeholder="Ej. Plaza Colón, Cochabamba"
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                searchLocation();
              }
            }}
          />
          <button className="button button-outline" type="button" onClick={searchLocation} disabled={searching}>
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
        {searchError && <p className="location-search-message" role="alert">{searchError}</p>}
        {results.length > 0 && (
          <div className="location-search-results" role="listbox" aria-label="Resultados de ubicaciones">
            {results.map((result) => (
              <button
                className="location-search-result"
                type="button"
                role="option"
                key={result.id}
                onClick={() => selectResult(result)}
              >
                {result.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div
        className="mini-map location-picker-map"
        ref={containerRef}
        aria-label="Mapa para seleccionar la ubicación del reporte"
      />
      <small className="location-search-attribution">
        Búsqueda y mapa © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>
      </small>
    </div>
  );
}
