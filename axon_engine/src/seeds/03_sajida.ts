import { runOrganizationSeeder } from '../utils/organizationSeeder';
import type { DbContext } from '../db';

export const CONFIG = {
  label: 'Sajida Hospital',
  slug: 'sajida-hospital',
  name: 'Sajida Hospital',
  email: 'info@sajida.local',
  phone: '01777772500',
  adminEmail: 'admin@sajida.local',
  adminName: 'Sajida Admin',
  password: 'password',
  apiBase: 'https://engine.sajidahospital.org/api',
  mediaBase: 'https://engine.sajidahospital.org',
  fixtureSubdir: 'sajida',
  downloadMediaEnv: 'SAJIDA_SEED_DOWNLOAD_MEDIA',
  placeholder: { fileName: 'sajida-placeholder.webp', title: 'Sajida Placeholder' },
  maveKeyMode: 'headless_only',
  pagesFetch: 'by_type',
  pageTypes: ['Page', 'Footer'],
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

export async function seed(db: DbContext): Promise<void> {
  await runOrganizationSeeder(db, CONFIG);
}
