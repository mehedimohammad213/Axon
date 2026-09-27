import AppError from '../utils/AppError';
import { asMiddleware, validationFailed } from './http';
import type {
  ChangePasswordInput,
  ForgetPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '../models/auth.model';

export function validateRegisterBody(body: RegisterInput): RegisterInput {
  const errors: Record<string, string[]> = {};
  if (!body?.name) errors.name = ['The name field is required.'];
  if (!body?.email) errors.email = ['The email field is required.'];
  if (!body?.password) errors.password = ['The password field is required.'];
  if (!body?.company) errors.company = ['The company field is required.'];
  if (body?.password && body.password !== body.password_confirmation) {
    errors.password = ['The password confirmation does not match.'];
  }
  if (Object.keys(errors).length) validationFailed(errors);
  return body;
}

export function validateLoginBody(body: LoginInput): LoginInput {
  const errors: Record<string, string[]> = {};
  if (!body?.email) errors.email = ['The email field is required.'];
  if (!body?.password) errors.password = ['The password field is required.'];
  if (Object.keys(errors).length) validationFailed(errors);
  return body;
}

export function validateForgetPasswordBody(body: ForgetPasswordInput): ForgetPasswordInput {
  if (!body?.email) {
    validationFailed({ email: ['The email field is required.'] });
  }
  return body;
}

export function validateResetPasswordBody(body: ResetPasswordInput): ResetPasswordInput {
  if (!body?.token || !body?.email || !body?.password) {
    throw new AppError(422, 'token, email, and password are required.');
  }
  if (body.password !== body.password_confirmation) {
    validationFailed({ password: ['The password confirmation does not match.'] });
  }
  return body;
}

export function validateChangePasswordBody(body: ChangePasswordInput): ChangePasswordInput {
  if (!body?.old_password || !body?.new_password) {
    throw new AppError(422, 'old_password and new_password are required.');
  }
  if (body.new_password !== body.new_password_confirmation) {
    validationFailed({ new_password: ['The password confirmation does not match.'] });
  }
  return body;
}

export const validateRegister = asMiddleware((req) => validateRegisterBody(req.body));
export const validateLogin = asMiddleware((req) => validateLoginBody(req.body));
export const validateForgetPassword = asMiddleware((req) => validateForgetPasswordBody(req.body));
export const validateResetPassword = asMiddleware((req) => validateResetPasswordBody(req.body));
export const validateChangePassword = asMiddleware((req) => validateChangePasswordBody(req.body));
