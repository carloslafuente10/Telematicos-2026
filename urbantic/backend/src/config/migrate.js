const db = require('./database');

const sprint2Schema = `
  CREATE TABLE IF NOT EXISTS report_categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    name VARCHAR(80) NOT NULL UNIQUE,
    color VARCHAR(20) NOT NULL DEFAULT '#077ca8',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    citizen_id INTEGER NOT NULL REFERENCES users(id),
    category_id INTEGER NOT NULL REFERENCES report_categories(id),
    assigned_to INTEGER REFERENCES users(id),
    title VARCHAR(80) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    zone VARCHAR(100),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    image_data TEXT,
    evidence_data TEXT,
    observations TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'EN_REVISION'
      CHECK (status IN ('CREADO', 'EN_REVISION', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS report_status_history (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL
      CHECK (status IN ('CREADO', 'EN_REVISION', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO')),
    changed_by INTEGER REFERENCES users(id),
    observation TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS reports_citizen_id_index ON reports(citizen_id);
  CREATE INDEX IF NOT EXISTS reports_assigned_to_index ON reports(assigned_to);
  CREATE INDEX IF NOT EXISTS reports_category_id_index ON reports(category_id);
  CREATE INDEX IF NOT EXISTS reports_status_index ON reports(status);
  CREATE INDEX IF NOT EXISTS report_history_report_id_index ON report_status_history(report_id);

  INSERT INTO report_categories (code, name, color)
  VALUES
    ('BACHE', 'Bache', '#f59e0b'),
    ('LUMINARIA', 'Luminaria', '#8b5cf6'),
    ('BASURA', 'Basura', '#10b981'),
    ('SEMAFORO', 'Semáforo', '#ef4444'),
    ('AGUA', 'Agua', '#0ea5e9')
  ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name, color = EXCLUDED.color, updated_at = CURRENT_TIMESTAMP;

  INSERT INTO reports (id, citizen_id, category_id, title, description, location, zone, status, created_at)
  SELECT 12, u.id, c.id, 'Bache en avenida',
    'Se observa un bache grande que dificulta el tránsito de los vehículos.',
    'Av. América, Zona Norte', 'Zona Norte', 'EN_REVISION', TIMESTAMP '2026-09-12 09:00:00'
  FROM users u CROSS JOIN report_categories c
  WHERE LOWER(u.email) = 'ciudadano@urbantic.test' AND c.code = 'BACHE'
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO reports (id, citizen_id, category_id, assigned_to, title, description, location, zone, status, observations, created_at)
  SELECT 11, citizen.id, c.id, technician.id, 'Luminaria apagada',
    'La luminaria del poste 45 permanece apagada desde hace varios días.',
    'Av. Blanco Galindo', 'Centro', 'EN_PROCESO',
    'Se verificó el punto y se solicitó el repuesto.', TIMESTAMP '2026-09-10 10:30:00'
  FROM users citizen CROSS JOIN report_categories c CROSS JOIN users technician
  WHERE LOWER(citizen.email) = 'ciudadano@urbantic.test'
    AND LOWER(technician.email) = 'tecnico@urbantic.test' AND c.code = 'LUMINARIA'
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO reports (id, citizen_id, category_id, assigned_to, title, description, location, zone, status, created_at)
  SELECT 10, citizen.id, c.id, technician.id, 'Basura acumulada',
    'Hay residuos acumulados junto a la acera desde el fin de semana.',
    'Calle Los Pinos', 'Distrito 3', 'ASIGNADO', TIMESTAMP '2026-09-05 08:15:00'
  FROM users citizen CROSS JOIN report_categories c CROSS JOIN users technician
  WHERE LOWER(citizen.email) = 'ciudadano@urbantic.test'
    AND LOWER(technician.email) = 'tecnico@urbantic.test' AND c.code = 'BASURA'
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO reports (id, citizen_id, category_id, assigned_to, title, description, location, zone, status, observations, resolved_at, created_at)
  SELECT 9, citizen.id, c.id, technician.id, 'Semáforo dañado',
    'El semáforo de la intersección no enciende la luz verde.',
    'Av. Ayacucho', 'Centro', 'RESUELTO',
    'Semáforo reparado y en funcionamiento.', TIMESTAMP '2026-09-02 16:00:00', TIMESTAMP '2026-09-01 07:45:00'
  FROM users citizen CROSS JOIN report_categories c CROSS JOIN users technician
  WHERE LOWER(citizen.email) = 'ciudadano@urbantic.test'
    AND LOWER(technician.email) = 'tecnico@urbantic.test' AND c.code = 'SEMAFORO'
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO reports (id, citizen_id, category_id, assigned_to, title, description, location, zone, status, observations, created_at)
  SELECT 8, citizen.id, c.id, technician.id, 'Fuga de agua',
    'Fuga de agua en la tubería principal de la cuadra.',
    'Calle Aroma', 'Zona Sud', 'EN_PROCESO',
    'Se está realizando la reparación.', TIMESTAMP '2026-09-01 11:00:00'
  FROM users citizen CROSS JOIN report_categories c CROSS JOIN users technician
  WHERE LOWER(citizen.email) = 'ciudadano@urbantic.test'
    AND LOWER(technician.email) = 'tecnico@urbantic.test' AND c.code = 'AGUA'
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO reports (id, citizen_id, category_id, assigned_to, title, description, location, zone, status, created_at)
  SELECT 5, citizen.id, c.id, technician.id, 'Contenedor desbordado',
    'El contenedor necesita recolección urgente.',
    'Av. Heroínas', 'Centro', 'EN_PROCESO', TIMESTAMP '2026-08-15 13:20:00'
  FROM users citizen CROSS JOIN report_categories c CROSS JOIN users technician
  WHERE LOWER(citizen.email) = 'ciudadano@urbantic.test'
    AND LOWER(technician.email) = 'tecnico@urbantic.test' AND c.code = 'BASURA'
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO report_status_history (report_id, status, changed_by, observation, created_at)
  SELECT r.id, r.status, r.citizen_id, 'Estado inicial del reporte', r.created_at
  FROM reports r
  WHERE NOT EXISTS (
    SELECT 1 FROM report_status_history h WHERE h.report_id = r.id
  );

  SELECT setval(
    pg_get_serial_sequence('reports', 'id'),
    GREATEST(COALESCE((SELECT MAX(id) FROM reports), 1), 1),
    true
  );
`;

async function runMigrations() {
  await db.query(sprint2Schema);
  console.log('URBANTIC database migrations ready');
}

module.exports = runMigrations;
