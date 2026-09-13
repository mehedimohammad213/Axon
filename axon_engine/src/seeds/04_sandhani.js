const { runOrganizationSeeder } = require('../utils/organizationSeeder');

const CONFIG = {
  label: 'Sandhani Life Insurance',
  slug: 'sandhani-life',
  name: 'Sandhani Life Insurance',
  email: 'info@sandhanilife.com',
  adminEmail: 'admin@sandhani.local',
  adminName: 'Sandhani Admin',
  password: 'password',
  apiBase: 'https://backend.sandhanilife.com/api',
  mediaBase: 'https://backend.sandhanilife.com',
  fixtureSubdir: 'sandhani',
  downloadMediaEnv: 'SANDHANI_SEED_DOWNLOAD_MEDIA',
  placeholder: { fileName: 'sandhani-placeholder.webp', title: 'Sandhani Placeholder' },
  maveKeyMode: 'both',
  pagesFetch: 'list',
  features: {
    footers: true,
    forms: true,
    formBuilders: true,
    fallbackMedia: true,
  },
  requiredFixtures: {
    media: 'media',
    menuitems: 'menuitems',
    navbars: 'navbars',
    footers: 'footers',
    cards: 'cards',
    sliders: 'sliders',
    forms: 'forms',
    form_builders: 'form_builders',
    pages: 'pages',
  },
  apiMap: {
    media: 'media',
    menuitems: 'menuitems',
    navbars: 'navbars',
    footers: 'footers',
    cards: 'cards',
    sliders: 'sliders',
    forms: 'forms',
    form_builders: 'form_builder',
  },
};

exports.seed = async function seed(db) {
  await runOrganizationSeeder(db, CONFIG);
};

exports.CONFIG = CONFIG;
