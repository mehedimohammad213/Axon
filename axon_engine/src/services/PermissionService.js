const AppError = require('../utils/AppError');
const PermissionModel = require('../models/PermissionModel');

async function list() {
  return PermissionModel.findAllOrdered();
}

async function getById(id) {
  const permission = await PermissionModel.findById(id);
  if (!permission) throw new AppError(404, 'Permission not found');
  return permission;
}

async function create(body) {
  const {
    category, title, description, slug,
    api_request_type, api_endpoint, sl_no, status,
  } = body;

  return PermissionModel.create({
    category, title, description, slug,
    api_request_type, api_endpoint, sl_no, status,
  });
}

async function update(id, body) {
  const permission = await PermissionModel.findById(id);
  if (!permission) throw new AppError(404, 'Permission not found');

  const fields = [
    'category', 'title', 'description', 'slug',
    'api_request_type', 'api_endpoint', 'sl_no', 'status',
  ];
  const updates = {};
  fields.forEach((field) => {
    if (body[field] !== undefined) updates[field] = body[field];
  });

  return PermissionModel.update(id, updates);
}

async function remove(id) {
  await PermissionModel.remove(id);
  return 'Permission';
}

module.exports = { list, getById, create, update, remove };
