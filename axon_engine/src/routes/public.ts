import express from 'express';
import identifyPublicSite from '../middleware/publicSite';
import * as publicPageController from '../controllers/publicPageController';
import { navbarController, sliderController, formBuilderController } from '../controllers/cmsControllers';
import menuItemController from '../controllers/menuItemController';
import footerController from '../controllers/footerController';
import cardController from '../controllers/cardController';
import tableController from '../controllers/tableController';
import productTypeController from '../controllers/productTypeController';
import productController from '../controllers/productController';
import mediaController from '../controllers/mediaController';
import * as generatedModelController from '../controllers/generatedModelController';
import * as dynamicController from '../controllers/dynamicController';
import * as formSubmissionController from '../controllers/formSubmissionController';

const router = express.Router();

const siteRouter = express.Router();
siteRouter.use(identifyPublicSite);

siteRouter.get('/pages', publicPageController.index);
siteRouter.get('/pages/:slug', publicPageController.show);

siteRouter.get('/navbars', navbarController.index);
siteRouter.get('/navbars/:id', navbarController.show);
siteRouter.get('/navbar', navbarController.index);

siteRouter.get('/menuitems', menuItemController.index);
siteRouter.get('/menuitems/:id', menuItemController.show);

siteRouter.get('/footers', footerController.index);
siteRouter.get('/footers/:id', footerController.show);

siteRouter.get('/sliders', sliderController.index);
siteRouter.get('/sliders/:id', sliderController.show);

siteRouter.get('/cards', cardController.index);
siteRouter.get('/cards/:id', cardController.show);

siteRouter.get('/tables', tableController.index);
siteRouter.get('/tables/:id', tableController.show);

siteRouter.get('/product-types', productTypeController.index);
siteRouter.get('/product-types/:id', productTypeController.show);

siteRouter.get('/products', productController.index);
siteRouter.get('/products/:id', productController.show);

siteRouter.get('/form_builder', formBuilderController.index);
siteRouter.get('/form_builder/:id', formBuilderController.show);

siteRouter.get('/media/pageview', mediaController.pageview);
siteRouter.get('/media', mediaController.index);
siteRouter.get('/media/:id', mediaController.show);

siteRouter.get('/generated-models', generatedModelController.getGeneratedModels);
siteRouter.get('/dynamic', dynamicController.index);
siteRouter.get('/dynamic/:id', dynamicController.show);

router.use('/public', siteRouter);
router.post('/form-submission', identifyPublicSite, formSubmissionController.store);

export default router;
