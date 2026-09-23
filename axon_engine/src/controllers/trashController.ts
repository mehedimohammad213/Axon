import asyncHandler from '../utils/asyncHandler';
import { sendServiceResult, sendDeleted } from '../utils/controllerHelpers';
import TrashService from '../services/TrashService';

const index = asyncHandler(async (req, res) => {
  const result = await TrashService.list({ type: req.query.type as string | undefined });
  return sendServiceResult(res, result);
});

const restore = asyncHandler(async (req, res) => {
  const result = await TrashService.restore(String(req.params.type), String(req.params.id));
  return sendServiceResult(res, result);
});

const destroy = asyncHandler(async (req, res) => {
  const resource = await TrashService.forceDelete(String(req.params.type), String(req.params.id));
  return sendDeleted(res, resource);
});

export { index, restore, destroy };
export default { index, restore, destroy };
