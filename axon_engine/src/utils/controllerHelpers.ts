import type { Response } from 'express';
import { deleted } from './response';

function sendServiceResult(res: Response, result: unknown, statusCode = 200) {
  return res.status(statusCode).json(result);
}

function sendDeleted(res: Response, resourceName: string) {
  return deleted(res, resourceName);
}

export { sendServiceResult, sendDeleted };
