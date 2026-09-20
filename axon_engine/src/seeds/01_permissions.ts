import permissionsConfig from '../config/permissions';
import type { DbContext } from '../db';

export async function seed(db: DbContext): Promise<void> {
  const existing = await db.count('permissions');
  if (existing > 0) return;

  const rows = permissionsConfig.definitions.map((p) => ({
    ...p,
    status: true,
    created_at: new Date(),
    updated_at: new Date(),
  }));

  await db.insertMany('permissions', rows);
}
