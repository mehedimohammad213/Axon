const asyncHandler = require('../utils/asyncHandler');
const { sendServiceResult, sendDeleted } = require('../utils/controllerHelpers');
const { parsePagination } = require('../utils/pagination');
const DynamicService = require('../services/DynamicService');

function dynamicOptions(req) {
  return { requireActive: Boolean(req.isPublicSite) };
}

const index = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const result = await DynamicService.list({
    model: req.query.model,
    architecture: req.query.architecture,
    ...pagination,
    ...dynamicOptions(req),
  });
  return sendServiceResult(res, result);
});

const show = asyncHandler(async (req, res) => {
  const result = await DynamicService.getById(req.query.model, req.params.id, dynamicOptions(req));
  return sendServiceResult(res, result);
});

const store = asyncHandler(async (req, res) => {
  const record = await DynamicService.create(req.query.model, req.body);
  return sendServiceResult(res, record, 201);
});

const update = asyncHandler(async (req, res) => {
  const result = await DynamicService.update(req.query.model, req.params.id, req.body);
  return sendServiceResult(res, result);
});

const destroy = asyncHandler(async (req, res) => {
  const resource = await DynamicService.remove(req.query.model, req.params.id);
  return sendDeleted(res, resource);
});

module.exports = { index, show, store, update, destroy };
