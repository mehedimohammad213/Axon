const AppError = require('../utils/AppError');
const PageModel = require('../models/PageModel');
const { assertPageSlugAvailable } = require('../utils/uniqueness');

async function list({ type, page, limit } = {}) {
  if (type) {
    return PageModel.findByTypePaginated(type, { page, limit });
  }

  return PageModel.findAllSummaryPaginated({ page, limit });
}

async function show(id) {
  const page = await PageModel.findByIdOrSlug(id);
  if (!page) throw new AppError(404, 'Page not found');
  return page;
}

async function create(body, actor = null) {
  if (!body.page_name_en) {
    throw new AppError(422, 'Validation failed', {
      page_name_en: ['The page_name_en field is required.'],
    });
  }

  await assertPageSlugAvailable(body.slug, body.type);

  return PageModel.createPage(body, actor);
}

async function update(id, body, actor = null) {
  const page = await PageModel.findById(id);
  if (!page) throw new AppError(404, 'Page not found');

  if (!body.page_name_en) {
    throw new AppError(422, 'Validation failed', {
      page_name_en: ['The page_name_en field is required.'],
    });
  }

  if (body.slug !== undefined || body.type !== undefined) {
    await assertPageSlugAvailable(
      body.slug !== undefined ? body.slug : page.slug,
      body.type !== undefined ? body.type : page.type,
      page.id
    );
  }

  return PageModel.updatePage(id, body, page, actor);
}

async function remove(id) {
  const page = await PageModel.findById(id);
  if (!page) throw new AppError(404, 'Page not found');

  await PageModel.remove(id);
  return 'Page';
}

async function listPublished({ type, page, limit } = {}) {
  return PageModel.findPublishedPaginated({ type, page, limit });
}

async function getPublishedBySlug(slug) {
  const page = await PageModel.findPublishedByIdOrSlug(slug);
  if (!page) throw new AppError(404, 'Page not found');
  return page;
}

module.exports = {
  list, show, create, update, remove, listPublished, getPublishedBySlug,
};
