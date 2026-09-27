import AppError from '../utils/AppError';
import DynamicRepository from '../repositories/dynamic.repository';
import {
  parseFields,
  requireModelQuery,
  requireModelQueryForList,
  validateDynamicFields,
} from '../validators/dynamic.validator';
import type { DynamicListQuery } from '../models/dynamic.model';

async function list({
  model,
  architecture,
  page,
  limit,
  requireActive = false,
}: DynamicListQuery) {
  if (architecture) {
    const genModel = await DynamicRepository.findArchitecture(architecture);
    return genModel || { message: 'Model not found' };
  }

  requireModelQueryForList(model);
  await DynamicRepository.assertAllowedTable(model, { requireActive });
  return DynamicRepository.findAllRecords(model, { page, limit });
}

async function getById(
  model: string | undefined,
  id: any,
  { requireActive = false }: { requireActive?: boolean } = {}
) {
  requireModelQuery(model);
  await DynamicRepository.assertAllowedTable(model, { requireActive });

  const record = await DynamicRepository.findRecord(model, id);
  if (!record) throw new AppError(404, 'Record not found');
  return record;
}

async function create(model: string | undefined, body: any) {
  requireModelQuery(model);
  const registered = await DynamicRepository.assertAllowedTable(model);
  const fields = parseFields(registered.fields);

  const errors = validateDynamicFields(fields, body);
  if (errors) throw new AppError(422, 'Validation failed', errors);

  return DynamicRepository.createRecord(model, body, fields);
}

async function update(model: string | undefined, id: any, body: any) {
  requireModelQuery(model);
  const registered = await DynamicRepository.assertAllowedTable(model);
  const fields = parseFields(registered.fields);

  const record = await DynamicRepository.findRecord(model, id);
  if (!record) throw new AppError(404, 'Record not found');

  const errors = validateDynamicFields(fields, body, { partial: true });
  if (errors) throw new AppError(422, 'Validation failed', errors);

  return DynamicRepository.updateRecord(model, id, body, fields);
}

async function remove(model: string | undefined, id: any) {
  requireModelQuery(model);
  await DynamicRepository.assertAllowedTable(model);

  const record = await DynamicRepository.findRecord(model, id);
  if (!record) throw new AppError(404, 'Record not found');

  await DynamicRepository.deleteRecord(model, id);
  return 'Record';
}

export default {
  list,
  getById,
  create,
  update,
  remove,
};
export { list, getById, create, update, remove };
