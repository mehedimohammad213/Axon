import express from 'express';
import * as dynamicController from '../controllers/dynamic.controller';

const router = express.Router();

router.get('/dynamic', dynamicController.index);
router.get('/dynamic/:id', dynamicController.show);
router.post('/dynamic', dynamicController.store);
router.put('/dynamic/:id', dynamicController.update);
router.delete('/dynamic/:id', dynamicController.destroy);

export default router;
