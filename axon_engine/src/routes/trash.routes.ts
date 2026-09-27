import express from 'express';
import * as trashController from '../controllers/trash.controller';
import { validateTrashAction } from '../validators/trash.validator';

const router = express.Router();

router.get('/trash', trashController.index);
router.post('/trash/:type/:id/restore', validateTrashAction, trashController.restore);
router.delete('/trash/:type/:id', validateTrashAction, trashController.destroy);

export default router;
