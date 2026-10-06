const db = require('../config/database');

async function list(includeInactive = false) {
  const result = await db.query(
    `
      SELECT
        c.id,
        c.code,
        c.name,
        c.color,
        c.is_active AS active,
        COUNT(r.id)::INTEGER AS "reportCount"
      FROM report_categories c
      LEFT JOIN reports r ON r.category_id = c.id
      ${includeInactive ? '' : 'WHERE c.is_active = TRUE'}
      GROUP BY c.id
      ORDER BY c.name
    `
  );
  return result.rows;
}

module.exports = { list };
