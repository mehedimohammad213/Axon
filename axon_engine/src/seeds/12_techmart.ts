import fs from 'fs';
import path from 'path';
import { hashPassword, seedDefaultRolesForOrganization } from '../utils/helpers';
import type { DbContext } from '../db';

const SITE_KEY = 'techmart-site-key';
const ORG_SLUG = 'techmart';
const ADMIN_EMAIL = 'admin@techmart.local';

type CatalogProduct = {
  type: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  values: Record<string, unknown>;
};

type CatalogType = {
  name: string;
  slug: string;
  description: string;
  fields: string[];
};

type Catalog = {
  store: {
    name: string;
    eyebrow: string;
    tagline: string;
    address: string;
    phoneDisplay: string;
    phoneHref: string;
    email: string;
    hours: string;
  };
  nav: { href: string; label: string }[];
  highlights: string[];
  types: CatalogType[];
  products: CatalogProduct[];
};

const FIELD_DEFS: Record<string, { label: string; field_type: string; extra?: Record<string, unknown> }> = {
  brand: { label: 'Brand', field_type: 'text', extra: { show_in_list: true } },
  processor: { label: 'Processor', field_type: 'text', extra: { show_in_list: true } },
  ram: { label: 'RAM', field_type: 'text', extra: { show_in_list: true } },
  storage: { label: 'Storage', field_type: 'text', extra: { show_in_list: true } },
  display: { label: 'Display', field_type: 'text', extra: { show_in_list: false } },
  sensor: { label: 'Sensor', field_type: 'text', extra: { show_in_list: true } },
  resolution: { label: 'Resolution', field_type: 'text', extra: { show_in_list: true } },
  lens: { label: 'Lens', field_type: 'text', extra: { show_in_list: false } },
  wifi: { label: 'Wi-Fi standard', field_type: 'text', extra: { show_in_list: true } },
  speed: { label: 'Speed', field_type: 'text', extra: { show_in_list: true } },
  ports: { label: 'Ports', field_type: 'text', extra: { show_in_list: false } },
  sku: { label: 'SKU', field_type: 'sku', extra: { show_in_list: false } },
  stock: { label: 'Stock', field_type: 'quantity', extra: { show_in_list: true, min: 0 } },
  price: { label: 'Price', field_type: 'price', extra: { show_in_list: true, currency: 'BDT' } },
};

