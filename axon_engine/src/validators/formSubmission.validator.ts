import { asMiddleware } from './http';
import type { CreateFormSubmissionInput, UpdateFormSubmissionInput } from '../models/formSubmission.model';

function normalizeFormId(value: CreateFormSubmissionInput['form_id']) {
  if (value == null || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}

export function validateCreateFormSubmissionBody(body: CreateFormSubmissionInput): CreateFormSubmissionInput {
  const input = body || {};
  return {
    ...input,
    form_id: normalizeFormId(input.form_id),
  };
}

export function validateUpdateFormSubmissionBody(body: UpdateFormSubmissionInput): UpdateFormSubmissionInput {
  return body || {};
}

export const validateCreateFormSubmission = asMiddleware((req) => {
  req.body = validateCreateFormSubmissionBody(req.body);
});

export const validateUpdateFormSubmission = asMiddleware((req) => {
  req.body = validateUpdateFormSubmissionBody(req.body);
});
