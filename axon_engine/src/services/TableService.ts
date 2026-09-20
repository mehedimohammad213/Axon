import AppError from '../utils/AppError';
import TableModel from '../models/TableModel';

async function list({ page, limit }: { page?: number; limit?: number } = {}) {
  return TableModel.findPaginated({ page, limit });
}

async function show(id: any) {
  const table = await TableModel.findById(id);
  if (!table) throw new AppError(404, 'Table not found');
  return table;
}

async function create(body: any) {
  return TableModel.create(body);
}

async function update(id: any, body: any) {
  const table = await TableModel.findById(id);
  if (!table) throw new AppError(404, 'Table not found');
  return TableModel.update(id, body);
}

async function remove(id: any) {
  const table = await TableModel.findById(id);
  if (!table) throw new AppError(404, 'Table not found');
  await TableModel.remove(id);
  return 'Table';
}

export default {
  list,
  show,
  create,
  update,
  remove,
};
export { list, show, create, update, remove };
