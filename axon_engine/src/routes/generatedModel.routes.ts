import express from 'express';
import * as generatedModelController from '../controllers/generatedModel.controller';
import { validateGenerateModel, validateUpdateGeneratedModel } from '../validators/generatedModel.validator';

const router = express.Router();

router.post('/diy-cms', validateGenerateModel, generatedModelController.generate);
router.get('/generated-models', generatedModelController.getGeneratedModels);
router.put('/generated-models/:id', validateUpdateGeneratedModel, generatedModelController.updateGeneratedModel);
router.delete('/generated-models/:id', generatedModelController.deleteGeneratedModel);

export default router;
