import asyncHandler from '../utils/asyncHandler';
import { sendServiceResult, sendDeleted } from '../utils/controllerHelpers';
import { parsePagination } from '../utils/pagination';
import PageService from '../services/PageService';

const index = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const result = await PageService.list({
    type: req.query.type as string,
    ...pagination,
  });
  return sendServiceResult(res, result);
});

const show = asyncHandler(async (req, res) => {
  const result = await PageService.show(req.params.id);
  return sendServiceResult(res, result);
});

const store = asyncHandler(async (req, res) => {
  const page = await PageService.create(req.body);
  return sendServiceResult(res, page, 201);
});

const update = asyncHandler(async (req, res) => {
  return sendServiceResult(res, await PageService.update(req.params.id, req.body));
});

const destroy = asyncHandler(async (req, res) => {
  const resource = await PageService.remove(req.params.id);
  return sendDeleted(res, resource);
});

export { index, show, store, update, destroy };
