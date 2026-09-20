import AppError from '../utils/AppError';
import PageModel from '../models/PageModel';

async function list({
  type,
  page,
  limit,
}: { type?: string; page?: number; limit?: number } = {}) {
  if (type) {
    return PageModel.findByTypePaginated(type, { page, limit });
  }

  return PageModel.findAllSummaryPaginated({ page, limit });
}

async function show(id: any) {
  const page = await PageModel.findByIdOrSlug(id);
  if (!page) throw new AppError(404, 'Page not found');
  return page;
}

async function create(body: any) {
  if (!body.page_name_en) {
    throw new AppError(422, 'Validation failed', {
      page_name_en: ['The page_name_en field is required.'],
    });
  }

  return PageModel.createPage(body);
}

async function update(id: any, body: any) {
  const page = await PageModel.findById(id);
  if (!page) throw new AppError(404, 'Page not found');

  if (!body.page_name_en) {
    throw new AppError(422, 'Validation failed', {
      page_name_en: ['The page_name_en field is required.'],
    });
  }

  return PageModel.updatePage(id, body, page);
}

async function remove(id: any) {
  const page = await PageModel.findById(id);
  if (!page) throw new AppError(404, 'Page not found');

  await PageModel.remove(id);
  return 'Page';
}

async function listPublished({
  type,
  page,
  limit,
}: { type?: string; page?: number; limit?: number } = {}) {
  return PageModel.findPublishedPaginated({ type, page, limit });
}

async function getPublishedBySlug(slug: string) {
  const page = await PageModel.findPublishedByIdOrSlug(slug);
  if (!page) throw new AppError(404, 'Page not found');
  return page;
}

export default {
  list,
  show,
  create,
  update,
  remove,
  listPublished,
  getPublishedBySlug,
};
export { list, show, create, update, remove, listPublished, getPublishedBySlug };
