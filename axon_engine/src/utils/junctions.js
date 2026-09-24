const { queryAll, remove, insertMany, quoteIdent, tableExists, findOne } = require('../db');

function normalizeIds(value) {
  if (value == null || value === '') return [];
  if (typeof value === 'string') {
    try {
      return normalizeIds(JSON.parse(value));
    } catch {
      return value.trim() === '' ? [] : [value];
    }
  }

  const ids = Array.isArray(value) ? value : [value];
  const seen = new Set();
  const unique = [];

  for (const id of ids) {
    if (id == null || id === '') continue;
    const key = String(id);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(id);
  }

  return unique;
}

function orderByIdList(items, ids) {
  const map = Object.fromEntries(items.map((item) => [String(item.id), item]));
  return ids.map((id) => map[String(id)]).filter(Boolean);
}

async function listChildIds(table, parentColumn, parentId, childColumn, executor = null) {
  const rows = await queryAll(
    `SELECT ${quoteIdent(childColumn)} AS child_id
     FROM ${quoteIdent(table)}
     WHERE ${quoteIdent(parentColumn)} = $1
     ORDER BY sort_order ASC, id ASC`,
    [parentId],
    executor
  );
  return rows.map((row) => row.child_id);
}

async function replaceJunction(
  table,
  parentColumn,
  parentId,
  childColumn,
  childIds,
  { organizationId = null, extras = null, match = {} } = {},
  executor = null
) {
  await remove(table, { [parentColumn]: parentId, ...match }, executor);

  const ids = normalizeIds(childIds);
  if (!ids.length) return [];

  const now = new Date();
  const rows = ids.map((childId, sortOrder) => ({
    [parentColumn]: parentId,
    [childColumn]: childId,
    sort_order: sortOrder,
    organization_id: organizationId,
    created_at: now,
    updated_at: now,
    ...(typeof extras === 'function' ? extras(childId, sortOrder) : extras || {}),
  }));

  return insertMany(table, rows, executor);
}

async function resolveMenuItemIdsFromBody(body) {
  const direct = normalizeIds(body?.menu_item_ids || body?.menu?.menu_item_ids);
  if (direct.length) return { ids: direct, provided: true };

  if (body?.menu_id && await tableExists('menus')) {
    const menu = await findOne('menus', { id: body.menu_id });
    if (menu) {
      return { ids: normalizeIds(menu.menu_item_ids), provided: true };
    }
  }

  return { ids: [], provided: false };
}

module.exports = {
  normalizeIds,
  orderByIdList,
  listChildIds,
  replaceJunction,
  resolveMenuItemIdsFromBody,
};
