import asyncHandler from '../utils/asyncHandler';
import { sendServiceResult, sendDeleted } from '../utils/controllerHelpers';
import PermissionService from '../services/PermissionService';

const index = asyncHandler(async (_req, res) => {
  return sendServiceResult(res, await PermissionService.list());
});

const show = asyncHandler(async (req, res) => {
  return sendServiceResult(res, await PermissionService.getById(req.params.id));
});

const store = asyncHandler(async (req, res) => {
  const permission = await PermissionService.create(req.body);
  return sendServiceResult(res, permission, 201);
});

const update = asyncHandler(async (req, res) => {
  return sendServiceResult(res, await PermissionService.update(req.params.id, req.body));
});

const destroy = asyncHandler(async (req, res) => {
  const resource = await PermissionService.remove(req.params.id);
  return sendDeleted(res, resource);
});

export { index, show, store, update, destroy };
