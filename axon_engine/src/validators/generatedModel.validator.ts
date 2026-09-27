import AppError from '../utils/AppError';
import { asMiddleware } from './http';
import type { GenerateModelInput, UpdateGeneratedModelInput } from '../models/generatedModel.model';

export function validateGenerateModelBody(body: GenerateModelInput): GenerateModelInput {
  if (!body?.modelSingular || !body?.modelPlural || !body?.fields?.length) {
    throw new AppError(422, 'modelSingular, modelPlural, and fields are required.');
  }
  return body;
}

export function validateUpdateGeneratedModelBody(body: UpdateGeneratedModelInput): UpdateGeneratedModelInput {
  return body || {};
}

export const validateGenerateModel = asMiddleware((req) => validateGenerateModelBody(req.body));
export const validateUpdateGeneratedModel = asMiddleware((req) => {
  req.body = validateUpdateGeneratedModelBody(req.body);
});
