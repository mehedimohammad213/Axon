import jwt from 'jsonwebtoken';
import type { RequestHandler } from 'express';
import { loadUserWithRelations } from '../utils/helpers';

const authenticate: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as unknown as { sub: number };
    const user = await loadUserWithRelations(payload.sub);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const optionalAuthenticate: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as unknown as { sub: number };
    const user = await loadUserWithRelations(payload.sub);
    if (user) req.user = user;
  } catch {
    // public routes stay accessible
  }
  next();
};

export { authenticate, optionalAuthenticate };
