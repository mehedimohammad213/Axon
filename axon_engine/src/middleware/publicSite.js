const { db } = require('../db');
const OrganizationContext = require('../context/organizationContext');

async function identifyPublicSite(req, res, next) {
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
  req.isPublicSite = true;

  try {
    await OrganizationContext.applyRls();
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = identifyPublicSite;
