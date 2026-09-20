import express from 'express';
import * as authController from '../controllers/authController';

const router = express.Router();

router.post('/admin/register', authController.register);
router.post('/admin/login', authController.login);
router.post('/admin/password/forget', authController.forgetPassword);
router.post('/admin/password/reset', authController.resetPassword);

export default router;
