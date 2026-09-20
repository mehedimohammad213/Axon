import AppError from '../utils/AppError';
import GeneratedModelModel from '../models/GeneratedModelModel';

async function list() {
  return GeneratedModelModel.findAll();
}

async function generate(body: any) {
  const { modelSingular, modelPlural, fields, status } = body;

  if (!modelSingular || !modelPlural || !fields?.length) {
    throw new AppError(422, 'modelSingular, modelPlural, and fields are required.');
  }

  const { tableName, apiRoute } = await GeneratedModelModel.generate({
    modelSingular,
    modelPlural,
    fields,
    status,
  });

  return {
    status: true,
    message: 'Model generated successfully',
    details: {
      Model: modelSingular,
      Migration: tableName,
      Controller: 'DynamicController',
      Route: apiRoute,
    },
  };
}

async function update(id: any, body: any) {
  const model = await GeneratedModelModel.findById(id);
  if (!model) throw new AppError(404, 'Generated model not found');

  return GeneratedModelModel.updateGeneratedModel(id, body, model);
}

async function remove(id: any) {
  const model = await GeneratedModelModel.deleteWithTable(id);
  if (!model) throw new AppError(404, 'Generated model not found');
  return 'Generated model';
}

export default {
  list,
  generate,
  update,
  remove,
};
export { list, generate, update, remove };
