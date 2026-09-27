import { asMiddleware, validationFailed } from './http';
import type { CreateFooterInput, UpdateFooterInput } from '../models/footer.model';

export function validateCreateFooterBody(body: CreateFooterInput): CreateFooterInput {
  if (!body?.title_en) {
    validationFailed({ title_en: ['The title_en field is required.'] });
  }
  return body;
}

export function validateUpdateFooterBody(body: UpdateFooterInput): UpdateFooterInput {
  return body || {};
}

export const validateCreateFooter = asMiddleware((req) => validateCreateFooterBody(req.body));
export const validateUpdateFooter = asMiddleware((req) => {
  req.body = validateUpdateFooterBody(req.body);
});
