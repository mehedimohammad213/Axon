import { asMiddleware, validationFailed } from './http';
import type { CreateMenuItemInput, UpdateMenuItemInput } from '../models/menuItem.model';

export function validateCreateMenuItemBody(body: CreateMenuItemInput | CreateMenuItemInput[]) {
  const items = Array.isArray(body) ? body : [body];

  for (const item of items) {
    const errors: Record<string, string[]> = {};
    if (!item?.title) errors.title = ['The title field is required.'];
    if (!item?.link) errors.link = ['The link field is required.'];
    if (Object.keys(errors).length) validationFailed(errors);
  }

  return items;
}

export function validateUpdateMenuItemBody(body: UpdateMenuItemInput) {
  const errors: Record<string, string[]> = {};
  if (!body?.title) errors.title = ['The title field is required.'];
  if (!body?.link) errors.link = ['The link field is required.'];
  if (Object.keys(errors).length) validationFailed(errors);
  return {
    title: body.title,
    title_bn: body.title_bn,
    link: body.link,
    parent_id: body.parent_id,
  };
}

export const validateCreateMenuItem = asMiddleware((req) => {
  req.body = validateCreateMenuItemBody(req.body);
});

export const validateUpdateMenuItem = asMiddleware((req) => {
  req.body = validateUpdateMenuItemBody(req.body);
});
