import AppError from '../utils/AppError';
import DynamicModel from '../models/DynamicModel';

async function list({
  model,
  architecture,
  page,
  limit,
  requireActive = false,
}: {
  model?: string;
  architecture?: string;
  page?: number;
  limit?: number;
  requireActive?: boolean;
}) {
  if (architecture) {
    const genModel = await DynamicModel.findArchitecture(architecture);
    return genModel || { message: 'Model not found' };
  }

  if (!model) {
    throw new AppError(422, 'Validation failed', {
      model: ['The model query parameter is required for listing.'],
    });
  }

  await DynamicModel.assertAllowedTable(model, { requireActive });
  return DynamicModel.findAllRecords(model, { page, limit });
}

async function getById(
  model: string | undefined,
  id: any,
  { requireActive = false }: { requireActive?: boolean } = {}
) {
  if (!model) {
    throw new AppError(422, 'Validation failed', {
      model: ['The model query parameter is required.'],
    });
  }

  await DynamicModel.assertAllowedTable(model, { requireActive });

  const record = await DynamicModel.findRecord(model, id);
  if (!record) throw new AppError(404, 'Record not found');
  return record;
}

async function create(model: string | undefined, body: any) {
  if (!model) {
    throw new AppError(422, 'Validation failed', {
      model: ['The model query parameter is required.'],
    });
  }

  const registered = await DynamicModel.assertAllowedTable(model);
  const fields = DynamicModel.parseFields(registered.fields);

  const errors = DynamicModel.validateDynamicFields(fields, body);
  if (errors) throw new AppError(422, 'Validation failed', errors);

  return DynamicModel.createRecord(model, body, fields);
}

async function update(model: string | undefined, id: any, body: any) {
  if (!model) {
    throw new AppError(422, 'Validation failed', {
      model: ['The model query parameter is required.'],
    });
  }

  const registered = await DynamicModel.assertAllowedTable(model);
  const fields = DynamicModel.parseFields(registered.fields);

  const record = await DynamicModel.findRecord(model, id);
  if (!record) throw new AppError(404, 'Record not found');

  const errors = DynamicModel.validateDynamicFields(fields, body, { partial: true });
  if (errors) throw new AppError(422, 'Validation failed', errors);

  return DynamicModel.updateRecord(model, id, body, fields);
}

async function remove(model: string | undefined, id: any) {
  if (!model) {
    throw new AppError(422, 'Validation failed', {
      model: ['The model query parameter is required.'],
    });
  }

  await DynamicModel.assertAllowedTable(model);

  const record = await DynamicModel.findRecord(model, id);
  if (!record) throw new AppError(404, 'Record not found');

  await DynamicModel.deleteRecord(model, id);
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
