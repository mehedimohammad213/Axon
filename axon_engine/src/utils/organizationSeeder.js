const fs = require('fs');
const path = require('path');
const {
  generateSiteKey,
  seedDefaultRolesForOrganization,
  hashPassword,
  extractComponentsFromArray,
  sortRecursive,
} = require('./helpers');

const FIXTURE_ROOT = path.join(__dirname, '../seeds/data');

function jsonValue(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    try {
      JSON.parse(value);
      return value;
    } catch {
      return JSON.stringify(value);
    }
  }
  return JSON.stringify(value);
}

async function upsertByKeys(db, table, match, payload) {
  const existing = await db.findOne(table, match);
  const now = new Date();

  if (existing) {
    await db.update(table, { id: existing.id }, { ...payload, updated_at: now });
    return { ...existing, ...payload };
  }

  return db.insert(table, { ...match, ...payload, created_at: now, updated_at: now });
}

async function ensureAdminRole(db, organizationId) {
  let adminRole = await db.findOne('roles', { organization_id: organizationId, title: 'Admin' });

  if (!adminRole) {
    const roles = await seedDefaultRolesForOrganization(organizationId, db);
    adminRole = roles.Admin;
  }

  return adminRole;
}

async function ensureOrganization(db, config) {
  const password = config.password || 'password';
  const now = new Date();
  const { transaction } = require('../db');

  return transaction(async (trx) => {
    let organization = await trx.findOne('organizations', { slug: config.slug });

    if (!organization) {
      organization = await trx.insert('organizations', {
        name: config.name,
        slug: config.slug,
        email: config.email || null,
        phone: config.phone || null,
        is_active: true,
        site_key: generateSiteKey(),
        created_at: now,
        updated_at: now,
      });

      await seedDefaultRolesForOrganization(organization.id, trx);
    } else if (!organization.site_key) {
      await trx.update('organizations', { id: organization.id }, {
        site_key: generateSiteKey(),
        updated_at: now,
      });
      organization = await trx.findOne('organizations', { id: organization.id });
    }

    const adminRole = await ensureAdminRole(trx, organization.id);
    const hashedPassword = await hashPassword(password);

    const userPayload = {
      name: config.adminName,
      password: hashedPassword,
      organization_id: organization.id,
      role_id: adminRole.id,
      is_license_active: true,
      updated_at: now,
    };

    const existingUser = await trx.findOne('users', { email: config.adminEmail });
    if (existingUser) {
      await trx.update('users', { id: existingUser.id }, userPayload);
    } else {
      await trx.insert('users', {
        ...userPayload,
        email: config.adminEmail,
        created_at: now,
      });
    }

    return organization;
  });
}

