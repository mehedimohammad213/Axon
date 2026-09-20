import asyncHandler from '../utils/asyncHandler';
import { sendServiceResult, sendDeleted } from '../utils/controllerHelpers';
import { parsePagination } from '../utils/pagination';
import { createCrudService } from '../services/CrudService';

function createCrudController(tableName: string, options: Record<string, unknown> = {}) {
  const service = createCrudService(tableName, options);

  const index = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const result = await service.list(pagination);
    return sendServiceResult(res, result);
  });

  const show = asyncHandler(async (req, res) => {
    const result = await service.show(req.params.id);
    return sendServiceResult(res, result);
  });

  const store = asyncHandler(async (req, res) => {
    const result = await service.create(req.body);
    return sendServiceResult(res, result, 201);
  });

  const update = asyncHandler(async (req, res) => {
    const result = await service.update(req.params.id, req.body);
    return sendServiceResult(res, result);
  });

  const destroy = asyncHandler(async (req, res) => {
    const resource = await service.remove(req.params.id);
    return sendDeleted(res, resource);
  });

  return { index, show, store, update, destroy };
}

export default createCrudController;
