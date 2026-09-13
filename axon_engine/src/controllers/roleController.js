const asyncHandler = require('../utils/asyncHandler');
const { sendServiceResult, sendDeleted } = require('../utils/controllerHelpers');
const RoleService = require('../services/RoleService');

const index = asyncHandler(async (req, res) => {
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

module.exports = { index, show, store, update, destroy };
