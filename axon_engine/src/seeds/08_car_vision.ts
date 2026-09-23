import { runOrganizationSeeder } from '../utils/organizationSeeder';
import type { DbContext } from '../db';

export const CONFIG = {
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
    formBuilders: true,
    fallbackMedia: false,
  },
  requiredFixtures: {
    media: 'media',
    menuitems: 'menuitems',
    navbars: 'navbars',
    footers: 'footers',
    cards: 'cards',
    sliders: 'sliders',
    form_builders: 'form_builders',
    pages: 'pages',
  },
};

export async function seed(db: DbContext): Promise<void> {
  await runOrganizationSeeder(db, CONFIG);
}
