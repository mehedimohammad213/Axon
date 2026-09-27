import { asMiddleware } from './http';
import type { CreateTableInput, UpdateTableInput } from '../models/table.model';

export function validateCreateTableBody(body: CreateTableInput): CreateTableInput {
  return body || {};
}

export function validateUpdateTableBody(body: UpdateTableInput): UpdateTableInput {
  return body || {};
}

export const validateCreateTable = asMiddleware((req) => {
  req.body = validateCreateTableBody(req.body);
});

export const validateUpdateTable = asMiddleware((req) => {
  req.body = validateUpdateTableBody(req.body);
});
