const AppError = require('../utils/AppError');
const MenuModel = require('../models/MenuModel');

async function list({ page, limit } = {}) {
  return MenuModel.findAllWithRelationsPaginated({ page, limit });
}

async function show(id) {
  const menu = await MenuModel.findByIdWithRelations(id);
  if (!menu) throw new AppError(404, 'Menu not found');
  return menu;
}

async function create(body) {
  if (!body.name) {
    throw new AppError(422, 'Validation failed', {
      name: ['The name field is required.'],
    });
  }
  return MenuModel.createMenu(body);
}

async function update(id, body) {
  const menu = await MenuModel.findById(id);
  if (!menu) throw new AppError(404, 'Menu not found');
  return MenuModel.updateMenu(id, body);
}

async function remove(id) {
  const menu = await MenuModel.findById(id);
  if (!menu) throw new AppError(404, 'Menu not found');
  await MenuModel.remove(id);
  return 'Menu';
}

module.exports = { list, show, create, update, remove };
