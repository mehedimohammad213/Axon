import asyncHandler from '../utils/asyncHandler';
import { sendServiceResult } from '../utils/controllerHelpers';
import { parsePagination } from '../utils/pagination';
import PageService from '../services/PageService';

const index = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const pages = await PageService.listPublished({
    type: req.query.type as string,
    ...pagination,
  });
  return sendServiceResult(res, pages);
});

const show = asyncHandler(async (req, res) => {
  const page = await PageService.getPublishedBySlug(req.params.slug as string);
  return sendServiceResult(res, page);
});

export { index, show };
