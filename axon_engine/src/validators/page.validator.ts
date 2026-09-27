import { asMiddleware, validationFailed } from './http';
import type { CreatePageInput, UpdatePageInput } from '../models/page.model';

export function validateCreatePageBody(body: CreatePageInput): CreatePageInput {
  if (!body?.page_name_en) {
    validationFailed({ page_name_en: ['The page_name_en field is required.'] });
  }
  return body;
}

export function validateUpdatePageBody(body: UpdatePageInput): UpdatePageInput {
  if (!body?.page_name_en) {
    validationFailed({ page_name_en: ['The page_name_en field is required.'] });
  }
  return body;
}

export const validateCreatePage = asMiddleware((req) => validateCreatePageBody(req.body));
export const validateUpdatePage = asMiddleware((req) => validateUpdatePageBody(req.body));
