import { runOrganizationSeeder } from '../utils/organizationSeeder';
import type { DbContext } from '../db';

export const CONFIG = {
  label: 'LPG',
  slug: 'united-aygaz',
  name: 'LPG',
  email: 'info@unitedaygaz.com',
  adminEmail: 'admin@aygaz.local',
  adminName: 'Aygaz Admin',
  password: 'password',
  apiBase: 'https://engine.unitedaygaz.com/api',
  mediaBase: 'https://engine.unitedaygaz.com',
  fixtureSubdir: 'aygaz',
  downloadMediaEnv: 'AYGAZ_SEED_DOWNLOAD_MEDIA',
  placeholder: { fileName: 'aygaz-placeholder.webp', title: 'Aygaz Placeholder' },
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
    pages: 'pages',
  },
  optionalFixtures: {
    form_builders: 'form_builders',
  },
  apiMap: {
    media: 'media',
    menuitems: 'menuitems',
    navbars: 'navbars',
    footers: 'footers',
    cards: 'cards',
    sliders: 'sliders',
    forms: 'forms',
  },
};

export async function seed(db: DbContext): Promise<void> {
  await runOrganizationSeeder(db, CONFIG);
}
