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

function isBlockedTable(tableName: string): boolean {
  return BLOCKED_TABLES.has(tableName);
}

function isValidTableName(tableName: unknown): tableName is string {
  return typeof tableName === 'string' && TABLE_NAME_PATTERN.test(tableName);
}

export {
  BLOCKED_TABLES,
  TABLE_NAME_PATTERN,
  isBlockedTable,
  isValidTableName,
};
