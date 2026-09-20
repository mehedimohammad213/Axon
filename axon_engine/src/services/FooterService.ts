import AppError from '../utils/AppError';
import FooterModel from '../models/FooterModel';

async function list({ page, limit }: { page?: number; limit?: number } = {}) {
  return FooterModel.findAllWithRelationsPaginated({ page, limit });
}

async function show(id: any) {
  const footer = await FooterModel.findByIdWithRelations(id);
  if (!footer) throw new AppError(404, 'Footer not found');
  return footer;
}

async function create(body: any) {
  if (!body.title_en) {
    throw new AppError(422, 'Validation failed', {
      title_en: ['The title_en field is required.'],
    });
  }

  return FooterModel.createFooter(body);
}

async function update(id: any, body: any) {
  const footer = await FooterModel.findById(id);
  if (!footer) throw new AppError(404, 'Footer not found');

  return FooterModel.updateFooter(id, body);
}

async function remove(id: any) {
  const footer = await FooterModel.findById(id);
  if (!footer) throw new AppError(404, 'Footer not found');

  await FooterModel.remove(id);
  return 'Footer';
}

export default {
  list,
  show,
  create,
  update,
  remove,
};
export { list, show, create, update, remove };
