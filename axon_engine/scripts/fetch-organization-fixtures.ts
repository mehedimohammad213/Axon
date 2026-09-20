#!/usr/bin/env node

import { fetchSourceDataFromApi, saveFixtures } from '../src/utils/organizationSeeder';
import { CONFIG as sajidaConfig } from '../src/seeds/03_sajida';
import { CONFIG as sandhaniConfig } from '../src/seeds/04_sandhani';
import { CONFIG as carbConfig } from '../src/seeds/05_carb';
import { CONFIG as alMuslimConfig } from '../src/seeds/06_al_muslim';
import { CONFIG as aygazConfig } from '../src/seeds/07_aygaz';
import { CONFIG as ethertechConfig } from '../src/seeds/10_ethertech';

const TARGETS: Record<string, typeof sajidaConfig> = {
  sajida: sajidaConfig,
  sandhani: sandhaniConfig,
  carb: carbConfig,
  'al-muslim': alMuslimConfig,
  aygaz: aygazConfig,
  ethertech: ethertechConfig,
};

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const selected = args.length ? args : Object.keys(TARGETS);

  for (const key of selected) {
    const config = TARGETS[key];
    if (!config) {
      console.error(`Unknown organization: ${key}`);
      process.exitCode = 1;
      continue;
    }

    console.log(`\n=== ${key} ===`);
    const data = await fetchSourceDataFromApi(config);
    saveFixtures(config, data);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
