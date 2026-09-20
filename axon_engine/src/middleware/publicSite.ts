import type { RequestHandler } from 'express';
import { db } from '../db';
import OrganizationContext from '../context/organizationContext';

const identifyPublicSite: RequestHandler = async (req, res, next) => {
  const siteKey = req.headers['x-headless-site-key'];

  if (!siteKey) {
    return res.status(401).json({ message: 'X-Headless-Site-Key header is required.' });
  }

  const org = await db.findOne('organizations', { site_key: siteKey, is_active: true });

  if (!org) {
    return res.status(401).json({ message: 'Invalid or inactive site key.' });
  }

  OrganizationContext.set(org.id);
  req.organization = org;
  (req as any).isPublicSite = true;

  res.on('finish', () => OrganizationContext.clear());
  next();
};

export default identifyPublicSite;
