#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { db, pool, type DbContext } from './index';

const SEEDS_DIR = path.join(__dirname, '../seeds');

type SeedModule = { seed?: (executor: DbContext) => Promise<void> };

async function runSeeds(specificFile: string | null = null): Promise<void> {
  const files = fs
    .readdirSync(SEEDS_DIR)
    .filter((file) => file.endsWith('.ts') && !file.endsWith('.d.ts'))
    .sort();

  for (const file of files) {
    if (specificFile && file !== specificFile && file !== `${specificFile}.ts`) {
      continue;
    }

    const mod = (await import(pathToFileURL(path.join(SEEDS_DIR, file)).href)) as SeedModule;
    if (typeof mod.seed !== 'function') continue;

    console.log(`Running seed: ${file}`);
    await mod.seed(db);
  }

  console.log('Seeds complete.');
}

async function main(): Promise<void> {
  const specificIndex = process.argv.indexOf('--specific');
  const specificFile = specificIndex >= 0 ? process.argv[specificIndex + 1] : null;

  try {
    await runSeeds(specificFile);
  } finally {
    await pool.end();
  }
}

const entry = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (entry === __filename || entry === __filename.replace(/\.ts$/, '.js')) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { runSeeds };
