import AppError from '../utils/AppError';
import { asMiddleware, validationFailed } from './http';
import {
  ORGANIZATION_UPDATE_FIELDS,
  type CreateOrganizationInput,
  type CreateOrganizationRoleInput,
  type CreateOrganizationUserInput,
  type OrganizationUserInput,
  type UpdateOrganizationInput,
} from '../models/organization.model';

export function validateCreateOrganizationBody(body: CreateOrganizationInput) {
  if (!body?.name) {
    validationFailed({ name: ['The name field is required.'] });
  }

  const usersList: OrganizationUserInput[] = body.users || [
    {
      name: body.admin_name,
      email: body.admin_email,
      password: body.admin_password,
      role_title: body.admin_role_title || 'Admin',
    },
  ];

  if (!usersList.length || !usersList[0].email) {
    validationFailed({ users: ['At least one user is required.'] });
  }

  return {
    name: body.name,
    email: body.email,
    phone: body.phone,
    usersList,
  };
}

export function validateUpdateOrganizationBody(body: UpdateOrganizationInput): UpdateOrganizationInput {
  const updates: UpdateOrganizationInput = {};
  ORGANIZATION_UPDATE_FIELDS.forEach((field) => {
    if (body?.[field] !== undefined) {
      (updates as Record<string, unknown>)[field] = body[field];
    }
  });
  return updates;
}

export function validateCreateOrganizationRoleBody(body: CreateOrganizationRoleInput) {
  if (!body?.title) {
    validationFailed({ title: ['The title field is required.'] });
  }
  return {
    title: body.title,
    description: body.description,
    permission_ids: body.permission_ids,
    status: body.status,
  };
}

export function validateCreateOrganizationUserBody(body: CreateOrganizationUserInput) {
  if (!body?.name || !body?.email || !body?.password || !body?.role_title) {
    throw new AppError(422, 'name, email, password, and role_title are required.');
  }
  return body;
}

export const validateCreateOrganization = asMiddleware((req) => {
  req.body = { ...req.body, ...validateCreateOrganizationBody(req.body) };
});

export const validateUpdateOrganization = asMiddleware((req) => {
  req.body = validateUpdateOrganizationBody(req.body);
});

export const validateCreateOrganizationRole = asMiddleware((req) => {
  req.body = validateCreateOrganizationRoleBody(req.body);
});

export const validateCreateOrganizationUser = asMiddleware((req) => {
  validateCreateOrganizationUserBody(req.body);
});
