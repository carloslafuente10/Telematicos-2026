const db = require('../config/database');

const publicFields = `
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.phone,
  u.is_active,
  u.created_at,
  u.updated_at,
  r.code AS role,
  r.name AS role_name
`;

async function findByEmail(email) {
  const result = await db.query(
    `
      SELECT ${publicFields}, u.password_hash
      FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE LOWER(u.email) = LOWER($1)
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] || null;
}

async function findById(id) {
  const result = await db.query(
    `
      SELECT ${publicFields}
      FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE u.id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

async function createCitizen({ email, passwordHash, firstName, lastName, phone }) {
  const result = await db.query(
    `
      INSERT INTO users (role_id, email, password_hash, first_name, last_name, phone)
      SELECT r.id, LOWER($1), $2, $3, $4, $5
      FROM roles r
      WHERE r.code = 'CIUDADANO'
      RETURNING id
    `,
    [email, passwordHash, firstName, lastName, phone || null]
  );

  return findById(result.rows[0].id);
}

async function updateProfile(id, fields) {
  const updates = [];
  const values = [id];

  if (Object.prototype.hasOwnProperty.call(fields, 'firstName')) {
    values.push(fields.firstName);
    updates.push(`first_name = $${values.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(fields, 'lastName')) {
    values.push(fields.lastName);
    updates.push(`last_name = $${values.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(fields, 'phone')) {
    values.push(fields.phone || null);
    updates.push(`phone = $${values.length}`);
  }

  if (updates.length === 0) {
    return findById(id);
  }

  const result = await db.query(
    `
      UPDATE users
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `,
    values
  );

  if (result.rowCount === 0) {
    return null;
  }

  return findById(id);
}

async function listAll() {
  const result = await db.query(
    `
      SELECT
        u.id,
        CONCAT(u.first_name, ' ', u.last_name) AS name,
        u.email,
        u.is_active AS active,
        r.code AS "roleCode",
        r.name AS role,
        u.created_at AS "createdAt"
      FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      ORDER BY u.created_at ASC, u.id ASC
    `
  );
  return result.rows;
}

async function listTechnicians() {
  const result = await db.query(
    `
      SELECT
        u.id,
        CONCAT(u.first_name, ' ', u.last_name) AS name,
        u.email,
        u.is_active AS active,
        COALESCE(u.phone, 'Servicios urbanos') AS specialty,
        COUNT(report.id) FILTER (WHERE report.status IN ('ASIGNADO', 'EN_PROCESO'))::INTEGER AS workload,
        COUNT(report.id) FILTER (WHERE report.status IN ('ASIGNADO', 'EN_PROCESO') AND report.priority = 'CRITICA')::INTEGER AS "criticalWorkload"
      FROM users u
      INNER JOIN roles role ON role.id = u.role_id
      LEFT JOIN reports report ON report.assigned_to = u.id
      WHERE role.code = 'TECNICO' AND u.is_active = TRUE
      GROUP BY u.id
      ORDER BY workload ASC, u.first_name, u.last_name
    `
  );
  return result.rows;
}

async function createManaged({ firstName, lastName, email, passwordHash, role }) {
  const result = await db.query(
    `
      INSERT INTO users (role_id, email, password_hash, first_name, last_name, is_active)
      SELECT r.id, LOWER($1), $2, $3, $4, TRUE
      FROM roles r
      WHERE r.code = $5
      RETURNING id
    `,
    [email, passwordHash, firstName, lastName, role]
  );
  return findById(result.rows[0].id);
}

async function setActive(id, active) {
  const result = await db.query(
    `UPDATE users SET is_active = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id`,
    [id, active]
  );
  return result.rows[0] ? findById(result.rows[0].id) : null;
}

async function getRoleByUserId(id) {
  const result = await db.query(
    `SELECT r.code AS role FROM users u INNER JOIN roles r ON r.id = u.role_id WHERE u.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function countActiveAdministrators() {
  const result = await db.query(
    `SELECT COUNT(*)::INTEGER AS count FROM users u INNER JOIN roles r ON r.id = u.role_id WHERE r.code = 'ADMINISTRADOR' AND u.is_active = TRUE`
  );
  return result.rows[0].count;
}

async function setRole(id, role) {
  const result = await db.query(
    `UPDATE users SET role_id = (SELECT id FROM roles WHERE code = $2), updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id`,
    [id, role]
  );
  return result.rows[0] ? findById(result.rows[0].id) : null;
}

module.exports = {
  findByEmail,
  findById,
  createCitizen,
  updateProfile,
  listAll,
  listTechnicians,
  createManaged,
  setActive,
  getRoleByUserId,
  countActiveAdministrators,
  setRole
};
