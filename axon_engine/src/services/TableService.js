const AppError = require('../utils/AppError');
const TableModel = require('../models/TableModel');

async function list({ page, limit } = {}) {
  return TableModel.findPaginated({ page, limit });
}

async function show(id) {
  const table = await TableModel.findById(id);
  if (!table) throw new AppError(404, 'Table not found');
  return table;
}

async function create(body) {
  return TableModel.create(body);
}

async function update(id, body) {
  const table = await TableModel.findById(id);
  if (!table) throw new AppError(404, 'Table not found');
  return TableModel.update(id, body);
}

async function remove(id) {
  const table = await TableModel.findById(id);
  if (!table) throw new AppError(404, 'Table not found');
  await TableModel.remove(id);
  return 'Table';
}

module.exports = { list, show, create, update, remove };
