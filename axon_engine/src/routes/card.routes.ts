import express from 'express';
import cardController from '../controllers/card.controller';
import { validateCreateCard, validateUpdateCard } from '../validators/card.validator';

const router = express.Router();

router.get('/cards', cardController.index);
router.get('/cards/:id', cardController.show);
router.post('/cards', validateCreateCard, cardController.store);
router.put('/cards/:id', validateUpdateCard, cardController.update);
router.delete('/cards/:id', cardController.destroy);

export default router;
