const asyncHandler = require('../utils/asyncHandler');
const { sendServiceResult, sendDeleted } = require('../utils/controllerHelpers');
const { parsePagination } = require('../utils/pagination');
const PageService = require('../services/PageService');

const index = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const result = await PageService.list({
    type: req.query.type,
    ...pagination,
  });
  return sendServiceResult(res, result);
});

const show = asyncHandler(async (req, res) => {
  const result = await PageService.show(req.params.id);
  return sendServiceResult(res, result);
});

const store = asyncHandler(async (req, res) => {
  const page = await PageService.create(req.body, req.user);
  return sendServiceResult(res, page, 201);
});

const update = asyncHandler(async (req, res) => {
  return sendServiceResult(res, await PageService.update(req.params.id, req.body, req.user));
});

const destroy = asyncHandler(async (req, res) => {
  const resource = await PageService.remove(req.params.id);
  return sendDeleted(res, resource);
});

module.exports = { index, show, store, update, destroy };
