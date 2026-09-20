import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';

import OrganizationContext from './context/organizationContext';
import ensureOrganizationContext from './middleware/organization';
import checkPermissions from './middleware/permissions';
import { authenticate } from './middleware/auth';

import publicAuthRoutes from './routes/publicAuth';
import protectedAuthRoutes from './routes/auth';
import apiRoutes from './routes/api';
import publicRoutes from './routes/public';

import AppError from './utils/AppError';

const app = express();

app.use(
  helmet({
    // Allow CMS (different origin/port) to display uploaded media in <img>/video tags
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploads', express.static(path.resolve('uploads')));

// Legacy Laravel public assets (media/, banners/, etc.)
const legacyPublicDir = path.resolve(__dirname, '../../headless-engine/public');
app.use('/media', express.static(path.join(legacyPublicDir, 'media')));
app.use('/banners', express.static(path.join(legacyPublicDir, 'banners')));
app.use(express.static(legacyPublicDir));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3600,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'headless-engine-express' });
});

function withOrgContext(_req: Request, _res: Response, next: NextFunction) {
  OrganizationContext.run(null, false, () => next());
}

// Public auth (register, login)
app.use('/api', withOrgContext, publicAuthRoutes);

// Public site API (site key auth) — must run before JWT-protected routes,
// otherwise authenticate() 401s every /api/* request that has no Bearer token.
app.use('/api', withOrgContext, publicRoutes);

// Protected CMS API (JWT + org context + permissions)
const protectedStack = [withOrgContext, authenticate, ensureOrganizationContext, checkPermissions];
app.use('/api', ...protectedStack, protectedAuthRoutes);
app.use('/api', ...protectedStack, apiRoutes);

// Backward compatibility for legacy dynamic routes
app.use('/dynamic', (req: Request, res: Response) => {
  res.redirect(308, `/api/dynamic${req.url}`);
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  if (err instanceof AppError) {
    if (err.errors) return res.status(err.statusCode).json(err.errors);
    return res.status(err.statusCode).json({ message: err.message });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(422).json({ message: 'File too large' });
  }
  res.status(500).json({ message: 'Internal server error' });
});

export default app;
