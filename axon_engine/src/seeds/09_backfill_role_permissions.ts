import { backfillDefaultRolePermissions } from '../utils/helpers';
import type { DbContext } from '../db';

export async function seed(db: DbContext): Promise<void> {
  const updated = await backfillDefaultRolePermissions(db);
  console.log(`Backfilled permissions for ${updated} role(s).`);
}
