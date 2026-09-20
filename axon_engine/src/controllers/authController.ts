import asyncHandler from '../utils/asyncHandler';
import { sendServiceResult } from '../utils/controllerHelpers';
import AuthService from '../services/AuthService';

const register = asyncHandler(async (req, res) => {
  const result = await AuthService.register(req.body);
  return sendServiceResult(res, result, 201);
});

const login = asyncHandler(async (req, res) => {
  const result = await AuthService.login(req.body);
  return sendServiceResult(res, result);
});

const logout = asyncHandler(async (_req, res) => {
  return sendServiceResult(res, { message: 'Logged out' });
});

const me = asyncHandler(async (req, res) => {
  return sendServiceResult(res, req.user);
});

const forgetPassword = asyncHandler(async (req, res) => {
  const result = await AuthService.forgetPassword(req.body);
  return sendServiceResult(res, result);
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await AuthService.resetPassword(req.body);
  return sendServiceResult(res, result);
});

const changePassword = asyncHandler(async (req, res) => {
  const result = await AuthService.changePassword(req.user.id, req.body);
  return sendServiceResult(res, result);
});

export {
  register,
  login,
  logout,
  me,
  forgetPassword,
  resetPassword,
  changePassword,
};
