import OrganizationContext from '../context/organizationContext';
import { tableQuery } from './queryBuilder';
import type { QueryExecutor } from './index';

interface ScopedQueryOptions {
  scoped?: boolean;
  executor?: QueryExecutor | null;
}

function scopedQuery(tableName: string, options: ScopedQueryOptions = {}) {
  return tableQuery(tableName, { scoped: true, ...options });
}

function withOrganizationId<T extends Record<string, unknown>>(data: T): T & { organization_id?: number } {
  const orgId = OrganizationContext.get();
  if (orgId && !OrganizationContext.isBypassed()) {
    return { ...data, organization_id: orgId };
  }
  return data;
}

function isPlatformSuperAdmin(user: { is_super_admin?: boolean } | null | undefined): boolean {
  return user?.is_super_admin === true;
}

export { scopedQuery, withOrganizationId, isPlatformSuperAdmin };
