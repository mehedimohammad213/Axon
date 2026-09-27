import type { RequestHandler } from 'express';
import AppError from '../utils/AppError';

export function validationFailed(errors: Record<string, string[] | undefined>): never {
  throw new AppError(422, 'Validation failed', errors);
}

export function asMiddleware(validate: (req: any) => void): RequestHandler {
  return (req, _res, next) => {
    try {
      validate(req);
      next();
    } catch (error) {
      next(error);
    }
  };
}
