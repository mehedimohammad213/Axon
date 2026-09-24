function toActive(value) {
  return value !== false && value !== 0 && value !== '0' && value !== 'false';
}

function takeActive(data, extraKeys = []) {
  if (!data || typeof data !== 'object') return undefined;
  if (data.is_active !== undefined) return toActive(data.is_active);
  if (data.status !== undefined) return toActive(data.status);
  for (const key of extraKeys) {
    if (data[key] !== undefined) return toActive(data[key]);
  }
  return undefined;
}

function exposeActive(row, { numeric = false, extra = null } = {}) {
  if (!row || row.is_active === undefined) return row;
  const active = row.is_active === true || row.is_active === 1;
  const result = {
    ...row,
    status: numeric ? (active ? 1 : 0) : active,
  };
  if (extra) result[extra] = numeric ? (active ? 1 : 0) : active;
  return result;
}

function mapActiveRows(rows, options) {
  if (!rows) return rows;
  if (Array.isArray(rows)) return rows.map((row) => exposeActive(row, options));
  if (rows.data) {
    return { ...rows, data: rows.data.map((row) => exposeActive(row, options)) };
  }
  return exposeActive(rows, options);
}

function stripActiveAliases(data, extraKeys = []) {
  const payload = { ...data };
  const active = takeActive(payload, extraKeys);
  delete payload.status;
  for (const key of extraKeys) delete payload[key];
  if (active !== undefined) payload.is_active = active;
  return payload;
}

module.exports = {
  toActive,
  takeActive,
  exposeActive,
  mapActiveRows,
  stripActiveAliases,
};
