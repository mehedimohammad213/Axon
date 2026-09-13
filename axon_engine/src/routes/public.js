const express = require('express');
const identifyPublicSite = require('../middleware/publicSite');
const publicPageController = require('../controllers/publicPageController');
const { navbarController, menuController, sliderController, formBuilderController } = require('../controllers/cmsControllers');
const menuItemController = require('../controllers/menuItemController');
const footerController = require('../controllers/footerController');
const cardController = require('../controllers/cardController');
const tableController = require('../controllers/tableController');
const productTypeController = require('../controllers/productTypeController');
const productController = require('../controllers/productController');
const formController = require('../controllers/formController');
const mediaController = require('../controllers/mediaController');
const generatedModelController = require('../controllers/generatedModelController');
const dynamicController = require('../controllers/dynamicController');
const formSubmissionController = require('../controllers/formSubmissionController');

const router = express.Router();

// Site-key auth only for /public/* — do not apply to all /api requests
// (CMS JWT routes must fall through to the protected stack).
const siteRouter = express.Router();
siteRouter.use(identifyPublicSite);

siteRouter.get('/pages', publicPageController.index);
siteRouter.get('/pages/:slug', publicPageController.show);

siteRouter.get('/navbars', navbarController.index);
siteRouter.get('/navbars/:id', navbarController.show);
siteRouter.get('/navbar', navbarController.index);

siteRouter.get('/menus', menuController.index);
siteRouter.get('/menus/:id', menuController.show);

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

siteRouter.get('/forms', formController.index);
siteRouter.get('/forms/:id', formController.show);

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

module.exports = router;
