const db = require('../config/database');

const reportFields = `
  LPAD(r.id::text, 4, '0') AS id,
  r.citizen_id AS "citizenId",
  r.assigned_to AS "assignedTo",
  r.category_id AS "categoryId",
  r.title,
  r.description,
  r.location,
  r.zone,
  r.latitude,
  r.longitude,
  r.image_data AS image,
  r.evidence_data AS evidence,
  r.resolution_images AS "evidenceImages",
  r.observations,
  r.priority,
  r.rejection_reason AS "rejectionReason",
  r.status,
  c.name AS type,
  c.code AS "categoryCode",
  TO_CHAR(r.created_at, 'DD/MM/YYYY') AS date,
  r.created_at AS "createdAt",
  r.updated_at AS "updatedAt",
  r.resolved_at AS "resolvedAt",
  r.closed_at AS "closedAt",
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

  if (filters.priority) {
    values.push(filters.priority);
    where.push(`r.priority = $${values.length}`);
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
      ORDER BY
        CASE r.priority WHEN 'CRITICA' THEN 1 WHEN 'ALTA' THEN 2 WHEN 'MEDIA' THEN 3 ELSE 4 END,
        r.created_at DESC,
        r.id DESC
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
            status = 'ASIGNADO',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND status IN ('CREADO', 'EN_REVISION', 'ASIGNADO')
        RETURNING status
      `,
      [reportId, technicianId]
    );
    if (!result.rows[0]) {
      await client.query('ROLLBACK');
      return { reason: 'state' };
    }

    await client.query(
      `INSERT INTO report_assignments (report_id, technician_id, assigned_by)
       VALUES ($1, $2, $3)`,
      [reportId, technicianId, changedBy]
    );

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

async function updateClassification(reportId, payload, changedBy) {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');
    const categoryResult = await client.query(
      'SELECT id, name FROM report_categories WHERE id = $1 AND is_active = TRUE LIMIT 1',
      [payload.categoryId]
    );
    if (!categoryResult.rows[0]) {
      await client.query('ROLLBACK');
      return { reason: 'category' };
    }

    const result = await client.query(
      `
        UPDATE reports
        SET category_id = $2,
            priority = $3,
            status = 'EN_REVISION',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND status IN ('CREADO', 'EN_REVISION')
        RETURNING id
      `,
      [reportId, payload.categoryId, payload.priority]
    );
    if (!result.rows[0]) {
      await client.query('ROLLBACK');
      return { reason: 'state' };
    }

    await client.query(
      `INSERT INTO report_status_history (report_id, status, changed_by, observation)
       VALUES ($1, 'EN_REVISION', $2, $3)`,
      [reportId, changedBy, `Clasificado como ${categoryResult.rows[0].name} con prioridad ${payload.priority}`]
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

    if (Object.prototype.hasOwnProperty.call(payload, 'evidenceImages')) {
      values.push(JSON.stringify(payload.evidenceImages || []));
      updates.push(`resolution_images = $${values.length}::jsonb`);
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'rejectionReason')) {
      values.push(payload.rejectionReason || null);
      updates.push(`rejection_reason = $${values.length}`);
    }

    updates.push(`closed_at = CASE WHEN $2::varchar IN ('CERRADO', 'RECHAZADO') THEN CURRENT_TIMESTAMP ELSE closed_at END`);

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

async function getStats() {
  const [summaryResult, statusResult, categoryResult, priorityResult, locationResult] = await Promise.all([
    db.query(`
      SELECT
        COUNT(*)::INTEGER AS total,
        COUNT(*) FILTER (WHERE status = 'EN_REVISION')::INTEGER AS "inReview",
        COUNT(*) FILTER (WHERE status IN ('ASIGNADO', 'EN_PROCESO'))::INTEGER AS "inProgress",
        COUNT(*) FILTER (WHERE status IN ('RESUELTO', 'CERRADO'))::INTEGER AS resolved,
        COUNT(*) FILTER (WHERE priority = 'CRITICA' AND status NOT IN ('CERRADO', 'RECHAZADO'))::INTEGER AS critical
      FROM reports
    `),
    db.query(`SELECT status AS key, COUNT(*)::INTEGER AS value FROM reports GROUP BY status ORDER BY status`),
    db.query(`
      SELECT c.name AS key, c.color, COUNT(r.id)::INTEGER AS value
      FROM report_categories c
      LEFT JOIN reports r ON r.category_id = c.id
      GROUP BY c.id
      ORDER BY value DESC, c.name
    `),
    db.query(`SELECT priority AS key, COUNT(*)::INTEGER AS value FROM reports GROUP BY priority ORDER BY
      CASE priority WHEN 'CRITICA' THEN 1 WHEN 'ALTA' THEN 2 WHEN 'MEDIA' THEN 3 ELSE 4 END`),
    db.query(`
      SELECT LPAD(r.id::text, 4, '0') AS id, r.title, r.latitude, r.longitude,
        r.status, r.priority, c.name AS type, c.color
      FROM reports r
      INNER JOIN report_categories c ON c.id = r.category_id
      WHERE r.latitude IS NOT NULL AND r.longitude IS NOT NULL
      ORDER BY r.created_at DESC
    `)
  ]);

  return {
    summary: summaryResult.rows[0],
    byStatus: statusResult.rows,
    byCategory: categoryResult.rows,
    byPriority: priorityResult.rows,
    locations: locationResult.rows
  };
}

module.exports = {
  list,
  findById,
  getHistory,
  create,
  assign,
  updateClassification,
  updateStatus,
  getStats
};
