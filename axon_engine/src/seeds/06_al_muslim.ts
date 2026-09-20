import { runOrganizationSeeder } from '../utils/organizationSeeder';
import type { DbContext } from '../db';

export const CONFIG = {
  label: 'Al Muslim Group',
  slug: 'al-muslim',
  name: 'Al Muslim Group',
  email: 'info@almuslim.local',
  adminEmail: 'admin@almuslim.local',
  adminName: 'Al Muslim Admin',
  password: 'password',
  apiBase: 'https://mave-almuslim.etherstaging.xyz/api',
  mediaBase: 'https://mave-almuslim.etherstaging.xyz',
  fixtureSubdir: 'al-muslim',
  downloadMediaEnv: 'ALMUSLIM_SEED_DOWNLOAD_MEDIA',
  placeholder: { fileName: 'al-muslim-placeholder.webp', title: 'Al Muslim Placeholder' },
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

export async function seed(db: DbContext): Promise<void> {
  await runOrganizationSeeder(db, CONFIG);
}
