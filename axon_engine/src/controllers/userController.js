const asyncHandler = require('../utils/asyncHandler');
const { sendServiceResult, sendDeleted } = require('../utils/controllerHelpers');
const UserService = require('../services/UserService');

const index = asyncHandler(async (req, res) => {
  const users = await UserService.list(req.user, req.query.organization_id);
  return sendServiceResult(res, users);
});

const store = asyncHandler(async (req, res) => {
  const user = await UserService.create(req.user, req.body);
  return sendServiceResult(res, user, 201);
});

const update = asyncHandler(async (req, res) => {
  const result = await UserService.update(req.params.id, req.body);
  return sendServiceResult(res, result);
});

const destroy = asyncHandler(async (req, res) => {
  const resource = await UserService.remove(req.params.id);
  return sendDeleted(res, resource);
});

module.exports = { index, store, update, destroy };
