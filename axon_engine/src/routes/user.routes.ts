import express from 'express';
import * as userController from '../controllers/user.controller';
import { validateCreateUser, validateUpdateUser } from '../validators/user.validator';

const router = express.Router();

router.get('/admin/users', userController.index);
router.post('/admin/user', validateCreateUser, userController.store);
router.put('/admin/user/:id', validateUpdateUser, userController.update);
router.delete('/admin/user/:id', userController.destroy);

export default router;
