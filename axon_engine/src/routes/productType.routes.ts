import express from 'express';
import productTypeController from '../controllers/productType.controller';
import { validateCreateProductType, validateUpdateProductType } from '../validators/productType.validator';

const router = express.Router();

router.get('/product-types', productTypeController.index);
router.get('/product-types/:id', productTypeController.show);
router.post('/product-types', validateCreateProductType, productTypeController.store);
router.put('/product-types/:id', validateUpdateProductType, productTypeController.update);
router.delete('/product-types/:id', productTypeController.destroy);

export default router;
