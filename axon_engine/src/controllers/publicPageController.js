const asyncHandler = require('../utils/asyncHandler');
const { sendServiceResult } = require('../utils/controllerHelpers');
const { parsePagination } = require('../utils/pagination');
const PageService = require('../services/PageService');

const index = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const pages = await PageService.listPublished({
    type: req.query.type,
    ...pagination,
  });
  return sendServiceResult(res, pages);
});

const show = asyncHandler(async (req, res) => {
  const page = await PageService.getPublishedBySlug(req.params.slug);
  return sendServiceResult(res, page);
});

module.exports = { index, show };
