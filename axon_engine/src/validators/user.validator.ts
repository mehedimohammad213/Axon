import type { RequestHandler } from 'express';
import AppError from '../utils/AppError';
import {
  USER_UPDATE_FIELDS,
  type CreateUserInput,
  type UpdateUserInput,
} from '../models/user.model';

function validationFailed(errors: Record<string, string[] | undefined>): never {
  throw new AppError(422, 'Validation failed', errors);
}

function collectCreateErrors(body: CreateUserInput): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  if (!body?.name) errors.name = ['The name field is required.'];
  if (!body?.email) errors.email = ['The email field is required.'];
  if (!body?.password) errors.password = ['The password field is required.'];

  if (body?.password && body.password !== body.password_confirmation) {
    errors.password = ['The password confirmation does not match.'];
  }

  return errors;
}

export function validateCreateUserBody(body: CreateUserInput): CreateUserInput {
  const errors = collectCreateErrors(body);
  if (Object.keys(errors).length) validationFailed(errors);
  return body;
}

export function validateUpdateUserBody(body: UpdateUserInput): UpdateUserInput {
  const updates: UpdateUserInput = {};

  USER_UPDATE_FIELDS.forEach((field) => {
    if (body?.[field] !== undefined) {
      (updates as Record<string, unknown>)[field] = body[field];
    }
  });

  return updates;
}

function asMiddleware(validate: (req: Parameters<RequestHandler>[0]) => void): RequestHandler {
  return (req, _res, next) => {
    try {
      validate(req);
      next();
    } catch (error) {
      next(error);
    }
  };
}

export const validateCreateUser = asMiddleware((req) => {
  validateCreateUserBody(req.body);
});

export const validateUpdateUser = asMiddleware((req) => {
  req.body = validateUpdateUserBody(req.body);
});
