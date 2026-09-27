import express from 'express';
import navbarController from '../controllers/navbar.controller';
import { validateCreateNavbar, validateUpdateNavbar } from '../validators/navbar.validator';

const router = express.Router();

router.get('/navbars', navbarController.index);
router.get('/navbars/:id', navbarController.show);
router.post('/navbars', validateCreateNavbar, navbarController.store);
router.put('/navbars/:id', validateUpdateNavbar, navbarController.update);
router.delete('/navbars/:id', navbarController.destroy);

export default router;
