import express from 'express';
import sliderController from '../controllers/slider.controller';
import { validateCreateSlider, validateUpdateSlider } from '../validators/slider.validator';

const router = express.Router();

router.get('/sliders', sliderController.index);
router.get('/sliders/:id', sliderController.show);
router.post('/sliders', validateCreateSlider, sliderController.store);
router.put('/sliders/:id', validateUpdateSlider, sliderController.update);
router.delete('/sliders/:id', sliderController.destroy);

export default router;
