import express from 'express';
import * as formSubmissionController from '../controllers/formSubmission.controller';
import {
  validateCreateFormSubmission,
  validateUpdateFormSubmission,
} from '../validators/formSubmission.validator';

const router = express.Router();

router.get('/form-submission', formSubmissionController.index);
router.put('/form-submission/:id', validateUpdateFormSubmission, formSubmissionController.update);
router.delete('/form-submission/:id', formSubmissionController.destroy);

export { formSubmissionController, validateCreateFormSubmission };
export default router;
