import fs from 'fs';
import path from 'path';
import { hashPassword, seedDefaultRolesForOrganization } from '../utils/helpers';
import type { DbContext } from '../db';

const SITE_KEY = 'little-lebanon-bakery-site-key';
const ORG_SLUG = 'little-lebanon-bakery';
const ADMIN_EMAIL = 'admin@littlelebanonbakery.local';

type MenuItem = { name: string; price: string };
type MenuCategory = { title: string; items: MenuItem[]; columns?: boolean };
type Feature = { title: string; text: string; image: string; alt: string };
type BakeryMedia = {
  id: number;
  title: string;
  file_name: string;
  file_type: string;
  file_path: string;
};

const BAKERY_ASSETS = [
  { file: 'logo.png', title: 'Logo', type: 'image/png' },
  { file: 'hero.jpg', title: 'Hero', type: 'image/jpeg' },
  { file: 'zaatar.jpg', title: 'Zaatar Wrap', type: 'image/jpeg' },
  { file: 'meat-cheese.jpg', title: 'Meat & Cheese', type: 'image/jpeg' },
  { file: 'pastries.jpg', title: 'Party Pastries', type: 'image/jpeg' },
  { file: 'egg-boat.jpg', title: 'Egg Boat & Wraps', type: 'image/jpeg' },
  { file: 'tray.jpg', title: 'Party Tray', type: 'image/jpeg' },
];

function publishBakeryAsset(fileName: string) {
  const source = path.resolve(__dirname, '../../../restaurant/public/assets', fileName);
  const storedName = `little-lebanon-${fileName}`;
  const destDir = path.resolve(__dirname, '../../uploads/media');
  const dest = path.join(destDir, storedName);
  fs.mkdirSync(destDir, { recursive: true });
  if (fs.existsSync(source)) fs.copyFileSync(source, dest);
  return {
    file_name: storedName,
    file_path: `media/${storedName}`,
    file_size: fs.existsSync(dest) ? fs.statSync(dest).size : null,
  };
}

function mediaSnapshot(media: BakeryMedia | undefined, fallbackPath: string, alt?: string) {
  if (!media) return { file_path: fallbackPath, title: alt || fallbackPath };
  return {
    id: media.id,
    title: alt || media.title,
    file_name: media.file_name,
    file_type: media.file_type,
    file_path: media.file_path,
  };
}

function html(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.includes('<') ? trimmed : `<p>${trimmed}</p>`;
}

function componentFields(fields: Record<string, unknown>) {
  return { _mave: fields, _headless: fields };
}

function titleBlock(id: string, value: string) {
  return { _id: id, type: 'title', value: html(value) };
}

function titleDescription(
  id: string,
  fields: { eyebrow?: string; title: string; description: string; link?: string; altDescription?: string },
) {
  const link = fields.link || '';
  const external = /^https?:/i.test(link);
  return {
    _id: id,
    type: 'titledescription',
    ...componentFields({
      eyebrow: fields.eyebrow || '',
      title: fields.title,
      altTitle: fields.eyebrow || '',
      description: html(fields.description),
      altDescription: fields.altDescription ? html(fields.altDescription) : '',
      link,
      linkType: 'independent',
      isExternal: external,
      target: external ? '_blank' : '_self',
      showAltContent: Boolean(fields.altDescription),
    }),
  };
}

function iconList(id: string, items: { id: number; text: string; altText?: string }[]) {
  return {
    _id: id,
    type: 'iconlist',
    ...componentFields({
      items,
      orientation: 'horizontal',
      iconSize: 24,
      iconColor: '#000000',
      showAltContent: items.some((item) => item.altText),
    }),
  };
}

function mediaBlock(id: string, media: BakeryMedia | undefined, fallbackPath: string, alt?: string) {
  const snapshot = mediaSnapshot(media, fallbackPath, alt);
  return {
    _id: id,
    type: 'media',
    id: media?.id,
    ...componentFields(snapshot),
  };
}
type SiteFixture = {
  bakery: {
    name: string;
    eyebrow: string;
    tagline: string;
    address: string;
    phoneDisplay: string;
    phoneHref: string;
    mapsHref: string;
    mapsEmbed: string;
    instagram: { handle: string; href: string };
    tiktok: { label: string; href: string };
    hours: string;
  };
  nav: { href: string; label: string }[];
  highlights: string[];
  marquee: string[];
  menu: MenuCategory[];
  features: Feature[];
  partyOptions: string[];
  menuIntro: { eyebrow: string; title: string; text: string };
  cateringCopy: {
    eyebrow: string;
    title: string;
    text: string;
    image: string;
    alt: string;
    captionEyebrow: string;
    caption: string;
    badge: string;
  };
  visitCopy: {
    eyebrow: string;
    title: string;
    text: string;
    captionEyebrow: string;
    image: string;
    alt: string;
  };
};

