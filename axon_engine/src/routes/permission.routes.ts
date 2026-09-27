import express from 'express';
import * as permissionController from '../controllers/permission.controller';
import { validateCreatePermission, validateUpdatePermission } from '../validators/permission.validator';

const router = express.Router();

router.get('/permissions', permissionController.index);
router.get('/permissions/:id', permissionController.show);
router.post('/permissions', validateCreatePermission, permissionController.store);
router.put('/permissions/:id', validateUpdatePermission, permissionController.update);
router.delete('/permissions/:id', permissionController.destroy);

export default router;
