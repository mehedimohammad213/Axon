const permissionsConfig = require('../config/permissions');

exports.seed = async function seed(db) {
  const existing = await db.count('permissions');
  if (existing > 0) return;

  const rows = permissionsConfig.definitions.map((p) => ({
    ...p,
    status: true,
    created_at: new Date(),
    updated_at: new Date(),
  }));

  await db.insertMany('permissions', rows);
};
