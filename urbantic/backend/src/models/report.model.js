const db = require('../config/database');

const reportFields = `
  LPAD(r.id::text, 4, '0') AS id,
  r.citizen_id AS "citizenId",
  r.assigned_to AS "assignedTo",
  r.title,
  r.description,
  r.location,
  r.zone,
  r.latitude,
  r.longitude,
  r.image_data AS image,
  r.evidence_data AS evidence,
  r.observations,
  r.status,
  c.name AS type,
  c.code AS "categoryCode",
  TO_CHAR(r.created_at, 'DD/MM/YYYY') AS date,
  r.created_at AS "createdAt",
  r.updated_at AS "updatedAt",
  r.resolved_at AS "resolvedAt",
  CONCAT(citizen.first_name, ' ', citizen.last_name) AS "citizenName",
  CASE WHEN technician.id IS NULL THEN NULL
    ELSE CONCAT(technician.first_name, ' ', technician.last_name) END AS "technicianName"
`;

const reportJoins = `
  INNER JOIN report_categories c ON c.id = r.category_id
  INNER JOIN users citizen ON citizen.id = r.citizen_id
  LEFT JOIN users technician ON technician.id = r.assigned_to
`;

function addVisibility(where, values, actor) {
  if (actor.role === 'CIUDADANO') {
    values.push(actor.id);
    where.push(`r.citizen_id = $${values.length}`);
  }

  if (actor.role === 'TECNICO') {
    values.push(actor.id);
    where.push(`r.assigned_to = $${values.length}`);
  }
}

async function list(actor, filters = {}) {
  const where = [];
  const values = [];
  addVisibility(where, values, actor);

  if (filters.type) {
    values.push(filters.type);
    where.push(`LOWER(c.name) = LOWER($${values.length})`);
  }

  if (filters.status) {
    values.push(filters.status);
    where.push(`r.status = $${values.length}`);
  }

  if (filters.search) {
    values.push(`%${filters.search}%`);
    where.push(`(
      LPAD(r.id::text, 4, '0') ILIKE $${values.length}
      OR r.title ILIKE $${values.length}
      OR r.location ILIKE $${values.length}
      OR COALESCE(r.zone, '') ILIKE $${values.length}
    )`);
  }

  const result = await db.query(
    `
      SELECT ${reportFields}
      FROM reports r
      ${reportJoins}
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY r.created_at DESC, r.id DESC
    `,
    values
  );

  return result.rows;
}

async function findById(id, actor = null) {
  const values = [id];
  const where = ['r.id = $1'];
  if (actor) addVisibility(where, values, actor);

  const result = await db.query(
    `
      SELECT ${reportFields}
      FROM reports r
      ${reportJoins}
      WHERE ${where.join(' AND ')}
      LIMIT 1
    `,
    values
  );

  return result.rows[0] || null;
}

async function getHistory(reportId) {
  const result = await db.query(
    `
      SELECT
        h.id,
        h.status,
        h.observation,
        h.created_at AS "createdAt",
        CASE WHEN u.id IS NULL THEN NULL
          ELSE CONCAT(u.first_name, ' ', u.last_name) END AS "changedBy"
      FROM report_status_history h
      LEFT JOIN users u ON u.id = h.changed_by
      WHERE h.report_id = $1
      ORDER BY h.created_at ASC, h.id ASC
    `,
    [reportId]
  );
  return result.rows;
}

async function create(citizenId, payload) {
  const client = await db.pool.connect();
  let reportId;

  try {
    await client.query('BEGIN');
    const categoryResult = await client.query(
      'SELECT id FROM report_categories WHERE LOWER(name) = LOWER($1) AND is_active = TRUE LIMIT 1',
      [payload.type]
    );

    if (!categoryResult.rows[0]) {
      await client.query('ROLLBACK');
      return null;
    }

    const result = await client.query(
      `
        INSERT INTO reports (
          citizen_id, category_id, title, description, location, zone,
          latitude, longitude, image_data, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'EN_REVISION')
        RETURNING id
      `,
      [
        citizenId,
        categoryResult.rows[0].id,
        payload.title,
        payload.description,
        payload.location,
        payload.zone || null,
        payload.latitude || null,
        payload.longitude || null,
        payload.image || null
      ]
    );
    reportId = result.rows[0].id;

    await client.query(
      `INSERT INTO report_status_history (report_id, status, changed_by, observation)
       VALUES ($1, 'EN_REVISION', $2, 'Reporte creado por el ciudadano')`,
      [reportId, citizenId]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  return findById(reportId);
}

async function assign(reportId, technicianId, changedBy) {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');
    const technicianResult = await client.query(
      `
        SELECT u.id
        FROM users u
        INNER JOIN roles r ON r.id = u.role_id
        WHERE u.id = $1 AND r.code = 'TECNICO' AND u.is_active = TRUE
        LIMIT 1
      `,
      [technicianId]
    );
    if (!technicianResult.rows[0]) {
      await client.query('ROLLBACK');
      return { reason: 'technician' };
    }

    const result = await client.query(
      `
        UPDATE reports
        SET assigned_to = $2,
            status = CASE WHEN status IN ('CREADO', 'EN_REVISION') THEN 'ASIGNADO' ELSE status END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING status
      `,
      [reportId, technicianId]
    );
    if (!result.rows[0]) {
      await client.query('ROLLBACK');
      return { reason: 'report' };
    }

    await client.query(
      `INSERT INTO report_status_history (report_id, status, changed_by, observation)
       VALUES ($1, $2, $3, 'Técnico asignado al reporte')`,
      [reportId, result.rows[0].status, changedBy]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  return { report: await findById(reportId) };
}

async function updateStatus(reportId, actor, payload) {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');
    const values = [reportId, payload.status];
    const updates = [
      'status = $2::varchar',
      'updated_at = CURRENT_TIMESTAMP',
      `resolved_at = CASE WHEN $2::varchar IN ('RESUELTO', 'CERRADO') THEN COALESCE(resolved_at, CURRENT_TIMESTAMP) ELSE NULL END`
    ];

    if (Object.prototype.hasOwnProperty.call(payload, 'observations')) {
      values.push(payload.observations || null);
      updates.push(`observations = $${values.length}`);
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'evidence')) {
      values.push(payload.evidence || null);
      updates.push(`evidence_data = $${values.length}`);
    }

    let accessCondition = '';
    if (actor.role === 'TECNICO') {
      values.push(actor.id);
      accessCondition = `AND assigned_to = $${values.length}`;
    }

    const result = await client.query(
      `UPDATE reports SET ${updates.join(', ')} WHERE id = $1 ${accessCondition} RETURNING id`,
      values
    );
    if (!result.rows[0]) {
      await client.query('ROLLBACK');
      return null;
    }

    await client.query(
      `INSERT INTO report_status_history (report_id, status, changed_by, observation)
       VALUES ($1, $2, $3, $4)`,
      [reportId, payload.status, actor.id, payload.observations || 'Estado actualizado']
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  return findById(reportId);
}

module.exports = {
  list,
  findById,
  getHistory,
  create,
  assign,
  updateStatus
};
