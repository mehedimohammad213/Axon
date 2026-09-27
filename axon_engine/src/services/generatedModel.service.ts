import AppError from '../utils/AppError';
import GeneratedModelRepository from '../repositories/generatedModel.repository';
import {
  validateGenerateModelBody,
  validateUpdateGeneratedModelBody,
} from '../validators/generatedModel.validator';
import type { GenerateModelInput, UpdateGeneratedModelInput } from '../models/generatedModel.model';

async function list() {
  return GeneratedModelRepository.findAll();
}

async function generate(body: GenerateModelInput) {
  const { modelSingular, modelPlural, fields, status } = validateGenerateModelBody(body);

  const { tableName, apiRoute } = await GeneratedModelRepository.generate({
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

async function update(id: any, body: UpdateGeneratedModelInput) {
  const model = await GeneratedModelRepository.findById(id);
  if (!model) throw new AppError(404, 'Generated model not found');

  return GeneratedModelRepository.updateGeneratedModel(id, validateUpdateGeneratedModelBody(body), model);
}

async function remove(id: any) {
  const model = await GeneratedModelRepository.deleteWithTable(id);
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
