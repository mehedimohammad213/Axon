import type { Response } from 'express';

function validationError(res: Response, errors: unknown) {
  return res.status(422).json(errors);
}

function notFound(res: Response, message = 'Resource not found') {
  return res.status(404).json({ message });
}

function forbidden(res: Response, message = 'Forbidden') {
  return res.status(403).json({ message });
}

function unauthorized(res: Response, message = 'Unauthorized') {
  return res.status(401).json({ message });
}

function deleted(res: Response, resource = 'Resource') {
  return res.json({ message: `${resource} deleted successfully`, status: true });
}

function parseJsonFields<T extends Record<string, unknown>>(
  row: T | null | undefined,
  fields: string[] = []
): T | null | undefined {
  if (!row) return row;
  const result = { ...row };
  for (const field of fields) {
    const value = result[field];
    if (value && typeof value === 'string') {
      try {
        (result as Record<string, unknown>)[field] = JSON.parse(value);
      } catch {
        // keep as-is
      }
    }
  }
  return result;
}

function parseJsonFieldsArray<T extends Record<string, unknown>>(
  rows: T[],
  fields: string[] = []
): T[] {
  return rows.map((r) => parseJsonFields(r, fields) as T);
}

export {
  validationError,
  notFound,
  forbidden,
  unauthorized,
  deleted,
  parseJsonFields,
  parseJsonFieldsArray,
};
