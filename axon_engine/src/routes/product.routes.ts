import express from 'express';
import productController from '../controllers/product.controller';
import { validateCreateProduct } from '../validators/product.validator';

const router = express.Router();

router.get('/products', productController.index);
router.get('/products/:id', productController.show);
router.post('/products', validateCreateProduct, productController.store);
router.put('/products/:id', productController.update);
router.delete('/products/:id', productController.destroy);

export default router;
