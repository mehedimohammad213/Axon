#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { pool, createDbContext } = require('./index');

const MIGRATIONS_DIR = path.join(__dirname, '../migrations/sql');
const MIGRATIONS_TABLE = 'schema_migrations';

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

function listMigrationFiles(direction) {
  const suffix = direction === 'up' ? '.up.sql' : '.down.sql';
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(suffix))
    .sort();
}

async function getAppliedMigrations() {
  const result = await pool.query(`SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY name ASC`);
  return result.rows.map((row) => row.name);
}

async function readSql(fileName) {
  return fs.readFileSync(path.join(MIGRATIONS_DIR, fileName), 'utf8');
}

async function bootstrapExistingDatabase() {
  const applied = await getAppliedMigrations();
  if (applied.length > 0) return;

  const result = await pool.query(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'organizations'
    ) AS exists
  `);

  if (!result.rows[0].exists) return;

  const files = listMigrationFiles('up');
  for (const file of files) {
    const name = file.replace('.up.sql', '');
    await pool.query(
      `INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
      [name]
    );
  }

  console.log('Bootstrapped schema_migrations from existing database.');
}

async function migrateLatest() {
  await ensureMigrationsTable();
  await bootstrapExistingDatabase();
  const applied = new Set(await getAppliedMigrations());
  const files = listMigrationFiles('up');

  for (const file of files) {
    const name = file.replace('.up.sql', '');
    if (applied.has(name)) continue;

    const sql = await readSql(file);
    console.log(`Applying migration: ${name}`);

    const client = await pool.connect();
    const db = createDbContext(client);
    try {
      await client.query('BEGIN');
      await db.query(sql);
      await db.query(`INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES ($1)`, [name]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  console.log('Migrations complete.');
}

async function migrateRollback() {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  if (!applied.length) {
    console.log('No migrations to roll back.');
    return;
  }

  const latest = applied[applied.length - 1];
  const downFile = `${latest}.down.sql`;
  const sql = await readSql(downFile);

  console.log(`Rolling back migration: ${latest}`);

  const client = await pool.connect();
  const db = createDbContext(client);
  try {
    await client.query('BEGIN');
    await db.query(sql);
    await db.query(`DELETE FROM ${MIGRATIONS_TABLE} WHERE name = $1`, [latest]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  console.log('Rollback complete.');
}

async function main() {
  const command = process.argv[2] || 'latest';

  try {
    if (command === 'latest') {
      await migrateLatest();
    } else if (command === 'rollback') {
      await migrateRollback();
    } else {
      throw new Error(`Unknown migration command: ${command}`);
    }
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { migrateLatest, migrateRollback };
