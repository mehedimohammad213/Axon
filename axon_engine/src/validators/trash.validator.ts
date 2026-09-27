import AppError from '../utils/AppError';
import { asMiddleware } from './http';

export function validateTrashParams(type?: string, id?: string) {
  if (!type || !id) {
    throw new AppError(422, 'type and id are required.');
  }
  return { type, id };
}

export const validateTrashAction = asMiddleware((req) => {
  validateTrashParams(req.params.type, req.params.id);
});
