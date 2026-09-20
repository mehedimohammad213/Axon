import asyncHandler from '../utils/asyncHandler';
import { sendServiceResult, sendDeleted } from '../utils/controllerHelpers';
import RoleService from '../services/RoleService';

const index = asyncHandler(async (_req, res) => {
  return sendServiceResult(res, await RoleService.list());
});

const show = asyncHandler(async (req, res) => {
  return sendServiceResult(res, await RoleService.getById(req.params.id));
});

const store = asyncHandler(async (req, res) => {
  const role = await RoleService.create(req.body);
  return sendServiceResult(res, role, 201);
});

const update = asyncHandler(async (req, res) => {
  return sendServiceResult(res, await RoleService.update(req.params.id, req.body));
});

const destroy = asyncHandler(async (req, res) => {
  const resource = await RoleService.remove(req.params.id);
  return sendDeleted(res, resource);
});

export { index, show, store, update, destroy };
