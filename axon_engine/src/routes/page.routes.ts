import express from 'express';
import * as pageController from '../controllers/page.controller';
import { validateCreatePage, validateUpdatePage } from '../validators/page.validator';

const router = express.Router();

router.get('/pages', pageController.index);
router.get('/pages/:id', pageController.show);
router.post('/pages', validateCreatePage, pageController.store);
router.put('/pages/:id', validateUpdatePage, pageController.update);
router.delete('/pages/:id', pageController.destroy);

export default router;
