import type { Request } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { sendServiceResult, sendDeleted } from '../utils/controllerHelpers';
import { parsePagination } from '../utils/pagination';
import DynamicService from '../services/DynamicService';

function dynamicOptions(req: Request) {
  return { requireActive: Boolean((req as Request & { isPublicSite?: boolean }).isPublicSite) };
}

const index = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const result = await DynamicService.list({
    model: req.query.model as string,
    architecture: req.query.architecture as string,
    ...pagination,
    ...dynamicOptions(req),
  });
  return sendServiceResult(res, result);
});

const show = asyncHandler(async (req, res) => {
  const result = await DynamicService.getById(req.query.model as string, req.params.id, dynamicOptions(req));
  return sendServiceResult(res, result);
});

const store = asyncHandler(async (req, res) => {
  const record = await DynamicService.create(req.query.model as string, req.body);
  return sendServiceResult(res, record, 201);
});

const update = asyncHandler(async (req, res) => {
  const result = await DynamicService.update(req.query.model as string, req.params.id, req.body);
  return sendServiceResult(res, result);
});

const destroy = asyncHandler(async (req, res) => {
  const resource = await DynamicService.remove(req.query.model as string, req.params.id);
  return sendDeleted(res, resource);
});

export { index, show, store, update, destroy };
