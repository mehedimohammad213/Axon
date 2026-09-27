import express from 'express';
import * as authController from '../controllers/auth.controller';
import {
  validateChangePassword,
  validateForgetPassword,
  validateLogin,
  validateRegister,
  validateResetPassword,
} from '../validators/auth.validator';

const publicRouter = express.Router();
publicRouter.post('/admin/register', validateRegister, authController.register);
publicRouter.post('/admin/login', validateLogin, authController.login);
publicRouter.post('/admin/password/forget', validateForgetPassword, authController.forgetPassword);
publicRouter.post('/admin/password/reset', validateResetPassword, authController.resetPassword);

const protectedRouter = express.Router();
protectedRouter.post('/admin/logout', authController.logout);
protectedRouter.get('/admin/user', authController.me);
protectedRouter.put('/admin/password/change', validateChangePassword, authController.changePassword);

export { publicRouter as publicAuthRoutes, protectedRouter as protectedAuthRoutes };
export default protectedRouter;