function loadFixture(): SiteFixture {
  const filePath = path.join(__dirname, 'data/little-lebanon/site.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as SiteFixture;
}

function field(name: string, label: string, fieldType: string, extra: Record<string, unknown> = {}) {
  return {
    id: `field_${name}`,
    name,
    label,
    field_type: fieldType,
    required: false,
    show_in_list: true,
    ...extra,
  };
}

function homePageBody(
  site: SiteFixture,
  featureCards: { id: number }[],
  partyCards: { id: number }[],
  mediaByFile: Record<string, BakeryMedia>,
) {
  return [
    {
      _id: 'section-hero',
      title: 'Hero',
      layout: 'hero',
      data: [
        titleBlock('hero-eyebrow', site.bakery.eyebrow),
        titleDescription('hero-copy', {
          eyebrow: site.bakery.eyebrow,
          title: site.bakery.name,
          description: site.bakery.tagline,
          link: '#menu',
        }),
        iconList(
          'hero-highlights',
          site.highlights.map((label, index) => ({ id: index + 1, text: label })),
        ),
        mediaBlock(
          'hero-media',
          mediaByFile['hero.jpg'],
          '/assets/hero.jpg',
          'Warm Lebanese bakery counter filled with manoush, pastries, and pies',
        ),
      ],
    },
    {
      _id: 'section-marquee',
      title: 'Marquee',
      layout: 'marquee',
      data: [
        iconList(
          'marquee-list',
          site.marquee.map((label, index) => ({ id: index + 1, text: label })),
        ),
      ],
    },
    {
      _id: 'section-menu',
      title: 'Menu',
      layout: 'menu',
      data: [
        titleBlock('menu-eyebrow', site.menuIntro.eyebrow),
        titleDescription('menu-copy', {
          eyebrow: site.menuIntro.eyebrow,
          title: site.menuIntro.title,
          description: site.menuIntro.text,
          link: site.bakery.phoneHref,
        }),
        { _id: 'menu-products', type: 'product', product_type: 'menu-item' },
        ...site.features.map((feature, index) => {
          const assetName = feature.image.replace(/^\/assets\//, '');
          const payload = {
            title_en: feature.title,
            description_en: feature.text,
            link_url: feature.image,
            media_ids: mediaByFile[assetName]?.id,
            media_files: mediaSnapshot(mediaByFile[assetName], feature.image, feature.alt),
            additional: { image: feature.image, alt: feature.alt },
          };
          return {
            _id: `feature-card-${featureCards[index]?.id || index}`,
            type: 'card',
            id: featureCards[index]?.id,
            ...componentFields(payload),
          };
        }),
      ],
    },
    {
      _id: 'section-catering',
      title: 'Catering',
      layout: 'catering',
      data: [
        titleBlock('catering-eyebrow', site.cateringCopy.eyebrow),
        titleDescription('catering-copy', {
          eyebrow: site.cateringCopy.eyebrow,
          title: site.cateringCopy.title,
          description: site.cateringCopy.text,
          link: site.bakery.phoneHref,
        }),
        mediaBlock('catering-media', mediaByFile['tray.jpg'], site.cateringCopy.image, site.cateringCopy.alt),
        titleDescription('catering-caption', {
          eyebrow: site.cateringCopy.badge,
          title: site.cateringCopy.captionEyebrow,
          description: site.cateringCopy.caption,
          link: '#catering',
        }),
        ...site.partyOptions.map((option, index) => ({
          _id: `party-card-${partyCards[index]?.id || index}`,
          type: 'card',
          id: partyCards[index]?.id,
          ...componentFields({ title_en: option, description_en: option }),
        })),
      ],
    },
    {
      _id: 'section-visit',
      title: 'Visit',
      layout: 'visit',
      data: [
        titleBlock('visit-eyebrow', site.visitCopy.eyebrow),
        titleDescription('visit-copy', {
          eyebrow: site.visitCopy.eyebrow,
          title: site.visitCopy.title,
          description: site.visitCopy.text,
          altDescription: site.visitCopy.captionEyebrow,
          link: site.bakery.mapsHref,
        }),
        mediaBlock('visit-media', mediaByFile['hero.jpg'], site.visitCopy.image, site.visitCopy.alt),
      ],
    },
    {
      _id: 'section-about',
      title: 'About',
      layout: 'about',
      data: [
        titleBlock('about-title', 'About Little Lebanon Bakery'),
        {
          _id: 'about-copy',
          type: 'description',
          value:
            "<p>We bake manoush, Lebanese pizza, pide, and party pastries on Chapel Rd in Bankstown. Call the shop for today's hours and party orders.</p>",
        },
        iconList('about-list', [
          { id: 1, text: 'Oven-fresh manoush', altText: 'Oregano, cheese, meat, and wraps.' },
          { id: 2, text: 'Party trays', altText: 'Mini pastries prepared for pickup.' },
        ]),
      ],
    },
  ];
}

function footerPageBody(site: SiteFixture, logo: BakeryMedia) {
  return [
    {
      _id: 'footer-brand',
      title: 'Brand',
      data: [
        mediaBlock('footer-logo', logo, '/assets/logo.png'),
        titleBlock('footer-title', site.bakery.name),
        {
          _id: 'footer-address',
          type: 'description',
          value: html(site.bakery.address),
          ...componentFields({ altText: 'Address' }),
        },
      ],
    },
    {
      _id: 'footer-contact',
      title: 'Contact',
      data: [
        titleDescription('footer-phone', {
          title: 'Phone',
          description: site.bakery.phoneDisplay,
          link: site.bakery.phoneHref,
        }),
        titleDescription('footer-hours', {
          title: 'Hours',
          description: site.bakery.hours,
          link: '#visit',
        }),
        titleDescription('footer-directions', {
          title: 'Directions',
          description: site.bakery.mapsEmbed,
          link: site.bakery.mapsHref,
        }),
      ],
    },
    {
      _id: 'footer-links',
      title: 'Links',
      data: [
        iconList('footer-menu', [
          ...site.nav.map((item, index) => ({ id: index + 1, text: item.label, altText: item.href })),
          { id: site.nav.length + 1, text: 'About', altText: '#about' },
        ]),
      ],
    },
    {
      _id: 'footer-bottom',
      title: 'Bottom',
      data: [
        iconList('footer-social', [
          { id: 1, text: site.bakery.instagram.handle, altText: site.bakery.instagram.href },
          { id: 2, text: site.bakery.tiktok.label, altText: site.bakery.tiktok.href },
        ]),
      ],
    },
  ];
}

async function publishSitePages(
  db: DbContext,
  orgId: number,
  site: SiteFixture,
  featureCards: { id: number }[],
  partyCards: { id: number }[],
  mediaByFile: Record<string, BakeryMedia>,
) {
  const now = new Date();
  const logo = mediaByFile['logo.png'];
  const home = await db.findOne('pages', { organization_id: orgId, slug: 'home', type: 'Page' });
  const footer = await db.findOne('pages', { organization_id: orgId, slug: 'footer', type: 'Footer' });
  if (home) {
    await db.updateById('pages', home.id, {
      page_name_en: site.bakery.name,
      page_name_bn: site.bakery.name,
      body: JSON.stringify(homePageBody(site, featureCards, partyCards, mediaByFile)),
      updated_at: now,
    });
  }
  if (footer && logo) {
    await db.updateById('pages', footer.id, {
      page_name_en: site.bakery.name,
      page_name_bn: site.bakery.name,
      body: JSON.stringify(footerPageBody(site, logo)),
      updated_at: now,
    });
  }

  const menuItems = await db.findAll('menu_items', { organization_id: orgId });
  const instagram = menuItems.find((item) => item.link === site.bakery.instagram.href);
  if (instagram && instagram.title !== site.bakery.instagram.handle) {
    await db.updateById('menu_items', instagram.id, {
      title: site.bakery.instagram.handle,
      title_bn: site.bakery.instagram.handle,
      updated_at: now,
    });
  }

  await db.remove('products', { organization_id: orgId, slug: 'restaurant-profile' });
  await db.remove('product_types', { organization_id: orgId, slug: 'restaurant-profile' });
}

export async function seed(db: DbContext): Promise<void> {
  const existing = await db.findOne('organizations', { slug: ORG_SLUG });
  if (existing) {
    const site = loadFixture();
    const mediaRows = await db.findAll('media', { organization_id: existing.id });
    const mediaByFile: Record<string, BakeryMedia> = {};
    for (const row of mediaRows) {
      const file = String(row.file_name || '').replace(/^little-lebanon-/, '');
      if (!BAKERY_ASSETS.some((asset) => asset.file === file)) continue;
      mediaByFile[file] = {
        id: row.id,
        title: row.title,
        file_name: row.file_name,
        file_type: row.file_type,
        file_path: row.file_path,
      };
    }
    const cards = await db.findAll('cards', { organization_id: existing.id });
    const featureCards = cards
      .filter((card) => card.page_name === 'feature')
      .sort((a, b) => Number(a.id) - Number(b.id));
    const partyCards = cards
      .filter((card) => card.page_name === 'party')
      .sort((a, b) => Number(a.id) - Number(b.id));
    await publishSitePages(db, existing.id, site, featureCards, partyCards, mediaByFile);
    console.log(`Little Lebanon Bakery home page and footer now hold the restaurant profile. Site key: ${existing.site_key}`);
    return;
  }

  const site = loadFixture();
  const now = new Date();
  const org = await db.insert('organizations', {
    name: site.bakery.name,
    slug: ORG_SLUG,
    email: ADMIN_EMAIL,
    phone: site.bakery.phoneDisplay,
    is_active: true,
    site_key: SITE_KEY,
    created_at: now,
    updated_at: now,
  });

  const roles = await seedDefaultRolesForOrganization(org.id, db);
  await db.insert('users', {
    name: 'Little Lebanon Admin',
    email: ADMIN_EMAIL,
    password: await hashPassword('password'),
    organization_id: org.id,
    role_id: roles.Admin.id,
    is_super_admin: false,
    created_at: now,
    updated_at: now,
  });

  const categories = site.menu.map((category) => category.title);
  const menuType = await db.insert('product_types', {
    organization_id: org.id,
    name: 'Menu Item',
    slug: 'menu-item',
    description: 'A dish on the restaurant menu. Category groups items on the public menu board.',
    field_schema: JSON.stringify([
      field('category', 'Category', 'select', {
        options: categories.map((title) => ({ label: title, value: title })),
      }),
      field('price', 'Price', 'text'),
      field('wide', 'Two columns', 'checkbox'),
    ]),
    status: true,
    created_at: now,
    updated_at: now,
  });

  for (const category of site.menu) {
    for (const item of category.items) {
      const slug = `${category.title}-${item.name}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      await db.insert('products', {
        organization_id: org.id,
        product_type_id: menuType.id,
        title: item.name,
        slug,
        description: null,
        field_values: JSON.stringify({
          category: category.title,
          price: item.price,
          wide: Boolean(category.columns),
        }),
        media_ids: JSON.stringify([]),
        additional: JSON.stringify({}),
        status: true,
        created_at: now,
        updated_at: now,
      });
    }
  }

  const mediaByFile: Record<string, BakeryMedia> = {};
  for (const asset of BAKERY_ASSETS) {
    const published = publishBakeryAsset(asset.file);
    const row = await db.insert('media', {
      organization_id: org.id,
      title: asset.title,
      file_name: published.file_name,
      file_type: asset.type,
      file_path: published.file_path,
      file_size: published.file_size,
      created_at: now,
      updated_at: now,
    });
    mediaByFile[asset.file] = {
      id: row.id,
      title: asset.title,
      file_name: published.file_name,
      file_type: asset.type,
      file_path: published.file_path,
    };
  }

  const featureCards: { id: number }[] = [];
  for (const feature of site.features) {
    const assetName = feature.image.replace(/^\/assets\//, '');
    featureCards.push(await db.insert('cards', {
      organization_id: org.id,
      page_name: 'feature',
      title_en: feature.title,
      title_bn: feature.title,
      description_en: feature.text,
      description_bn: feature.text,
      media_ids: mediaByFile[assetName]?.id || null,
      link_url: feature.image,
      additional: JSON.stringify({ alt: feature.alt, image: feature.image }),
      status: true,
      created_at: now,
      updated_at: now,
    }));
  }

  const partyCards: { id: number }[] = [];
  for (const option of site.partyOptions) {
    partyCards.push(await db.insert('cards', {
      organization_id: org.id,
      page_name: 'party',
      title_en: option,
      title_bn: option,
      description_en: option,
      description_bn: option,
      additional: JSON.stringify({}),
      status: true,
      created_at: now,
      updated_at: now,
    }));
  }

  const navItems = [];
  for (const item of site.nav) {
    navItems.push(
      await db.insert('menu_items', {
        organization_id: org.id,
        title: item.label,
        title_bn: item.label,
        link: item.href,
        parent_id: null,
        created_at: now,
        updated_at: now,
      })
    );
  }

  const aboutItem = await db.insert('menu_items', {
    organization_id: org.id,
    title: 'About',
    title_bn: 'About',
    link: '#about',
    parent_id: null,
    created_at: now,
    updated_at: now,
  });
  const instagramItem = await db.insert('menu_items', {
    organization_id: org.id,
    title: site.bakery.instagram.handle,
    title_bn: site.bakery.instagram.handle,
    link: site.bakery.instagram.href,
    parent_id: null,
    created_at: now,
    updated_at: now,
  });
  const tiktokItem = await db.insert('menu_items', {
    organization_id: org.id,
    title: site.bakery.tiktok.label,
    title_bn: site.bakery.tiktok.label,
    link: site.bakery.tiktok.href,
    parent_id: null,
    created_at: now,
    updated_at: now,
  });

  const logo = mediaByFile['logo.png'];
  const navbarIds = [...navItems.map((item) => item.id), aboutItem.id];
  await db.insert('navbars', {
    organization_id: org.id,
    title_en: site.bakery.name,
    title_bn: site.bakery.name,
    logo_id: logo.id,
    menu_item_ids: JSON.stringify(navbarIds),
    created_at: now,
    updated_at: now,
  });

  await db.insert('footers', {
    organization_id: org.id,
    title_en: site.bakery.name,
    title_bn: site.bakery.name,
    logo_id: logo.id,
    address1_title_en: 'Address',
    address1_description_en: site.bakery.address,
    address1_status: 1,
    address2_title_en: 'Phone',
    address2_description_en: site.bakery.phoneDisplay,
    address2_status: 1,
    column2_menu_item_ids: JSON.stringify(navbarIds),
    column2_status: 1,
    column4_title_en: 'Hours',
    column4_text_en: site.bakery.hours,
    column4_status: 1,
    bottom_menu_item_ids: JSON.stringify([instagramItem.id, tiktokItem.id]),
    created_at: now,
    updated_at: now,
  });

  await db.insert('pages', {
    organization_id: org.id,
    slug: 'footer',
    type: 'Footer',
    page_name_en: site.bakery.name,
    page_name_bn: site.bakery.name,
    head: JSON.stringify({
      title: site.bakery.name,
      description: 'Footer',
      keywords: [],
      image: null,
      imageAlt: null,
    }),
    body: JSON.stringify(footerPageBody(site, logo)),
    body_raw: JSON.stringify([]),
    additional: JSON.stringify([
      {
        pageType: 'Footer',
        metaTitle: site.bakery.name,
        metaDescription: '',
        keywords: [],
        metaImage: '',
        metaImageAlt: '',
      },
    ]),
    status: true,
    created_at: now,
    updated_at: now,
  });

  await db.insert('pages', {
    organization_id: org.id,
    slug: 'home',
    type: 'Page',
    page_name_en: site.bakery.name,
    page_name_bn: site.bakery.name,
    head: JSON.stringify({
      title: site.bakery.name,
      description: site.bakery.tagline,
      keywords: [],
      image: null,
      imageAlt: null,
    }),
    body: JSON.stringify(homePageBody(site, featureCards, partyCards, mediaByFile)),
    additional: JSON.stringify([
      {
        pageType: 'Page',
        metaTitle: site.bakery.name,
        metaDescription: site.bakery.tagline,
        keywords: [],
      },
    ]),
    status: true,
    created_at: now,
    updated_at: now,
  });

  await db.insert('pages', {
    organization_id: org.id,
    slug: 'about',
    type: 'Page',
    page_name_en: 'About',
    page_name_bn: 'About',
    head: JSON.stringify({
      title: 'About',
      description: 'Little Lebanon Bakery on Chapel Rd.',
    }),
    body: JSON.stringify([
      {
        _id: 'about-section',
        title: 'About',
        data: [
          { _id: 'about-title', type: 'title', value: '<p>About Little Lebanon Bakery</p>' },
          {
            _id: 'about-copy',
            type: 'description',
            value: "<p>We bake manoush, Lebanese pizza, pide, and party pastries on Chapel Rd in Bankstown. Call the shop for today's hours and party orders.</p>",
          },
          {
            _id: 'about-list',
            type: 'iconlist',
            _mave: {
              items: [
                { id: 1, text: 'Oven-fresh manoush', altText: 'Oregano, cheese, meat, and wraps.' },
                { id: 2, text: 'Party trays', altText: 'Mini pastries prepared for pickup.' },
              ],
            },
          },
        ],
      },
    ]),
    additional: JSON.stringify([
      {
        pageType: 'Page',
        metaTitle: 'About',
        metaDescription: 'About Little Lebanon Bakery',
        keywords: [],
      },
    ]),
    status: true,
    created_at: now,
    updated_at: now,
  });

  console.log(`Seeded Little Lebanon Bakery. CMS login: ${ADMIN_EMAIL} / password`);
  console.log(`Public site key: ${SITE_KEY}`);
}
