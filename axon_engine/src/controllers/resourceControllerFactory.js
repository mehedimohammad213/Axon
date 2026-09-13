const asyncHandler = require('../utils/asyncHandler');
const { sendServiceResult, sendDeleted } = require('../utils/controllerHelpers');
const { parsePagination } = require('../utils/pagination');

function createResourceController(service, resourceName, options = {}) {
  const index = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query, options.pagination);
    const extra = options.buildListParams ? options.buildListParams(req) : {};
    const result = await service.list({ ...pagination, ...extra });
    return sendServiceResult(res, result);
  });

  const show = asyncHandler(async (req, res) => {
    const result = await service.show(req.params.id);
    return sendServiceResult(res, result);
  });

  const store = asyncHandler(async (req, res) => {
    const result = await service.create(req.body);
    return sendServiceResult(res, result, 201);
  });

  const update = asyncHandler(async (req, res) => {
    const result = await service.update(req.params.id, req.body);
    return sendServiceResult(res, result);
  });

  const destroy = asyncHandler(async (req, res) => {
    const resource = await service.remove(req.params.id);
    return sendDeleted(res, resource || resourceName);
  });

  const controller = { index, show, store, update, destroy };

  if (options.exclude?.length) {
    for (const action of options.exclude) {
      delete controller[action];
    }
  }

  return controller;
}

module.exports = createResourceController;
