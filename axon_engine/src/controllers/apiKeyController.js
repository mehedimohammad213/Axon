const asyncHandler = require('../utils/asyncHandler');
const { sendServiceResult, sendDeleted } = require('../utils/controllerHelpers');
const { parsePagination } = require('../utils/pagination');
const ApiKeyService = require('../services/ApiKeyService');

const index = asyncHandler(async (req, res) => {
  return sendServiceResult(res, await ApiKeyService.list(parsePagination(req.query)));
});

const show = asyncHandler(async (req, res) => {
  return sendServiceResult(res, await ApiKeyService.show(req.params.id));
});

const store = asyncHandler(async (req, res) => {
  return sendServiceResult(res, await ApiKeyService.create(req.body, req.user), 201);
});

const update = asyncHandler(async (req, res) => {
  return sendServiceResult(res, await ApiKeyService.update(req.params.id, req.body));
});

const destroy = asyncHandler(async (req, res) => {
  return sendDeleted(res, await ApiKeyService.remove(req.params.id));
});

module.exports = { index, show, store, update, destroy };
