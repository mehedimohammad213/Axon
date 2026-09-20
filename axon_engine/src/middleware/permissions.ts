import type { RequestHandler } from 'express';
import permissionsConfig from '../config/permissions';
import { userHasPermission } from '../utils/helpers';

const PUBLIC_ROUTES = [
  'admin/login',
  'admin/register',
  'admin/password/forget',
  'admin/password/reset',
];

function matchesPattern(pattern: string, path: string): boolean {
  if (pattern === path) return true;
  if (!pattern.includes('*')) return false;
  const regex = new RegExp(`^${pattern.replace(/\*/g, '[^/]+')}$`);
  return regex.test(path);
}

function resolveRequiredPermission(method: string, path: string): string | null {
  const routeMap = permissionsConfig.route_map as Record<string, string>;
  const key = `${method.toUpperCase()}:${path}`;

  if (routeMap[key]) return routeMap[key];

  for (const [pattern, permission] of Object.entries(routeMap)) {
    const [routeMethod, routePath] = pattern.split(':');
    if (method.toUpperCase() === routeMethod && matchesPattern(routePath, path)) {
      return permission;
    }
  }

  return null;
}

const checkPermissions: RequestHandler = async (req, res, next) => {
  let path = req.path.replace(/^\//, '');
  if (path.startsWith('api/')) path = path.slice(4);

  if (PUBLIC_ROUTES.includes(path)) return next();

  const user = req.user;
  if (!user) return next();

  const required = resolveRequiredPermission(req.method, path);
  if (!required) return next();

  const has = await userHasPermission(user, required);
  if (!has) {
    return res.status(403).json({
      message: 'You do not have permission to perform this action.',
      required_permission: required,
    });
  }

  next();
};

export default checkPermissions;
