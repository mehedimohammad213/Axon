const express = require('express');
const roleController = require('../controllers/roleController');
const permissionController = require('../controllers/permissionController');
const organizationController = require('../controllers/organizationController');
const pagesController = require('../controllers/pagesController');
const mediaController = require('../controllers/mediaController');
const menuItemController = require('../controllers/menuItemController');
const footerController = require('../controllers/footerController');
const cardController = require('../controllers/cardController');
const tableController = require('../controllers/tableController');
const productTypeController = require('../controllers/productTypeController');
const productController = require('../controllers/productController');
const formController = require('../controllers/formController');
const formDataController = require('../controllers/formDataController');
const formSubmissionController = require('../controllers/formSubmissionController');
const generatedModelController = require('../controllers/generatedModelController');
const dynamicController = require('../controllers/dynamicController');
const apiKeyController = require('../controllers/apiKeyController');
const { navbarController, menuController, sliderController, formBuilderController } = require('../controllers/cmsControllers');

const router = express.Router();

// Roles
router.get('/roles', roleController.index);
router.get('/roles/:id', roleController.show);
router.post('/roles', roleController.store);
router.put('/roles/:id', roleController.update);
router.delete('/roles/:id', roleController.destroy);

// Permissions
router.get('/permissions', permissionController.index);
router.get('/permissions/:id', permissionController.show);
router.post('/permissions', permissionController.store);
router.put('/permissions/:id', permissionController.update);
router.delete('/permissions/:id', permissionController.destroy);

// Organizations
router.get('/organizations/role-templates', organizationController.roleTemplates);
router.get('/organizations', organizationController.index);
router.post('/organizations', organizationController.store);
router.get('/organizations/:id', organizationController.show);
router.put('/organizations/:id', organizationController.update);
router.delete('/organizations/:id', organizationController.destroy);
router.get('/organizations/:id/roles', organizationController.roles);
router.post('/organizations/:id/roles', organizationController.storeRole);
router.put('/organizations/:id/roles/:roleId', organizationController.updateRole);
router.delete('/organizations/:id/roles/:roleId', organizationController.destroyRole);
router.get('/organizations/:id/users', organizationController.users);
router.post('/organizations/:id/users', organizationController.storeUser);
router.put('/organizations/:id/users/:userId', organizationController.updateUser);
router.delete('/organizations/:id/users/:userId', organizationController.destroyUser);
router.post('/organizations/:id/regenerate-site-key', organizationController.regenerateSiteKey);

// Navbars
router.get('/navbars', navbarController.index);
router.get('/navbars/:id', navbarController.show);
router.post('/navbars', navbarController.store);
router.put('/navbars/:id', navbarController.update);
router.delete('/navbars/:id', navbarController.destroy);

// Menus
router.get('/menus', menuController.index);
router.get('/menus/:id', menuController.show);
router.post('/menus', menuController.store);
router.put('/menus/:id', menuController.update);
router.delete('/menus/:id', menuController.destroy);

// Menu Items
router.get('/menuitems', menuItemController.index);
router.get('/menuitems/:id', menuItemController.show);
router.post('/menuitems', menuItemController.store);
router.put('/menuitems/:id', menuItemController.update);
router.delete('/menuitems/:id', menuItemController.destroy);

// Footers
router.get('/footers', footerController.index);
router.get('/footers/:id', footerController.show);
router.post('/footers', footerController.store);
router.put('/footers/:id', footerController.update);
router.delete('/footers/:id', footerController.destroy);

// Sliders
router.get('/sliders', sliderController.index);
router.get('/sliders/:id', sliderController.show);
router.post('/sliders', sliderController.store);
router.put('/sliders/:id', sliderController.update);
router.delete('/sliders/:id', sliderController.destroy);

// Cards
router.get('/cards', cardController.index);
router.get('/cards/:id', cardController.show);
router.post('/cards', cardController.store);
router.put('/cards/:id', cardController.update);
router.delete('/cards/:id', cardController.destroy);

// Tables
router.get('/tables', tableController.index);
router.get('/tables/:id', tableController.show);
router.post('/tables', tableController.store);
router.put('/tables/:id', tableController.update);
router.delete('/tables/:id', tableController.destroy);

// Product Types
router.get('/product-types', productTypeController.index);
router.get('/product-types/:id', productTypeController.show);
router.post('/product-types', productTypeController.store);
router.put('/product-types/:id', productTypeController.update);
router.delete('/product-types/:id', productTypeController.destroy);

// Products
router.get('/products', productController.index);
router.get('/products/:id', productController.show);
router.post('/products', productController.store);
router.put('/products/:id', productController.update);
router.delete('/products/:id', productController.destroy);

// Forms (read-only)
router.get('/forms', formController.index);

// Media
router.get('/media', mediaController.index);
router.get('/media/pageview', mediaController.pageview);
router.get('/media/:id', mediaController.show);
router.post(
  '/media/upload',
  mediaController.upload.fields([
    { name: 'file', maxCount: 20 },
    { name: 'file[]', maxCount: 20 },
  ]),
  mediaController.uploadFiles
);
router.put('/media/:id', mediaController.update);
router.delete('/media/:id', mediaController.destroy);

// Form Data
router.get('/formdata', formDataController.index);
router.get('/formdata/:id', formDataController.show);
router.put('/formdata/:id', formDataController.update);

// Form Builder
router.get('/form_builder', formBuilderController.index);
router.get('/form_builder/:id', formBuilderController.show);
router.post('/form_builder', formBuilderController.store);
router.put('/form_builder/:id', formBuilderController.update);
router.delete('/form_builder/:id', formBuilderController.destroy);

// Pages
router.get('/pages', pagesController.index);
router.get('/pages/:id', pagesController.show);
router.post('/pages', pagesController.store);
router.put('/pages/:id', pagesController.update);
router.delete('/pages/:id', pagesController.destroy);

// Form Submissions (CMS)
router.get('/form-submission', formSubmissionController.index);
router.put('/form-submission/:id', formSubmissionController.update);
router.delete('/form-submission/:id', formSubmissionController.destroy);

// API keys
router.get('/api-keys', apiKeyController.index);
router.get('/api-keys/:id', apiKeyController.show);
router.post('/api-keys', apiKeyController.store);
router.put('/api-keys/:id', apiKeyController.update);
router.delete('/api-keys/:id', apiKeyController.destroy);

// DIY CMS / Generated Models
router.post('/diy-cms', generatedModelController.generate);
router.get('/generated-models', generatedModelController.getGeneratedModels);
router.put('/generated-models/:id', generatedModelController.updateGeneratedModel);
router.delete('/generated-models/:id', generatedModelController.deleteGeneratedModel);

// Dynamic CRUD (generated models)
router.get('/dynamic', dynamicController.index);
router.get('/dynamic/:id', dynamicController.show);
router.post('/dynamic', dynamicController.store);
router.put('/dynamic/:id', dynamicController.update);
router.delete('/dynamic/:id', dynamicController.destroy);

module.exports = router;
