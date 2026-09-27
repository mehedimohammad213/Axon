import { asMiddleware } from './http';
import type { CreateFormBuilderInput, UpdateFormBuilderInput } from '../models/formBuilder.model';

export function validateCreateFormBuilderBody(body: CreateFormBuilderInput): CreateFormBuilderInput {
  return body || {};
}

export function validateUpdateFormBuilderBody(body: UpdateFormBuilderInput): UpdateFormBuilderInput {
  return body || {};
}

export const validateCreateFormBuilder = asMiddleware((req) => {
  req.body = validateCreateFormBuilderBody(req.body);
});

export const validateUpdateFormBuilder = asMiddleware((req) => {
  req.body = validateUpdateFormBuilderBody(req.body);
});
