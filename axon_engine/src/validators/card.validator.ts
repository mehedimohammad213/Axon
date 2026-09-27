import { asMiddleware } from './http';
import type { CreateCardInput, UpdateCardInput } from '../models/card.model';

export function validateCreateCardBody(body: CreateCardInput): CreateCardInput {
  return body || {};
}

export function validateUpdateCardBody(body: UpdateCardInput): UpdateCardInput {
  return body || {};
}

export const validateCreateCard = asMiddleware((req) => {
  req.body = validateCreateCardBody(req.body);
});

export const validateUpdateCard = asMiddleware((req) => {
  req.body = validateUpdateCardBody(req.body);
});
