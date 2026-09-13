#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { db, pool } = require('./index');

const SEEDS_DIR = path.join(__dirname, '../seeds');

async function runSeeds(specificFile = null) {
  const files = fs
    .readdirSync(SEEDS_DIR)
    .filter((file) => file.endsWith('.js'))
    .sort();

  for (const file of files) {
    if (specificFile && file !== specificFile && file !== `${specificFile}.js`) {
      continue;
    }

    const seed = require(path.join(SEEDS_DIR, file));
    if (typeof seed.seed !== 'function') continue;

    console.log(`Running seed: ${file}`);
    await seed.seed(db);
  }

  console.log('Seeds complete.');
}

async function main() {
  const specificIndex = process.argv.indexOf('--specific');
  const specificFile = specificIndex >= 0 ? process.argv[specificIndex + 1] : null;

  try {
    await runSeeds(specificFile);
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

module.exports = { runSeeds };
