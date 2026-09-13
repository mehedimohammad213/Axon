const OrganizationContext = require('../context/organizationContext');
const { tableQuery } = require('./queryBuilder');

function scopedQuery(tableName, options = {}) {
  return tableQuery(tableName, { scoped: true, ...options });
}

function withOrganizationId(data) {
  const orgId = OrganizationContext.get();
  if (orgId && !OrganizationContext.isBypassed()) {
    return { ...data, organization_id: orgId };
  }
  return data;
}

function isPlatformSuperAdmin(user) {
  return user?.is_super_admin === true;
}

module.exports = { scopedQuery, withOrganizationId, isPlatformSuperAdmin };
