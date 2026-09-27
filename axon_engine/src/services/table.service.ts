import AppError from '../utils/AppError';
import TableRepository from '../repositories/table.repository';
import { validateCreateTableBody, validateUpdateTableBody } from '../validators/table.validator';
import type { CreateTableInput, UpdateTableInput } from '../models/table.model';

async function list({ page, limit }: { page?: number; limit?: number } = {}) {
  return TableRepository.findPaginated({ page, limit });
}

async function show(id: any) {
  const table = await TableRepository.findById(id);
  if (!table) throw new AppError(404, 'Table not found');
  return table;
}

async function create(body: CreateTableInput) {
  return TableRepository.create(validateCreateTableBody(body));
}

async function update(id: any, body: UpdateTableInput) {
  const table = await TableRepository.findById(id);
  if (!table) throw new AppError(404, 'Table not found');
  return TableRepository.update(id, validateUpdateTableBody(body));
}

async function remove(id: any) {
  const table = await TableRepository.findById(id);
  if (!table) throw new AppError(404, 'Table not found');
  await TableRepository.remove(id);
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
