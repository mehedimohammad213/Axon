const AppError = require('../utils/AppError');
const FooterModel = require('../models/FooterModel');

async function list({ page, limit } = {}) {
  return FooterModel.findAllWithRelationsPaginated({ page, limit });
}

async function show(id) {
  const footer = await FooterModel.findByIdWithRelations(id);
  if (!footer) throw new AppError(404, 'Footer not found');
  return footer;
}

async function create(body) {
  if (!body.title_en) {
    throw new AppError(422, 'Validation failed', {
      title_en: ['The title_en field is required.'],
    });
  }

  return FooterModel.createFooter(body);
}

async function update(id, body) {
  const footer = await FooterModel.findById(id);
  if (!footer) throw new AppError(404, 'Footer not found');

  return FooterModel.updateFooter(id, body);
}

async function remove(id) {
  const footer = await FooterModel.findById(id);
  if (!footer) throw new AppError(404, 'Footer not found');

  await FooterModel.remove(id);
  return 'Footer';
}

module.exports = { list, show, create, update, remove };