function loadCatalog(): Catalog {
  const filePath = path.join(__dirname, 'data/techmart/catalog.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as Catalog;
}

function field(name: string) {
  const def = FIELD_DEFS[name];
  if (!def) throw new Error(`Unknown product field: ${name}`);
  return {
    id: `field_${name}`,
    name,
    label: def.label,
    field_type: def.field_type,
    required: name === 'price',
    show_in_list: true,
    ...(def.extra || {}),
  };
}

function mediaPath(fileName: string) {
  return `media/techmart-${fileName}`;
}

const PRODUCT_LABELS: Record<string, string> = {
  'laptop-pro.svg': 'NovaBook Pro 14',
  'laptop-air.svg': 'PulseAir 15',
  'laptop-gaming.svg': 'Forge Gaming 16',
  'mobile-flagship.svg': 'Orbit X1',
  'mobile-se.svg': 'Pixelate SE',
  'mobile-note.svg': 'Aura Note 5G',
  'camera-mirrorless.svg': 'Lumen A7',
  'camera-compact.svg': 'Vista Compact Z',
  'camera-action.svg': 'ActionCam 4K',
  'router-mesh.svg': 'MeshLink AX5400',
  'router-pro.svg': 'NetGate Wi-Fi 7',
  'router-home.svg': 'HomeLink Dual Band',
};

const PRODUCT_COLORS: Record<string, [string, string, string]> = {
  'laptop-pro.svg': ['#E8EEF3', '#1B2A3A', '#1FA7A0'],
  'laptop-air.svg': ['#EDF2F6', '#274056', '#4F7CAC'],
  'laptop-gaming.svg': ['#1A1423', '#2A1F3D', '#7B2CBF'],
  'mobile-flagship.svg': ['#E9F2F1', '#102A2A', '#1FA7A0'],
  'mobile-se.svg': ['#F3F0EA', '#2C241B', '#D97706'],
  'mobile-note.svg': ['#EEF1F8', '#1E293B', '#3B82F6'],
  'camera-mirrorless.svg': ['#ECE7E1', '#2F2A26', '#6B7280'],
  'camera-compact.svg': ['#E8F0F5', '#0F766E', '#99F6E4'],
  'camera-action.svg': ['#F3F4F6', '#111827', '#F59E0B'],
  'router-mesh.svg': ['#EAF2FF', '#1D4ED8', '#DBEAFE'],
  'router-pro.svg': ['#F5F3FF', '#5B21B6', '#DDD6FE'],
  'router-home.svg': ['#ECFDF5', '#047857', '#A7F3D0'],
};

function buildSvg(fileName: string): string {
  if (fileName === 'logo.svg') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="80" viewBox="0 0 320 80"><rect width="320" height="80" rx="12" fill="#0B1F33"/><rect x="16" y="18" width="44" height="44" rx="10" fill="#1FA7A0"/><path d="M28 40h20M38 30v20" stroke="#E8F7F6" stroke-width="3" stroke-linecap="round"/><text x="78" y="48" font-family="Arial,sans-serif" font-size="28" font-weight="700" fill="#F4F8FB">TechMart</text></svg>`;
  }

  if (fileName === 'hero.svg') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0B1F33"/><stop offset="55%" stop-color="#12324D"/><stop offset="100%" stop-color="#1FA7A0"/></linearGradient></defs><rect width="1600" height="900" fill="url(#g)"/><circle cx="1180" cy="220" r="180" fill="#F4C95F" opacity="0.18"/><rect x="180" y="240" width="420" height="280" rx="24" fill="#F4F8FB" opacity="0.12"/><rect x="640" y="300" width="220" height="380" rx="28" fill="#F4F8FB" opacity="0.14"/><rect x="920" y="360" width="300" height="180" rx="20" fill="#F4F8FB" opacity="0.12"/><text x="180" y="180" font-family="Arial,sans-serif" font-size="64" font-weight="700" fill="#F4F8FB">IT products, ready to ship</text><text x="180" y="240" font-family="Arial,sans-serif" font-size="28" fill="#C9D7E3">Laptops · Mobiles · Cameras · Routers</text></svg>`;
  }

  const label = PRODUCT_LABELS[fileName] || fileName.replace(/\.svg$/, '');
  const [bg, dark, accent] = PRODUCT_COLORS[fileName] || ['#E8EEF3', '#1B2A3A', '#1FA7A0'];

  if (fileName.startsWith('mobile-')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="${bg}"/><rect x="300" y="60" width="200" height="420" rx="28" fill="${dark}"/><rect x="315" y="90" width="170" height="350" rx="12" fill="${accent}"/><text x="400" y="560" text-anchor="middle" font-family="Arial" font-size="28" fill="${dark}">${label}</text></svg>`;
  }
  if (fileName.startsWith('camera-')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="${bg}"/><rect x="180" y="180" width="440" height="260" rx="28" fill="${dark}"/><circle cx="400" cy="310" r="90" fill="${accent}"/><circle cx="400" cy="310" r="50" fill="#111827"/><text x="400" y="540" text-anchor="middle" font-family="Arial" font-size="28" fill="${dark}">${label}</text></svg>`;
  }
  if (fileName.startsWith('router-')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="${bg}"/><rect x="200" y="230" width="400" height="150" rx="20" fill="${dark}"/><circle cx="320" cy="305" r="14" fill="${accent}"/><circle cx="400" cy="305" r="14" fill="${accent}"/><circle cx="480" cy="305" r="14" fill="${accent}"/><text x="400" y="520" text-anchor="middle" font-family="Arial" font-size="28" fill="${dark}">${label}</text></svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="${bg}"/><rect x="140" y="120" width="520" height="320" rx="18" fill="${dark}"/><rect x="160" y="140" width="480" height="260" rx="8" fill="${accent}"/><rect x="100" y="450" width="600" height="28" rx="8" fill="${dark}"/><text x="400" y="560" text-anchor="middle" font-family="Arial" font-size="28" fill="${dark}">${label}</text></svg>`;
}

function ensureMediaFile(fileName: string) {
  const stored = `techmart-${fileName}`;
  const destDir = path.resolve(__dirname, '../../uploads/media');
  const dest = path.join(destDir, stored);
  fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(dest)) {
    fs.writeFileSync(dest, buildSvg(fileName), 'utf8');
  }
  return {
    file_name: stored,
    file_path: mediaPath(fileName),
    file_size: fs.statSync(dest).size,
  };
}

async function seedOrderForm(db: DbContext, orgId: number, now: Date) {
  const existing = await db.findOne('form_builder', {
    organization_id: orgId,
    title: 'Order',
  });
  if (existing) return existing;

  return db.insert('form_builder', {
    organization_id: orgId,
    title: 'Order',
    description: '<p>Checkout orders from the TechMart storefront.</p>',
    attributes: JSON.stringify({
      component_id: 'order_form',
      method: 'POST',
      form_type: 'order',
    }),
    elements: JSON.stringify([
      {
        type: 'input',
        label: 'Customer name',
        element_type: 'input',
        input_type: 'text',
        required: true,
      },
      {
        type: 'input',
        label: 'Customer email',
        element_type: 'input',
        input_type: 'email',
        required: true,
      },
      {
        type: 'input',
        label: 'Customer phone',
        element_type: 'input',
        input_type: 'tel',
        required: true,
      },
      {
        type: 'textarea',
        label: 'Shipping address',
        element_type: 'textarea',
        required: true,
      },
      {
        type: 'textarea',
        label: 'Order notes',
        element_type: 'textarea',
        required: false,
      },
    ]),
    additional: JSON.stringify({ form_type: 'order', source: 'techmart-storefront' }),
    status: true,
    created_at: now,
    updated_at: now,
  });
}

export async function seed(db: DbContext): Promise<void> {
  const catalog = loadCatalog();
  const now = new Date();

  let org = await db.findOne('organizations', { slug: ORG_SLUG });
  if (!org) {
    org = await db.insert('organizations', {
      name: catalog.store.name,
      slug: ORG_SLUG,
      email: catalog.store.email,
      phone: catalog.store.phoneDisplay,
      is_active: true,
      site_key: SITE_KEY,
      created_at: now,
      updated_at: now,
    });

    const roles = await seedDefaultRolesForOrganization(org.id, db);
    await db.insert('users', {
      name: 'TechMart Admin',
      email: ADMIN_EMAIL,
      password: await hashPassword('password'),
      organization_id: org.id,
      role_id: roles.Admin.id,
      is_super_admin: false,
      created_at: now,
      updated_at: now,
    });
  } else if (org.site_key !== SITE_KEY) {
    await db.updateById('organizations', org.id, {
      site_key: SITE_KEY,
      name: catalog.store.name,
      updated_at: now,
    });
    org.site_key = SITE_KEY;
  }

  const orgId = org.id as number;

  // Wipe previous catalog rows so re-seed stays deterministic.
  await db.remove('products', { organization_id: orgId });
  await db.remove('product_types', { organization_id: orgId });

  const mediaByFile: Record<string, { id: number; file_path: string }> = {};
  const assetFiles = [
    'logo.svg',
    'hero.svg',
    ...catalog.products.map((product) => product.image),
  ];

  for (const file of [...new Set(assetFiles)]) {
    const published = ensureMediaFile(file);
    const existing = await db.findOne('media', {
      organization_id: orgId,
      file_name: published.file_name,
    });
    if (existing) {
      mediaByFile[file] = { id: existing.id, file_path: existing.file_path };
      continue;
    }
    const row = await db.insert('media', {
      organization_id: orgId,
      title: file.replace(/\.svg$/, '').replace(/-/g, ' '),
      file_name: published.file_name,
      file_type: 'image/svg+xml',
      file_path: published.file_path,
      file_size: published.file_size,
      created_at: now,
      updated_at: now,
    });
    mediaByFile[file] = { id: row.id, file_path: row.file_path };
  }

  const typeIds: Record<string, number> = {};
  for (const type of catalog.types) {
    const row = await db.insert('product_types', {
      organization_id: orgId,
      name: type.name,
      slug: type.slug,
      description: type.description,
      field_schema: JSON.stringify(type.fields.map((name) => field(name))),
      status: true,
      created_at: now,
      updated_at: now,
    });
    typeIds[type.slug] = row.id;
  }

  for (const product of catalog.products) {
    const typeId = typeIds[product.type];
    if (!typeId) throw new Error(`Missing product type for ${product.slug}`);
    const media = mediaByFile[product.image];
    await db.insert('products', {
      organization_id: orgId,
      product_type_id: typeId,
      title: product.title,
      slug: product.slug,
      description: product.description,
      field_values: JSON.stringify(product.values),
      media_ids: JSON.stringify(media ? [media.id] : []),
      additional: JSON.stringify({ category: product.type }),
      status: true,
      created_at: now,
      updated_at: now,
    });
  }

  // Replace nav / footer / slider / pages on each seed.
  await db.remove('navbars', { organization_id: orgId });
  await db.remove('footers', { organization_id: orgId });
  await db.remove('sliders', { organization_id: orgId });
  await db.remove('pages', { organization_id: orgId });
  await db.remove('menu_items', { organization_id: orgId });

  const navItems = [];
  for (const item of catalog.nav) {
    // Storefront filters by product_type id; keep slug in link for CMS clarity,
    // storefront resolves slug → id at runtime.
    navItems.push(
      await db.insert('menu_items', {
        organization_id: orgId,
        title: item.label,
        title_bn: item.label,
        link: item.href,
        parent_id: null,
        created_at: now,
        updated_at: now,
      }),
    );
  }

  const supportItem = await db.insert('menu_items', {
    organization_id: orgId,
    title: 'Support',
    title_bn: 'Support',
    link: `mailto:${catalog.store.email}`,
    parent_id: null,
    created_at: now,
    updated_at: now,
  });

  const logo = mediaByFile['logo.svg'];
  const hero = mediaByFile['hero.svg'];

  await db.insert('navbars', {
    organization_id: orgId,
    title_en: catalog.store.name,
    title_bn: catalog.store.name,
    logo_id: logo?.id || null,
    menu_item_ids: JSON.stringify(navItems.map((item) => item.id)),
    created_at: now,
    updated_at: now,
  });

  await db.insert('footers', {
    organization_id: orgId,
    title_en: catalog.store.name,
    title_bn: catalog.store.name,
    logo_id: logo?.id || null,
    address1_title_en: 'Visit',
    address1_description_en: catalog.store.address,
    address1_status: 1,
    address2_title_en: 'Call',
    address2_description_en: catalog.store.phoneDisplay,
    address2_status: 1,
    column2_menu_item_ids: JSON.stringify(navItems.map((item) => item.id)),
    column2_status: 1,
    column3_menu_item_ids: JSON.stringify([supportItem.id]),
    column3_status: 1,
    column4_title_en: 'Hours',
    column4_text_en: catalog.store.hours,
    column4_status: 1,
    bottom_menu_item_ids: JSON.stringify([supportItem.id]),
    created_at: now,
    updated_at: now,
  });

  await db.insert('sliders', {
    organization_id: orgId,
    type: 'image',
    title_en: catalog.store.eyebrow,
    title_bn: catalog.store.eyebrow,
    description_en: catalog.store.tagline,
    description_bn: catalog.store.tagline,
    media_ids: JSON.stringify(hero ? [hero.id] : []),
    card_ids: JSON.stringify([]),
    additional: JSON.stringify({
      cta_label: 'Shop IT gear',
      cta_href: '/shop',
      highlights: catalog.highlights,
    }),
    status: 1,
    created_at: now,
    updated_at: now,
  });

  await db.insert('pages', {
    organization_id: orgId,
    slug: 'home',
    type: 'Page',
    page_name_en: catalog.store.name,
    page_name_bn: catalog.store.name,
    head: JSON.stringify({
      title: catalog.store.name,
      description: catalog.store.tagline,
      keywords: ['laptop', 'mobile', 'camera', 'router', 'electronics'],
    }),
    body: JSON.stringify([
      {
        _id: 'section-hero',
        title: 'Hero',
        layout: 'hero',
        data: [
          {
            _id: 'hero-copy',
            type: 'titledescription',
            _mave: {
              eyebrow: catalog.store.eyebrow,
              title: catalog.store.name,
              description: `<p>${catalog.store.tagline}</p>`,
              link: '/shop',
              linkType: 'independent',
              isExternal: false,
              target: '_self',
            },
          },
          {
            _id: 'hero-media',
            type: 'media',
            id: hero?.id,
            _mave: hero
              ? {
                  id: hero.id,
                  file_path: hero.file_path,
                  title: 'TechMart hero',
                }
              : {},
          },
        ],
      },
      {
        _id: 'section-catalog',
        title: 'Catalog',
        layout: 'products',
        data: catalog.types.map((type) => ({
          _id: `products-${type.slug}`,
          type: 'product',
          product_type: type.slug,
        })),
      },
    ]),
    additional: JSON.stringify([
      {
        pageType: 'Page',
        metaTitle: catalog.store.name,
        metaDescription: catalog.store.tagline,
        keywords: ['IT', 'electronics'],
      },
    ]),
    status: true,
    created_at: now,
    updated_at: now,
  });

  const orderForm = await seedOrderForm(db, orgId, now);

  console.log(`Seeded TechMart IT store. CMS login: ${ADMIN_EMAIL} / password`);
  console.log(`Public site key: ${SITE_KEY}`);
  console.log(`Order form id: ${orderForm.id}`);
}