function readFixture(fixtureSubdir, file) {
  const filePath = path.join(FIXTURE_ROOT, fixtureSubdir, `${file}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function fetchJson(url, timeoutMs = 120000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }

    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function loadSourceData(config, options = {}) {
  const fixtureSubdir = config.fixtureSubdir;
  const requiredKeys = { ...config.requiredFixtures };
  const optionalKeys = config.optionalFixtures || {};

  if (!options.forceApi && fixtureSubdir) {
    const allPresent = Object.keys(requiredKeys).every((file) =>
      fs.existsSync(path.join(FIXTURE_ROOT, fixtureSubdir, `${file}.json`))
    );

    if (allPresent) {
      console.log(`Loading ${config.label} fixtures from src/seeds/data/${fixtureSubdir}`);
      const data = {};
      for (const [key, file] of Object.entries(requiredKeys)) {
        data[key] = readFixture(fixtureSubdir, file);
      }
      for (const [key, file] of Object.entries(optionalKeys)) {
        data[key] = readFixture(fixtureSubdir, file) || [];
      }
      return data;
    }
  }

  if (!config.apiBase) {
    throw new Error(`${config.label}: no local fixtures and no apiBase configured`);
  }

  console.warn(`${config.label}: fixtures missing — fetching from ${config.apiBase}`);
  return fetchSourceDataFromApi(config);
}

async function fetchPagesByType(config) {
  const pages = [];

  for (const type of config.pageTypes || ['Page', 'Footer']) {
    const summaries = await fetchJson(`${config.apiBase}/pages?type=${encodeURIComponent(type)}`);
    for (const summary of summaries) {
      const id = summary.id;
      if (!id) continue;

      try {
        const page = await fetchJson(`${config.apiBase}/pages/${id}`);
        pages.push(page);
        const name = summary.page_name_en || summary.slug || id;
        console.log(`  fetched page /${id} (${name})`);
      } catch (err) {
        console.warn(`  failed page /${id}: ${err.message}`);
      }
    }
  }

  console.log(`  pages total: ${pages.length}`);
  return pages;
}

async function fetchPagesList(config) {
  const pages = await fetchJson(`${config.apiBase}/pages`);
  console.log(`  fetched /pages (${pages.length})`);

  for (let i = 0; i < pages.length; i += 1) {
    if (pages[i].body && (Array.isArray(pages[i].body) ? pages[i].body.length : true)) {
      continue;
    }

    const id = pages[i].id;
    if (!id) continue;

    try {
      pages[i] = await fetchJson(`${config.apiBase}/pages/${id}`);
      const name = pages[i].page_name_en || pages[i].slug || id;
      console.log(`  fetched page body /${id} (${name})`);
    } catch (err) {
      console.warn(`  failed page body /${id}: ${err.message}`);
    }
  }

  return pages;
}

async function fetchSourceDataFromApi(config) {
  if (!config.apiBase) {
    throw new Error(`${config.label}: apiBase is required to fetch fixtures`);
  }

  console.log(`Fetching ${config.label} content from ${config.apiBase}`);

  const data = {};
  const apiMap = config.apiMap || {};

  for (const [key, endpoint] of Object.entries(apiMap)) {
    data[key] = await fetchJson(`${config.apiBase}/${endpoint}`);
    console.log(`  fetched /${endpoint} (${(data[key] || []).length})`);
  }

  const optionalKeys = config.optionalFixtures || {};
  for (const key of Object.keys(optionalKeys)) {
    if (!data[key]) data[key] = [];
  }

  if (config.pagesFetch === 'by_type') {
    data.pages = await fetchPagesByType(config);
  } else if (config.pagesFetch === 'list') {
    data.pages = await fetchPagesList(config);
  } else if (!data.pages && config.requiredFixtures?.pages) {
    data.pages = [];
  }

  return data;
}

function saveFixtures(config, data) {
  const fixtureSubdir = config.fixtureSubdir;
  if (!fixtureSubdir) {
    throw new Error(`${config.label}: fixtureSubdir is required to save fixtures`);
  }

  const dir = path.join(FIXTURE_ROOT, fixtureSubdir);
  fs.mkdirSync(dir, { recursive: true });

  const files = {
    ...config.requiredFixtures,
    ...(config.optionalFixtures || {}),
  };

  for (const [key, file] of Object.entries(files)) {
    const filePath = path.join(dir, `${file}.json`);
    fs.writeFileSync(filePath, `${JSON.stringify(data[key] ?? [], null, 2)}\n`);
    console.log(`  wrote ${filePath}`);
  }
}

function createIdMapper(config) {
  const idMaps = {
    media: {},
    menuitem: {},
    menu: {},
    navbar: {},
    footer: {},
    card: {},
    slider: {},
    form: {},
    form_builder: {},
  };

  let fallbackMediaId = null;

  function map(key, oldId) {
    if (oldId === null || oldId === undefined || oldId === '' || oldId === false) {
      return null;
    }
    return idMaps[key][parseInt(oldId, 10)] ?? null;
  }

  function mapMediaOrFallback(oldId) {
    const mapped = map('media', oldId);
    if (mapped !== null) return mapped;
    if (fallbackMediaId !== null) return fallbackMediaId;
    throw new Error('Fallback media was not created');
  }

  function setFallbackMediaId(id) {
    fallbackMediaId = id;
  }

  function mapComponentId(type, oldId) {
    switch (type) {
      case 'media':
        return map('media', oldId);
      case 'card':
      case 'cards':
        return map('card', oldId);
      case 'slider':
        return map('slider', oldId);
      case 'menu':
        return map('menu', oldId);
      case 'navbar':
        return map('navbar', oldId);
      case 'footer':
        return map('footer', oldId);
      case 'form':
        return map('form', oldId);
      default:
        return null;
    }
  }

  function remapIdField(field, value) {
    const mapKey = {
      media_ids: 'media',
      logo_id: 'media',
      favicon_id: 'media',
      card_ids: 'card',
      menu_item_ids: 'menuitem',
      menu_id: 'menu',
      formId: 'form',
      form_id: 'form',
    }[field];

    if (!mapKey) return value;

    if (Array.isArray(value)) {
      return value.map((id) => map(mapKey, id)).filter((id) => id !== null);
    }

    return map(mapKey, value);
  }

  function remapEmbeddedHeadless(type, embedded) {
    if (embedded.id && type) {
      const mapped = mapComponentId(type, embedded.id);
      if (mapped !== null) embedded.id = mapped;
    }

    for (const field of ['media_ids', 'card_ids', 'menu_item_ids', 'logo_id', 'menu_id', 'favicon_id']) {
      if (Object.prototype.hasOwnProperty.call(embedded, field)) {
        embedded[field] = remapIdField(field, embedded[field]);
      }
    }

    if (Array.isArray(embedded.images)) {
      embedded.images = embedded.images.map((image) => {
        if (image && typeof image === 'object' && image.id) {
          const mapped = map('media', image.id);
          if (mapped !== null) return { ...image, id: mapped };
        }
        return image;
      });
    }

    if (Array.isArray(embedded.cards)) {
      embedded.cards = embedded.cards.map((card) => {
        if (!card || typeof card !== 'object') return card;
        const next = { ...card };
        if (next.id) {
          const mapped = map('card', next.id);
          if (mapped !== null) next.id = mapped;
        }
        if (Object.prototype.hasOwnProperty.call(next, 'media_ids')) {
          next.media_ids = remapIdField('media_ids', next.media_ids);
        }
        return next;
      });
    }

    if (Array.isArray(embedded.menu_items)) {
      embedded.menu_items = embedded.menu_items.map((item) => {
        if (item && typeof item === 'object' && item.id) {
          const mapped = map('menuitem', item.id);
          if (mapped !== null) return { ...item, id: mapped };
        }
        return item;
      });
    }

    if (Array.isArray(embedded.medias)) {
      embedded.medias = embedded.medias.map((media) => {
        if (media && typeof media === 'object' && media.id) {
          const mapped = map('media', media.id);
          if (mapped !== null) return { ...media, id: mapped };
        }
        return media;
      });
    }

    return embedded;
  }

  function remapPageBody(node, parentType = null) {
    if (!node || typeof node !== 'object') return node;

    if (Array.isArray(node)) {
      return node.map((child) => remapPageBody(child, parentType));
    }

    const next = { ...node };

    if (config.maveKeyMode === 'headless_only' && Object.prototype.hasOwnProperty.call(next, '_mave')) {
      next._headless = next._mave;
      delete next._mave;
    } else if (config.maveKeyMode === 'both') {
      if (Object.prototype.hasOwnProperty.call(next, '_mave') && !Object.prototype.hasOwnProperty.call(next, '_headless')) {
        next._headless = next._mave;
      }
      if (Object.prototype.hasOwnProperty.call(next, '_headless') && !Object.prototype.hasOwnProperty.call(next, '_mave')) {
        next._mave = next._headless;
      }
    }

    const type = typeof next.type === 'string' ? next.type : parentType;

    if (next.id && type && !Number.isNaN(Number(next.id))) {
      const mapped = mapComponentId(type, Number(next.id));
      if (mapped !== null) next.id = mapped;
    }

    for (const field of [
      'media_ids',
      'card_ids',
      'menu_item_ids',
      'logo_id',
      'menu_id',
      'favicon_id',
      'formId',
      'form_id',
    ]) {
      if (Object.prototype.hasOwnProperty.call(next, field)) {
        next[field] = remapIdField(field, next[field]);
      }
    }

    if (next._headless && typeof next._headless === 'object') {
      next._headless = remapEmbeddedHeadless(type, { ...next._headless });
    }

    for (const [key, value] of Object.entries(next)) {
      if (key === '_headless') continue;
      if (value && typeof value === 'object') {
        next[key] = remapPageBody(value, type);
      }
    }

    return next;
  }

  return {
    idMaps,
    map,
    mapMediaOrFallback,
    setFallbackMediaId,
    remapPageBody,
  };
}

async function maybeDownloadMediaFile(mediaBase, filePath, uploadDir) {
  if (!filePath || !mediaBase) return;

  const relative = filePath.replace(/^\//, '');
  const dest = path.join(uploadDir, relative);

  if (fs.existsSync(dest)) return;

  fs.mkdirSync(path.dirname(dest), { recursive: true });

  try {
    const response = await fetch(`${mediaBase}/${relative}`);
    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(dest, buffer);
    }
  } catch (err) {
    console.warn(`Media download failed for ${relative}: ${err.message}`);
  }
}

async function seedOrganizationContent(db, organization, config, data) {
  const mapper = createIdMapper(config);
  const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads/media');
  const downloadMedia = config.downloadMediaEnv
    ? process.env[config.downloadMediaEnv] === 'true'
    : false;
  const { transaction } = require('../db');

  await transaction(async (trx) => {
    for (const row of data.media || []) {
      const oldId = parseInt(row.id, 10);
      const fileName = row.file_name;
      if (!fileName) continue;

      const media = await upsertByKeys(
        trx,
        'media',
        { organization_id: organization.id, file_name: fileName },
        {
          title: row.title || fileName,
          file_type: row.file_type || 'application/octet-stream',
          file_path: row.file_path || `media/${fileName}`,
          file_size: row.file_size || 0,
          tags: jsonValue(row.tags ?? null),
        }
      );

      mapper.idMaps.media[oldId] = media.id;

      if (downloadMedia) {
        await maybeDownloadMediaFile(config.mediaBase, media.file_path, uploadDir);
      }
    }

    console.log(`Media: ${Object.keys(mapper.idMaps.media).length}`);

    if (config.features?.fallbackMedia) {
      const placeholder = config.placeholder || {};
      const fallback = await upsertByKeys(
        trx,
        'media',
        { organization_id: organization.id, file_name: placeholder.fileName },
        {
          title: placeholder.title || 'Placeholder',
          file_type: 'image/webp',
          file_path: `media/${placeholder.fileName}`,
          file_size: 0,
          tags: jsonValue(['placeholder', 'seeder']),
        }
      );
      mapper.setFallbackMediaId(fallback.id);
    }

    for (const row of data.menuitems || []) {
      const oldId = parseInt(row.id, 10);
      const item = await upsertByKeys(
        trx,
        'menu_items',
        {
          organization_id: organization.id,
          title: row.title,
          link: row.link || '/',
        },
        {
          title_bn: row.title_bn || 'N/A',
          parent_id: null,
        }
      );
      mapper.idMaps.menuitem[oldId] = item.id;
    }

    for (const row of data.menuitems || []) {
      const oldParent = row.parent_id;
      if (oldParent === null || oldParent === undefined || oldParent === '' || parseInt(oldParent, 10) === 0) {
        continue;
      }
      const newId = mapper.idMaps.menuitem[parseInt(row.id, 10)];
      const newParent = mapper.idMaps.menuitem[parseInt(oldParent, 10)];
      if (newId && newParent) {
        await trx.update('menu_items', { id: newId }, { parent_id: newParent, updated_at: new Date() });
      }
    }

    console.log(`Menu items: ${Object.keys(mapper.idMaps.menuitem).length}`);

    for (const row of data.menus || []) {
      const oldId = parseInt(row.id, 10);
      const itemIds = (row.menu_item_ids || [])
        .map((id) => mapper.idMaps.menuitem[parseInt(id, 10)])
        .filter((id) => id);

      const menu = await upsertByKeys(
        trx,
        'menus',
        { organization_id: organization.id, name: row.name },
        { menu_item_ids: jsonValue(itemIds) }
      );
      mapper.idMaps.menu[oldId] = menu.id;
    }

    console.log(`Menus: ${Object.keys(mapper.idMaps.menu).length}`);

    for (const row of data.navbars || []) {
      const oldId = parseInt(row.id, 10);
      const titleEn = row.title_en || row.title_bn || `Navbar ${oldId}`;
      const logoId = config.features?.fallbackMedia
        ? mapper.mapMediaOrFallback(row.logo_id)
        : mapper.map('media', row.logo_id);

      const navbar = await upsertByKeys(
        trx,
        'navbars',
        { organization_id: organization.id, title_en: titleEn },
        {
          title_bn: row.title_bn || titleEn,
          menu_id: mapper.map('menu', row.menu_id),
          logo_id: logoId,
        }
      );
      mapper.idMaps.navbar[oldId] = navbar.id;
    }

    console.log(`Navbars: ${Object.keys(mapper.idMaps.navbar).length}`);

    if (config.features?.footers !== false) {
      for (const row of data.footers || []) {
        const oldId = parseInt(row.id, 10);
        let column3Logos = row.column3_logos;
        if (Array.isArray(column3Logos)) {
          column3Logos = column3Logos.map((logo) => {
            if (logo && typeof logo === 'object' && logo.image !== undefined) {
              return { ...logo, image: mapper.map('media', logo.image) };
            }
            return logo;
          });
        }

        const footer = await upsertByKeys(
          trx,
          'footers',
          { organization_id: organization.id, title_en: row.title_en },
          {
            title_bn: row.title_bn || row.title_en,
            footer_status: row.footer_status ?? 1,
            logo_id: row.logo_id
              ? mapper.mapMediaOrFallback(row.logo_id)
              : mapper.mapMediaOrFallback(null),
            address1_title_en: row.address1_title_en ?? null,
            address1_title_bn: row.address1_title_bn ?? null,
            address1_description_en: row.address1_description_en ?? null,
            address1_description_bn: row.address1_description_bn ?? null,
            address2_title_en: row.address2_title_en ?? null,
            address2_title_bn: row.address2_title_bn ?? null,
            address2_description_en: row.address2_description_en ?? null,
            address2_description_bn: row.address2_description_bn ?? null,
            address1_status: row.address1_status ?? 1,
            address2_status: row.address2_status ?? 1,
            column2_menu_id: mapper.map('menu', row.column2_menu_id),
            column2_status: row.column2_status ?? 1,
            column3_menu_id: mapper.map('menu', row.column3_menu_id),
            column3_logos: jsonValue(column3Logos),
            column3_status: row.column3_status ?? 1,
            column4_title_en: row.column4_title_en ?? null,
            column4_title_bn: row.column4_title_bn ?? null,
            column4_image: mapper.map('media', row.column4_image),
            column4_text_en: row.column4_text_en ?? null,
            column4_text_bn: row.column4_text_bn ?? null,
            column4_menu_id: mapper.map('menu', row.column4_menu_id),
            column4_description_en: row.column4_description_en ?? null,
            column4_description_bn: row.column4_description_bn ?? null,
            column4_status: row.column4_status ?? 1,
            bottom_menu_id: mapper.map('menu', row.bottom_menu_id),
          }
        );
        mapper.idMaps.footer[oldId] = footer.id;
      }

      console.log(`Footers: ${Object.keys(mapper.idMaps.footer).length}`);
    }

    for (const row of data.cards || []) {
      const oldId = parseInt(row.id, 10);
      const card = await upsertByKeys(
        trx,
        'cards',
        { organization_id: organization.id, title_en: row.title_en },
        {
          page_name: row.page_name ?? null,
          media_ids: mapper.map('media', row.media_ids),
          title_bn: row.title_bn ?? null,
          description_en: row.description_en ?? null,
          description_bn: row.description_bn ?? null,
          link_url: row.link_url ?? null,
          additional: jsonValue(row.additional ?? null),
          status: row.status ?? true,
        }
      );
      mapper.idMaps.card[oldId] = card.id;
    }

    console.log(`Cards: ${Object.keys(mapper.idMaps.card).length}`);

    for (const row of data.sliders || []) {
      const oldId = parseInt(row.id, 10);
      const mediaIds = (row.media_ids || [])
        .map((id) => mapper.map('media', id))
        .filter((id) => id !== null);
      const cardIds = (row.card_ids || [])
        .map((id) => mapper.map('card', id))
        .filter((id) => id !== null);

      const slider = await upsertByKeys(
        trx,
        'sliders',
        { organization_id: organization.id, title_en: row.title_en },
        {
          type: row.type || 'image',
          title_bn: row.title_bn ?? null,
          description_en: row.description_en ?? null,
          description_bn: row.description_bn ?? null,
          media_ids: jsonValue(mediaIds),
          card_ids: jsonValue(cardIds),
          additional: jsonValue(row.additional ?? null),
          status: row.status ?? 1,
        }
      );
      mapper.idMaps.slider[oldId] = slider.id;
    }

    console.log(`Sliders: ${Object.keys(mapper.idMaps.slider).length}`);

    if (config.features?.forms !== false) {
      for (const row of data.forms || []) {
        const oldId = parseInt(row.id, 10);
        const form = await upsertByKeys(
          trx,
          'forms',
          { organization_id: organization.id, title_en: row.title_en },
          {
            title_bn: row.title_bn ?? null,
            description_en: row.description_en ?? null,
            description_bn: row.description_bn ?? null,
            fields: jsonValue(row.fields || []),
            submit_direction: row.submit_direction ?? null,
            status: row.status ?? true,
          }
        );
        mapper.idMaps.form[oldId] = form.id;
      }

      console.log(`Forms: ${(data.forms || []).length}`);
    }

    if (config.features?.formBuilders !== false) {
      for (const row of data.form_builders || []) {
        const oldId = parseInt(row.id, 10);
        const attributes = { ...(row.attributes || {}) };
        if (attributes.action_url) {
          attributes.action_url = '/api/form-submission';
        }

        const formBuilder = await upsertByKeys(
          trx,
          'form_builder',
          { organization_id: organization.id, title: row.title },
          {
            description: row.description ?? null,
            attributes: jsonValue(attributes),
            elements: jsonValue(row.elements || []),
            additional: jsonValue(row.additional ?? null),
            status: row.status ?? true,
          }
        );

        mapper.idMaps.form[oldId] = formBuilder.id;
        mapper.idMaps.form_builder[oldId] = formBuilder.id;

        if (attributes.action_url !== undefined) {
          attributes.action_url = `/api/form-submission?form_id=${formBuilder.id}`;
          await trx.update('form_builder', { id: formBuilder.id }, {
            attributes: jsonValue(attributes),
            updated_at: new Date(),
          });
        }
      }

      console.log(`Form builders: ${Object.keys(mapper.idMaps.form_builder).length}`);
    }

    let pageCount = 0;
    for (const row of data.pages || []) {
      const body = mapper.remapPageBody(row.body || []);
      const bodyRaw = sortRecursive(extractComponentsFromArray(body));

      await upsertByKeys(
        trx,
        'pages',
        {
          organization_id: organization.id,
          page_name_en: row.page_name_en,
          slug: row.slug ?? null,
        },
        {
          type: row.type || 'Page',
          favicon_id: mapper.map('media', row.favicon_id),
          page_name_bn: row.page_name_bn || row.page_name_en,
          head: jsonValue(row.head ?? null),
          body: jsonValue(body),
          body_raw: jsonValue(bodyRaw),
          additional: jsonValue(row.additional ?? null),
          status: row.status ?? true,
        }
      );
      pageCount += 1;
    }

    console.log(`Pages: ${pageCount}`);
  });
}

async function runOrganizationSeeder(db, config) {
  const organization = await ensureOrganization(db, config);
  const data = await loadSourceData(config);
  await seedOrganizationContent(db, organization, config, data);

  const refreshed = await db.findOne('organizations', { id: organization.id });

  console.log(`${config.label} organization ready.`);
  console.table([
    { Field: 'Organization', Value: refreshed.name },
    { Field: 'Slug', Value: refreshed.slug },
    { Field: 'Admin email', Value: config.adminEmail },
    { Field: 'Admin password', Value: config.password || 'password' },
    { Field: 'Site key', Value: refreshed.site_key },
  ]);
}

module.exports = {
  runOrganizationSeeder,
  ensureOrganization,
  loadSourceData,
  fetchSourceDataFromApi,
  saveFixtures,
  seedOrganizationContent,
};
