const { runOrganizationSeeder } = require('../utils/organizationSeeder');

const CONFIG = {
  label: 'Dream Agent Car Vision',
  slug: 'dream-agent-car-vision',
  name: 'Dream Agent Car Vision',
  email: 'car_vision71@yahoo.com',
  phone: '01714211956',
  adminEmail: 'admin@dreamagentcarvision.local',
  adminName: 'Car Vision Admin',
  password: 'password',
  fixtureSubdir: 'car-vision',
  maveKeyMode: 'both',
  features: {
    footers: true,
    forms: true,
    formBuilders: true,
    fallbackMedia: false,
  },
  requiredFixtures: {
    media: 'media',
    menuitems: 'menuitems',
    menus: 'menus',
    navbars: 'navbars',
    footers: 'footers',
    cards: 'cards',
    sliders: 'sliders',
    forms: 'forms',
    form_builders: 'form_builders',
    pages: 'pages',
  },
};

exports.seed = async function seed(db) {
  await runOrganizationSeeder(db, CONFIG);
};

exports.CONFIG = CONFIG;
