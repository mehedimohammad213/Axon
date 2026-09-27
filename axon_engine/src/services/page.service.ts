import AppError from '../utils/AppError';
import PageRepository from '../repositories/page.repository';
import { validateCreatePageBody, validateUpdatePageBody } from '../validators/page.validator';
import type { CreatePageInput, UpdatePageInput } from '../models/page.model';

async function list({
  type,
  page,
  limit,
}: { type?: string; page?: number; limit?: number } = {}) {
  if (type) {
    return PageRepository.findByTypePaginated(type, { page, limit });
  }

  return PageRepository.findAllSummaryPaginated({ page, limit });
}

async function show(id: any) {
  const page = await PageRepository.findByIdOrSlug(id);
  if (!page) throw new AppError(404, 'Page not found');
  return page;
}

async function create(body: CreatePageInput) {
  return PageRepository.createPage(validateCreatePageBody(body));
}

async function update(id: any, body: UpdatePageInput) {
  const page = await PageRepository.findById(id);
  if (!page) throw new AppError(404, 'Page not found');

  return PageRepository.updatePage(id, validateUpdatePageBody(body), page);
}

async function remove(id: any) {
  const page = await PageRepository.findById(id);
  if (!page) throw new AppError(404, 'Page not found');

  await PageRepository.remove(id);
  return 'Page';
}

async function listPublished({
  type,
  page,
  limit,
}: { type?: string; page?: number; limit?: number } = {}) {
  return PageRepository.findPublishedPaginated({ type, page, limit });
}

async function getPublishedBySlug(slug: string) {
  const page = await PageRepository.findPublishedByIdOrSlug(slug);
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
