function validationError(res, errors) {
  return res.status(422).json(errors);
}

function notFound(res, message = 'Resource not found') {
  return res.status(404).json({ message });
}

function forbidden(res, message = 'Forbidden') {
  return res.status(403).json({ message });
}

function unauthorized(res, message = 'Unauthorized') {
  return res.status(401).json({ message });
}

function deleted(res, resource = 'Resource') {
  return res.json({ message: `${resource} deleted successfully`, status: true });
}

function parseJsonFields(row, fields = []) {
  if (!row) return row;
  const result = { ...row };
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      try {
        result[field] = JSON.parse(result[field]);
      } catch {
        // keep as-is
      }
    }
  }
  return result;
}

function parseJsonFieldsArray(rows, fields = []) {
  return rows.map((r) => parseJsonFields(r, fields));
}

module.exports = {
  validationError,
  notFound,
  forbidden,
  unauthorized,
  deleted,
  parseJsonFields,
  parseJsonFieldsArray,
};
