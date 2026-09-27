import express from 'express';
import formBuilderController from '../controllers/formBuilder.controller';
import { validateCreateFormBuilder, validateUpdateFormBuilder } from '../validators/formBuilder.validator';

const router = express.Router();

router.get('/form_builder', formBuilderController.index);
router.get('/form_builder/:id', formBuilderController.show);
router.post('/form_builder', validateCreateFormBuilder, formBuilderController.store);
router.put('/form_builder/:id', validateUpdateFormBuilder, formBuilderController.update);
router.delete('/form_builder/:id', formBuilderController.destroy);

export default router;
