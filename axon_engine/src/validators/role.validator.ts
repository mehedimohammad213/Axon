import { asMiddleware } from './http';
import type { CreateRoleInput, UpdateRoleInput } from '../models/role.model';

export function validateCreateRoleBody(body: CreateRoleInput): CreateRoleInput {
  return {
    title: body?.title || null,
    description: body?.description || null,
    status: body?.status,
    permission_ids: body?.permission_ids,
  };
}

export function validateUpdateRoleBody(body: UpdateRoleInput): UpdateRoleInput {
  return body || {};
}

export const validateCreateRole = asMiddleware((req) => {
  req.body = validateCreateRoleBody(req.body);
});

export const validateUpdateRole = asMiddleware((req) => {
  req.body = validateUpdateRoleBody(req.body);
});
