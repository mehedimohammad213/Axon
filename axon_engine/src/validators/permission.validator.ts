import { asMiddleware } from './http';
import { PERMISSION_FIELDS, type CreatePermissionInput, type UpdatePermissionInput } from '../models/permission.model';

export function validateCreatePermissionBody(body: CreatePermissionInput): CreatePermissionInput {
  return {
    category: body?.category,
    title: body?.title,
    description: body?.description,
    slug: body?.slug,
    sl_no: body?.sl_no,
    status: body?.status,
  };
}

export function validateUpdatePermissionBody(body: UpdatePermissionInput): UpdatePermissionInput {
  const updates: UpdatePermissionInput = {};
  PERMISSION_FIELDS.forEach((field) => {
    if (body?.[field] !== undefined) {
      (updates as Record<string, unknown>)[field] = body[field];
    }
  });
  return updates;
}

export const validateCreatePermission = asMiddleware((req) => {
  req.body = validateCreatePermissionBody(req.body);
});

export const validateUpdatePermission = asMiddleware((req) => {
  req.body = validateUpdatePermissionBody(req.body);
});
