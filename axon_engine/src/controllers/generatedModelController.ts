import asyncHandler from '../utils/asyncHandler';
import { sendServiceResult, sendDeleted } from '../utils/controllerHelpers';
import GeneratedModelService from '../services/GeneratedModelService';

const getGeneratedModels = asyncHandler(async (_req, res) => {
  return sendServiceResult(res, await GeneratedModelService.list());
});

const generate = asyncHandler(async (req, res) => {
  const result = await GeneratedModelService.generate(req.body);
  return sendServiceResult(res, result, 201);
});

const updateGeneratedModel = asyncHandler(async (req, res) => {
  const result = await GeneratedModelService.update(req.params.id, req.body);
  return sendServiceResult(res, result);
});

const deleteGeneratedModel = asyncHandler(async (req, res) => {
  const resource = await GeneratedModelService.remove(req.params.id);
  return sendDeleted(res, resource);
});

export { getGeneratedModels, generate, updateGeneratedModel, deleteGeneratedModel };
