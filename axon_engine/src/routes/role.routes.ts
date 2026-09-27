import express from 'express';
import * as roleController from '../controllers/role.controller';
import { validateCreateRole, validateUpdateRole } from '../validators/role.validator';

const router = express.Router();

router.get('/roles', roleController.index);
router.get('/roles/:id', roleController.show);
router.post('/roles', validateCreateRole, roleController.store);
router.put('/roles/:id', validateUpdateRole, roleController.update);
router.delete('/roles/:id', roleController.destroy);

export default router;
