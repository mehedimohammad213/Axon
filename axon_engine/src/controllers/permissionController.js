const asyncHandler = require('../utils/asyncHandler');
const { sendServiceResult, sendDeleted } = require('../utils/controllerHelpers');
const PermissionService = require('../services/PermissionService');

const index = asyncHandler(async (req, res) => {
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

module.exports = { index, show, store, update, destroy };
