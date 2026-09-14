const { backfillDefaultRolePermissions } = require('../utils/helpers');

exports.seed = async function seed(db) {
  const updated = await backfillDefaultRolePermissions(db);
  console.log(`Backfilled permissions for ${updated} role(s).`);
};
