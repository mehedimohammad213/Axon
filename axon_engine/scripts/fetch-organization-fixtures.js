#!/usr/bin/env node

const { fetchSourceDataFromApi, saveFixtures } = require('../src/utils/organizationSeeder');

const TARGETS = {
  sajida: require('../src/seeds/03_sajida').CONFIG,
  sandhani: require('../src/seeds/04_sandhani').CONFIG,
  carb: require('../src/seeds/05_carb').CONFIG,
  'al-muslim': require('../src/seeds/06_al_muslim').CONFIG,
  aygaz: require('../src/seeds/07_aygaz').CONFIG,
};

async function main() {
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
