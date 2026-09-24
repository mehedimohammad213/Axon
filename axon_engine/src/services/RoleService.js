const AppError = require('../utils/AppError');
const RoleModel = require('../models/RoleModel');
const { assertRoleTitleAvailable } = require('../utils/uniqueness');

async function list() {
  return RoleModel.findAllWithPermissions();
}

async function getById(id) {
  const role = await RoleModel.loadWithPermissions(id);
  if (!role) throw new AppError(404, 'Role not found');
  return role;
}

async function create(body) {
  const { title, description, permission_ids, status } = body;
  await assertRoleTitleAvailable(title);

  return RoleModel.createWithPermissions({
    title: title || null,
    description: description || null,
    status,
    permission_ids,
  });
}

async function update(id, body) {
  if (body.title) {
    await assertRoleTitleAvailable(body.title, null, id);
  }

  const role = await RoleModel.updateWithPermissions(id, body);
  if (!role) throw new AppError(404, 'Role not found');
  return role;
}

async function remove(id) {
  const role = await RoleModel.findById(id);
  if (!role) throw new AppError(404, 'Role not found');

  await RoleModel.remove(id);
  return 'Role';
}

module.exports = { list, getById, create, update, remove };
