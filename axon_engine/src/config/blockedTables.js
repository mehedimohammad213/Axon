const BLOCKED_TABLES = new Set([
  'users',
  'roles',
  'permissions',
  'organizations',
  'generated_models',
  'role_permissions',
  'user_roles',
  'migrations',
  'knex_migrations',
  'knex_migrations_lock',
]);

const TABLE_NAME_PATTERN = /^[a-z][a-z0-9_]*$/;

function isBlockedTable(tableName) {
  return BLOCKED_TABLES.has(tableName);
}

function isValidTableName(tableName) {
  return typeof tableName === 'string' && TABLE_NAME_PATTERN.test(tableName);
}

module.exports = {
  BLOCKED_TABLES,
  TABLE_NAME_PATTERN,
  isBlockedTable,
  isValidTableName,
};
