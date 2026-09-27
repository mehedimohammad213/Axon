import express from 'express';
import menuItemController from '../controllers/menuItem.controller';
import { validateCreateMenuItem, validateUpdateMenuItem } from '../validators/menuItem.validator';

const router = express.Router();

router.get('/menuitems', menuItemController.index);
router.get('/menuitems/:id', menuItemController.show);
router.post('/menuitems', validateCreateMenuItem, menuItemController.store);
router.put('/menuitems/:id', validateUpdateMenuItem, menuItemController.update);
router.delete('/menuitems/:id', menuItemController.destroy);

export default router;
