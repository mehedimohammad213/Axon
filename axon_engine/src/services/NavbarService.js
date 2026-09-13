const AppError = require('../utils/AppError');
const NavbarModel = require('../models/NavbarModel');

async function list({ page, limit } = {}) {
  return NavbarModel.findAllWithRelationsPaginated({ page, limit });
}

async function show(id) {
  const navbar = await NavbarModel.findByIdWithRelations(id);
  if (!navbar) throw new AppError(404, 'Navbar not found');
  return navbar;
}

async function create(body) {
  const errors = {};
  if (!body.title_en) errors.title_en = ['The title_en field is required.'];
  if (!body.logo_id) errors.logo_id = ['The logo_id field is required.'];
  if (!body.menu_id) errors.menu_id = ['The menu_id field is required.'];

  if (Object.keys(errors).length) {
    throw new AppError(422, 'Validation failed', errors);
  }

  return NavbarModel.createNavbar(body);
}

async function update(id, body) {
  const navbar = await NavbarModel.findById(id);
  if (!navbar) throw new AppError(404, 'Navbar not found');

  return NavbarModel.updateNavbar(id, body);
}

async function remove(id) {
  const navbar = await NavbarModel.findById(id);
  if (!navbar) throw new AppError(404, 'Navbar not found');

  await NavbarModel.remove(id);
  return 'Navbar';
}

module.exports = { list, show, create, update, remove };
