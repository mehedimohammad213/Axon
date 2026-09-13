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

router.use(identifyPublicSite);

router.get('/public/pages', publicPageController.index);
router.get('/public/pages/:slug', publicPageController.show);

router.get('/public/navbars', navbarController.index);
router.get('/public/navbars/:id', navbarController.show);
router.get('/public/navbar', navbarController.index);

router.get('/public/menus', menuController.index);
router.get('/public/menus/:id', menuController.show);

router.get('/public/menuitems', menuItemController.index);
router.get('/public/menuitems/:id', menuItemController.show);

router.get('/public/footers', footerController.index);
router.get('/public/footers/:id', footerController.show);

router.get('/public/sliders', sliderController.index);
router.get('/public/sliders/:id', sliderController.show);

router.get('/public/cards', cardController.index);
router.get('/public/cards/:id', cardController.show);

router.get('/public/tables', tableController.index);
router.get('/public/tables/:id', tableController.show);

router.get('/public/product-types', productTypeController.index);
router.get('/public/product-types/:id', productTypeController.show);

router.get('/public/products', productController.index);
router.get('/public/products/:id', productController.show);

router.get('/public/forms', formController.index);
router.get('/public/forms/:id', formController.show);

router.get('/public/form_builder', formBuilderController.index);
router.get('/public/form_builder/:id', formBuilderController.show);

router.get('/public/media/pageview', mediaController.pageview);
router.get('/public/media', mediaController.index);
router.get('/public/media/:id', mediaController.show);

router.get('/public/generated-models', generatedModelController.getGeneratedModels);
router.get('/public/dynamic', dynamicController.index);
router.get('/public/dynamic/:id', dynamicController.show);

router.post('/form-submission', formSubmissionController.store);

module.exports = router;
