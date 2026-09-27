import { asMiddleware, validationFailed } from './http';
import type { CreateNavbarInput, UpdateNavbarInput } from '../models/navbar.model';

function normalizeIds(value: any): any[] {
  if (value == null || value === '') return [];
  if (typeof value === 'string') {
    try {
      return normalizeIds(JSON.parse(value));
    } catch {
      return [];
    }
  }
  const ids = Array.isArray(value) ? value : [value];
  return ids.filter((id) => id != null && id !== '');
}

export function validateCreateNavbarBody(body: CreateNavbarInput) {
  const errors: Record<string, string[]> = {};
  if (!body?.title_en) errors.title_en = ['The title_en field is required.'];
  if (!body?.logo_id) errors.logo_id = ['The logo_id field is required.'];

  const menuItemIds = normalizeIds(body?.menu_item_ids);
  if (!menuItemIds.length) {
    errors.menu_item_ids = ['At least one menu item is required.'];
  }

  if (Object.keys(errors).length) validationFailed(errors);
  return { ...body, menu_item_ids: menuItemIds };
}

export function validateUpdateNavbarBody(body: UpdateNavbarInput) {
  const payload = { ...body };
  if (Object.prototype.hasOwnProperty.call(payload, 'menu_item_ids')) {
    payload.menu_item_ids = normalizeIds(payload.menu_item_ids);
  }
  return payload;
}

export const validateCreateNavbar = asMiddleware((req) => {
  req.body = validateCreateNavbarBody(req.body);
});

export const validateUpdateNavbar = asMiddleware((req) => {
  req.body = validateUpdateNavbarBody(req.body);
});
