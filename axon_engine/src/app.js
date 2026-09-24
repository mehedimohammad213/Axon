const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const withRequestDb = require('./middleware/requestDb');
const ensureOrganizationContext = require('./middleware/organization');
const checkPermissions = require('./middleware/permissions');
const { authenticate } = require('./middleware/auth');

const publicAuthRoutes = require('./routes/publicAuth');
const protectedAuthRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const publicRoutes = require('./routes/public');

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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'headless-engine-express' });
});

// Public auth (register, login) — bypass RLS so email lookup can see every org.
app.use('/api', withRequestDb({ bypass: true }), publicAuthRoutes);

// Public site API (site key auth) — must run before JWT-protected routes,
// otherwise authenticate() 401s every /api/* request that has no Bearer token.
app.use('/api', withRequestDb(), publicRoutes);

// Protected CMS API (JWT + org context + permissions)
const protectedStack = [withRequestDb({ bypass: true }), authenticate, ensureOrganizationContext, checkPermissions];
app.use('/api', ...protectedStack, protectedAuthRoutes);
app.use('/api', ...protectedStack, apiRoutes);

// Backward compatibility for legacy dynamic routes
app.use('/dynamic', (req, res) => {
  res.redirect(308, `/api/dynamic${req.url}`);
});

const AppError = require('./utils/AppError');

app.use((err, req, res, next) => {
  console.error(err);
  if (err instanceof AppError) {
    if (err.errors) {
      return res.status(err.statusCode).json({ message: err.message, ...err.errors });
    }
    return res.status(err.statusCode).json({ message: err.message });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(422).json({ message: 'File too large' });
  }
  if (err.code === '23505') {
    return res.status(422).json({ message: 'A record with this unique value already exists.' });
  }
  if (err.code === '42501' || err.code === '23514') {
    return res.status(403).json({ message: 'This change is not allowed for the current organization.' });
  }
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
