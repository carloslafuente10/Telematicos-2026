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
        COALESCE(u.phone, 'Servicios urbanos') AS specialty
      FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE r.code = 'TECNICO' AND u.is_active = TRUE
      ORDER BY u.first_name, u.last_name
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

module.exports = {
  findByEmail,
  findById,
  createCitizen,
  updateProfile,
  listAll,
  listTechnicians,
  createManaged,
  setActive
};
