import express from 'express';
import tableController from '../controllers/table.controller';
import { validateCreateTable, validateUpdateTable } from '../validators/table.validator';

const router = express.Router();

router.get('/tables', tableController.index);
router.get('/tables/:id', tableController.show);
router.post('/tables', validateCreateTable, tableController.store);
router.put('/tables/:id', validateUpdateTable, tableController.update);
router.delete('/tables/:id', tableController.destroy);

export default router;
