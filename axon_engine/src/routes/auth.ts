import express from 'express';
import { authenticate } from '../middleware/auth';
import * as authController from '../controllers/authController';
import * as userController from '../controllers/userController';

const router = express.Router();
router.use(authenticate);

router.post('/admin/logout', authController.logout);
router.get('/admin/user', authController.me);
router.put('/admin/password/change', authController.changePassword);

router.get('/admin/users', userController.index);
router.post('/admin/user', userController.store);
router.put('/admin/user/:id', userController.update);
router.delete('/admin/user/:id', userController.destroy);

export default router;
