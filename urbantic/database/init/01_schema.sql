CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  email VARCHAR(180) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(30),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique ON users (LOWER(email));
CREATE INDEX IF NOT EXISTS users_role_id_index ON users (role_id);

INSERT INTO roles (code, name)
VALUES
  ('ADMINISTRADOR', 'Administrador'),
  ('TECNICO', 'Tecnico'),
  ('CIUDADANO', 'Ciudadano')
ON CONFLICT (code) DO NOTHING;

INSERT INTO users (role_id, email, password_hash, first_name, last_name, phone, is_active)
SELECT r.id, 'administrador@urbantic.test', '$2b$10$Av2hvAl07GugAX.Z0OQeJe8JhttjL7JNMR63n5IO4MiXtRKFOoPqW', 'Administrador', 'Urbantic', '70000001', TRUE
FROM roles r
WHERE r.code = 'ADMINISTRADOR'
ON CONFLICT (LOWER(email)) DO NOTHING;

INSERT INTO users (role_id, email, password_hash, first_name, last_name, phone, is_active)
SELECT r.id, 'tecnico@urbantic.test', '$2b$10$Av2hvAl07GugAX.Z0OQeJe8JhttjL7JNMR63n5IO4MiXtRKFOoPqW', 'Tecnico', 'Urbantic', '70000002', TRUE
FROM roles r
WHERE r.code = 'TECNICO'
ON CONFLICT (LOWER(email)) DO NOTHING;

INSERT INTO users (role_id, email, password_hash, first_name, last_name, phone, is_active)
SELECT r.id, 'ciudadano@urbantic.test', '$2b$10$Av2hvAl07GugAX.Z0OQeJe8JhttjL7JNMR63n5IO4MiXtRKFOoPqW', 'Ciudadano', 'Urbantic', '70000003', TRUE
FROM roles r
WHERE r.code = 'CIUDADANO'
ON CONFLICT (LOWER(email)) DO NOTHING;
