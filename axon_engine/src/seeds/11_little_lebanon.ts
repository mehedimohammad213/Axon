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

function mediaSnapshot(media: BakeryMedia | undefined, fallbackPath: string) {
  if (!media) return { file_path: fallbackPath, title: fallbackPath };
  return {
    id: media.id,
    title: media.title,
    file_name: media.file_name,
    file_type: media.file_type,
    file_path: media.file_path,
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
  profileId: number,
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
        {
          _id: 'hero-copy',
          type: 'titledescription',
          _mave: {
            eyebrow: site.bakery.eyebrow,
            title: site.bakery.name,
            description: site.bakery.tagline,
          },
        },
        {
          _id: 'hero-media',
          type: 'media',
          id: mediaByFile['hero.jpg']?.id,
          _mave: mediaSnapshot(mediaByFile['hero.jpg'], '/assets/hero.jpg'),
        },
      ],
    },
    {
      _id: 'section-marquee',
      title: 'Marquee',
      layout: 'marquee',
      data: [
        {
          _id: 'marquee-list',
          type: 'iconlist',
          _mave: {
            items: site.marquee.map((label, index) => ({ id: index + 1, text: label })),
          },
        },
      ],
    },
    {
      _id: 'section-menu',
      title: 'Menu',
      layout: 'menu',
      data: [
        {
          _id: 'menu-copy',
          type: 'titledescription',
          _mave: {
            eyebrow: site.menuIntro.eyebrow,
            title: site.menuIntro.title,
            description: site.menuIntro.text,
          },
        },
        { _id: 'menu-products', type: 'product', product_type: 'menu-item' },
        ...site.features.map((feature, index) => ({
          _id: `feature-card-${featureCards[index]?.id || index}`,
          type: 'card',
          id: featureCards[index]?.id,
          _mave: {
            title_en: feature.title,
            description_en: feature.text,
            link_url: feature.image,
            media_ids: mediaByFile[feature.image.replace(/^\/assets\//, '')]?.id,
            media_files: mediaSnapshot(mediaByFile[feature.image.replace(/^\/assets\//, '')], feature.image),
            additional: { image: feature.image, alt: feature.alt },
          },
        })),
      ],
    },
    {
      _id: 'section-catering',
      title: 'Catering',
      layout: 'catering',
      data: [
        {
          _id: 'catering-copy',
          type: 'titledescription',
          _mave: {
            eyebrow: site.cateringCopy.eyebrow,
            title: site.cateringCopy.title,
            description: site.cateringCopy.text,
          },
        },
        {
          _id: 'catering-media',
          type: 'media',
          id: mediaByFile['tray.jpg']?.id,
          _mave: mediaSnapshot(mediaByFile['tray.jpg'], site.cateringCopy.image),
        },
        ...site.partyOptions.map((option, index) => ({
          _id: `party-card-${partyCards[index]?.id || index}`,
          type: 'card',
          id: partyCards[index]?.id,
          _mave: { title_en: option, description_en: option },
        })),
      ],
    },
    {
      _id: 'section-visit',
      title: 'Visit',
      layout: 'visit',
      data: [
        {
          _id: 'visit-copy',
          type: 'titledescription',
          _mave: {
            eyebrow: site.visitCopy.eyebrow,
            title: site.visitCopy.title,
            description: site.visitCopy.text,
          },
        },
        {
          _id: 'visit-profile',
          type: 'product',
          id: profileId,
          product_type: 'restaurant-profile',
        },
        {
          _id: 'visit-media',
          type: 'media',
          id: mediaByFile['hero.jpg']?.id,
          _mave: mediaSnapshot(mediaByFile['hero.jpg'], site.visitCopy.image),
        },
      ],
    },
    {
      _id: 'section-about',
      title: 'About',
      layout: 'about',
      data: [
        { _id: 'about-title', type: 'title', value: '<p>About Little Lebanon Bakery</p>' },
        {
          _id: 'about-copy',
          type: 'description',
          value:
            "<p>We bake manoush, Lebanese pizza, pide, and party pastries on Chapel Rd in Bankstown. Call the shop for today's hours and party orders.</p>",
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
  ];
}

function footerPageBody(site: SiteFixture, logo: BakeryMedia) {
  return [
    {
      _id: 'footer-brand',
      title: 'Brand',
      data: [
        {
          _id: 'footer-logo',
          type: 'media',
          id: logo.id,
          _mave: mediaSnapshot(logo, '/assets/logo.png'),
        },
        { _id: 'footer-title', type: 'title', value: `<p>${site.bakery.name}</p>` },
        {
          _id: 'footer-address',
          type: 'description',
          value: `<p>${site.bakery.address}</p>`,
          _mave: { altText: 'Address' },
        },
      ],
    },
    {
      _id: 'footer-contact',
      title: 'Contact',
      data: [
        {
          _id: 'footer-phone',
          type: 'titledescription',
          _mave: { title: 'Phone', description: `<p>${site.bakery.phoneDisplay}</p>` },
        },
        {
          _id: 'footer-hours',
          type: 'titledescription',
          _mave: { title: 'Hours', description: `<p>${site.bakery.hours}</p>` },
        },
      ],
    },
    {
      _id: 'footer-links',
      title: 'Links',
      data: [
        {
          _id: 'footer-menu',
          type: 'iconlist',
          _mave: {
            items: [
              ...site.nav.map((item, index) => ({ id: index + 1, text: item.label, altText: item.href })),
              { id: site.nav.length + 1, text: 'About', altText: '#about' },
            ],
          },
        },
      ],
    },
    {
      _id: 'footer-bottom',
      title: 'Bottom',
      data: [
        {
          _id: 'footer-social',
          type: 'iconlist',
          _mave: {
            items: [
              { id: 1, text: 'Instagram', altText: site.bakery.instagram.href },
              { id: 2, text: site.bakery.tiktok.label, altText: site.bakery.tiktok.href },
            ],
          },
        },
      ],
    },
  ];
}

export async function seed(db: DbContext): Promise<void> {
  const existing = await db.findOne('organizations', { slug: ORG_SLUG });
  if (existing) {
    console.log(`Little Lebanon Bakery already seeded. Site key: ${existing.site_key}`);
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
  const profileType = await db.insert('product_types', {
    organization_id: org.id,
    name: 'Restaurant Profile',
    slug: 'restaurant-profile',
    description: 'Homepage copy, contact details, and section text for the restaurant website.',
    field_schema: JSON.stringify([
      field('eyebrow', 'Eyebrow', 'text'),
      field('tagline', 'Tagline', 'textarea'),
      field('address', 'Address', 'textarea'),
      field('phone_display', 'Phone', 'text'),
      field('phone_href', 'Phone link', 'text'),
      field('maps_href', 'Maps link', 'url'),
      field('maps_embed', 'Maps embed URL', 'url'),
      field('instagram_handle', 'Instagram handle', 'text'),
      field('instagram_href', 'Instagram URL', 'url'),
      field('tiktok_label', 'TikTok label', 'text'),
      field('tiktok_href', 'TikTok URL', 'url'),
      field('hours', 'Hours', 'textarea'),
      field('highlights', 'Highlights (one per line)', 'textarea'),
      field('marquee', 'Marquee words (one per line)', 'textarea'),
      field('menu_eyebrow', 'Menu eyebrow', 'text'),
      field('menu_title', 'Menu title', 'text'),
      field('menu_text', 'Menu text', 'textarea'),
      field('catering_eyebrow', 'Catering eyebrow', 'text'),
      field('catering_title', 'Catering title', 'text'),
      field('catering_text', 'Catering text', 'textarea'),
      field('catering_image', 'Catering image', 'text'),
      field('catering_alt', 'Catering image alt', 'text'),
      field('catering_caption_eyebrow', 'Catering caption eyebrow', 'text'),
      field('catering_caption', 'Catering caption', 'text'),
      field('catering_badge', 'Catering badge', 'text'),
      field('visit_eyebrow', 'Visit eyebrow', 'text'),
      field('visit_title', 'Visit title', 'text'),
      field('visit_text', 'Visit text', 'textarea'),
      field('visit_caption_eyebrow', 'Visit caption eyebrow', 'text'),
      field('visit_image', 'Visit image', 'text'),
      field('visit_alt', 'Visit image alt', 'text'),
    ]),
    status: true,
    created_at: now,
    updated_at: now,
  });

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

  const profileProduct = await db.insert('products', {
    organization_id: org.id,
    product_type_id: profileType.id,
    title: site.bakery.name,
    slug: 'restaurant-profile',
    description: site.bakery.tagline,
    field_values: JSON.stringify({
      eyebrow: site.bakery.eyebrow,
      tagline: site.bakery.tagline,
      address: site.bakery.address,
      phone_display: site.bakery.phoneDisplay,
      phone_href: site.bakery.phoneHref,
      maps_href: site.bakery.mapsHref,
      maps_embed: site.bakery.mapsEmbed,
      instagram_handle: site.bakery.instagram.handle,
      instagram_href: site.bakery.instagram.href,
      tiktok_label: site.bakery.tiktok.label,
      tiktok_href: site.bakery.tiktok.href,
      hours: site.bakery.hours,
      highlights: site.highlights.join('\n'),
      marquee: site.marquee.join('\n'),
      menu_eyebrow: site.menuIntro.eyebrow,
      menu_title: site.menuIntro.title,
      menu_text: site.menuIntro.text,
      catering_eyebrow: site.cateringCopy.eyebrow,
      catering_title: site.cateringCopy.title,
      catering_text: site.cateringCopy.text,
      catering_image: site.cateringCopy.image,
      catering_alt: site.cateringCopy.alt,
      catering_caption_eyebrow: site.cateringCopy.captionEyebrow,
      catering_caption: site.cateringCopy.caption,
      catering_badge: site.cateringCopy.badge,
      visit_eyebrow: site.visitCopy.eyebrow,
      visit_title: site.visitCopy.title,
      visit_text: site.visitCopy.text,
      visit_caption_eyebrow: site.visitCopy.captionEyebrow,
      visit_image: site.visitCopy.image,
      visit_alt: site.visitCopy.alt,
    }),
    media_ids: JSON.stringify([]),
    additional: JSON.stringify({}),
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
    title: 'Instagram',
    title_bn: 'Instagram',
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
    body: JSON.stringify(homePageBody(site, profileProduct.id, featureCards, partyCards, mediaByFile)),
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
