import asyncHandler from '../utils/asyncHandler';
import { sendServiceResult, sendDeleted } from '../utils/controllerHelpers';
import { parsePagination } from '../utils/pagination';
import FormSubmissionService from '../services/FormSubmissionService';

const index = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const result = await FormSubmissionService.list({
    form_id: req.query.form_id,
    form_type: req.query.form_type as string,
    ...pagination,
  });
  return sendServiceResult(res, result);
});

const store = asyncHandler(async (req, res) => {
  const result = await FormSubmissionService.create(req.body);
  return sendServiceResult(res, result, 201);
});

const update = asyncHandler(async (req, res) => {
  const result = await FormSubmissionService.update(req.params.id, req.body);
  return sendServiceResult(res, result);
});

const destroy = asyncHandler(async (req, res) => {
  const resource = await FormSubmissionService.remove(req.params.id);
  return sendDeleted(res, resource);
});

export { index, store, update, destroy };
