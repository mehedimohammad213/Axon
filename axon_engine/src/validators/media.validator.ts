import { asMiddleware, validationFailed } from './http';
import type { UpdateMediaInput } from '../models/media.model';

export function validateUploadFiles(files: any[]) {
  if (!files?.length) {
    validationFailed({ file: ['At least one file is required.'] });
  }
  return files;
}

export function validateUpdateMediaBody(body: UpdateMediaInput): UpdateMediaInput {
  return body || {};
}

export const validateUpdateMedia = asMiddleware((req) => {
  req.body = validateUpdateMediaBody(req.body);
});
