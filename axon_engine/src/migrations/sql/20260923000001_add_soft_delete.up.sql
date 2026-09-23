DO $$
DECLARE
  tbl TEXT;
  excluded TEXT[] := ARRAY[
    'organizations',
    'users',
    'roles',
    'permissions',
    'role_permission',
    'schema_migrations'
  ];
BEGIN
  FOR tbl IN
    SELECT c.table_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.column_name = 'organization_id'
      AND c.table_name <> ALL (excluded)
      AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns x
        WHERE x.table_schema = 'public'
          AND x.table_name = c.table_name
          AND x.column_name = 'deleted_at'
      )
  LOOP
    EXECUTE format('ALTER TABLE %I ADD COLUMN deleted_at TIMESTAMPTZ', tbl);
    EXECUTE format(
      'CREATE INDEX %I ON %I (deleted_at) WHERE deleted_at IS NOT NULL',
      tbl || '_deleted_at_idx',
      tbl
    );
  END LOOP;
END $$;
