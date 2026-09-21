import { runOrganizationSeeder } from '../utils/organizationSeeder';
import type { DbContext } from '../db';

export const CONFIG = {
  label: 'CARB',
  slug: 'carb',
  name: 'CARB',
  email: 'info@carb.local',
  adminEmail: 'admin@carb.local',
  adminName: 'CARB Admin',
  password: 'password',
  apiBase: 'https://carb.etherstaging.xyz/api',
  mediaBase: 'https://carb.etherstaging.xyz',
  fixtureSubdir: 'carb',
  downloadMediaEnv: 'CARB_SEED_DOWNLOAD_MEDIA',
  placeholder: { fileName: 'carb-placeholder.webp', title: 'CARB Placeholder' },
  maveKeyMode: 'both',
  pagesFetch: null,
  features: {
    footers: false,
    forms: false,
    formBuilders: true,
    fallbackMedia: true,
  },
  requiredFixtures: {
    media: 'media',
    menuitems: 'menuitems',
    navbars: 'navbars',
    cards: 'cards',
    sliders: 'sliders',
    form_builders: 'form_builders',
    pages: 'pages',
  },
  apiMap: {
    media: 'media',
    menuitems: 'menuitems',
    navbars: 'navbars',
    cards: 'cards',
    sliders: 'sliders',
    form_builders: 'form_builder',
    pages: 'pages',
  },
};

export async function seed(db: DbContext): Promise<void> {
  await runOrganizationSeeder(db, CONFIG);
}
