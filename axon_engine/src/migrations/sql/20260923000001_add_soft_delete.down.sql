DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name = 'deleted_at'
  LOOP
    EXECUTE format('DROP INDEX IF EXISTS %I', tbl || '_deleted_at_idx');
    EXECUTE format('ALTER TABLE %I DROP COLUMN IF EXISTS deleted_at', tbl);
  END LOOP;
END $$;
