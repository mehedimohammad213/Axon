const { runOrganizationSeeder } = require('../utils/organizationSeeder');

const CONFIG = {
  label: 'Ether Technologies Ltd.',
  slug: 'ethertech',
  name: 'Ether Technologies Ltd.',
  email: 'info@ethertech.local',
  adminEmail: 'admin@ethertech.local',
  adminName: 'Ethertech Admin',
  password: 'password',
  apiBase: 'https://ether.etherstaging.xyz/api',
  mediaBase: 'https://ether.etherstaging.xyz',
  fixtureSubdir: 'ethertech',
  downloadMediaEnv: 'ETHERTECH_SEED_DOWNLOAD_MEDIA',
  placeholder: { fileName: 'ethertech-placeholder.webp', title: 'Ethertech Placeholder' },
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
