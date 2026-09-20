import type { Request } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { sendServiceResult, sendDeleted } from '../utils/controllerHelpers';
import { parsePagination } from '../utils/pagination';

type CrudAction = 'index' | 'show' | 'store' | 'update' | 'destroy';

interface ResourceControllerOptions {
  pagination?: { maxLimit?: number; defaultLimit?: number };
  buildListParams?: (req: Request) => Record<string, unknown>;
  exclude?: CrudAction[];
}

function createResourceController(
  service: any,
  resourceName: string,
  options: ResourceControllerOptions = {}
) {
  const index = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query, options.pagination);
    const extra = options.buildListParams ? options.buildListParams(req) : {};
    const result = await service.list({ ...pagination, ...extra });
    return sendServiceResult(res, result);
  });

  const show = asyncHandler(async (req, res) => {
    const result = await service.show(req.params.id as string);
    return sendServiceResult(res, result);
  });

  const store = asyncHandler(async (req, res) => {
    const result = await service.create(req.body);
    return sendServiceResult(res, result, 201);
  });

  const update = asyncHandler(async (req, res) => {
    const result = await service.update(req.params.id as string, req.body);
    return sendServiceResult(res, result);
  });

  const destroy = asyncHandler(async (req, res) => {
    const resource = await service.remove(req.params.id as string);
    return sendDeleted(res, (resource as string) || resourceName);
  });

  const controller: Partial<Record<CrudAction, ReturnType<typeof asyncHandler>>> = {
    index,
    show,
    store,
    update,
    destroy,
  };

  if (options.exclude?.length) {
    for (const action of options.exclude) {
      delete controller[action];
    }
  }

  return controller;
}

export default createResourceController;
