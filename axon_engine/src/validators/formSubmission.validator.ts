import { asMiddleware } from './http';
import type { CreateFormSubmissionInput, UpdateFormSubmissionInput } from '../models/formSubmission.model';

export function validateCreateFormSubmissionBody(body: CreateFormSubmissionInput): CreateFormSubmissionInput {
  return body || {};
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
