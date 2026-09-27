import { asMiddleware } from './http';
import type { CreateSliderInput, UpdateSliderInput } from '../models/slider.model';

export function validateCreateSliderBody(body: CreateSliderInput): CreateSliderInput {
  return body || {};
}

export function validateUpdateSliderBody(body: UpdateSliderInput): UpdateSliderInput {
  return body || {};
}

export const validateCreateSlider = asMiddleware((req) => {
  req.body = validateCreateSliderBody(req.body);
});

export const validateUpdateSlider = asMiddleware((req) => {
  req.body = validateUpdateSliderBody(req.body);
});
