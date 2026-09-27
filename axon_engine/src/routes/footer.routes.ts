import express from 'express';
import footerController from '../controllers/footer.controller';
import { validateCreateFooter, validateUpdateFooter } from '../validators/footer.validator';

const router = express.Router();

router.get('/footers', footerController.index);
router.get('/footers/:id', footerController.show);
router.post('/footers', validateCreateFooter, footerController.store);
router.put('/footers/:id', validateUpdateFooter, footerController.update);
router.delete('/footers/:id', footerController.destroy);

export default router;
