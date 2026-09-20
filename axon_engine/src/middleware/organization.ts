import type { RequestHandler } from 'express';
import OrganizationContext from '../context/organizationContext';

const ensureOrganizationContext: RequestHandler = (req, res, next) => {
  const user = req.user;
  const headerOrgId = req.headers['x-organization-id'];
  const parsedHeaderOrgId =
    headerOrgId && /^\d+$/.test(String(headerOrgId))
      ? parseInt(String(headerOrgId), 10)
      : null;

  const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  const path = req.path.replace(/^\/api\//, '');

  const allowsBypass = path === 'organizations' || path.startsWith('organizations/');

  if (user?.is_super_admin) {
    if (parsedHeaderOrgId !== null) {
      OrganizationContext.set(parsedHeaderOrgId);
    } else if (isMutating && !allowsBypass) {
      return res.status(403).json({
        message: 'Select an organization (X-Organization-Id) before creating or updating content.',
      });
    } else {
      OrganizationContext.bypass();
    }
  } else if (user?.organization_id) {
    if (parsedHeaderOrgId !== null && parsedHeaderOrgId !== user.organization_id) {
      return res.status(403).json({ message: 'You do not have access to this organization.' });
    }
    OrganizationContext.set(user.organization_id);
  } else if (parsedHeaderOrgId !== null) {
    OrganizationContext.set(parsedHeaderOrgId);
  }

  res.on('finish', () => OrganizationContext.clear());
  next();
};

export default ensureOrganizationContext;
