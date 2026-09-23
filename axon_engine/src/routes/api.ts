import express from 'express';
import * as roleController from '../controllers/roleController';
import * as permissionController from '../controllers/permissionController';
import * as organizationController from '../controllers/organizationController';
import * as pagesController from '../controllers/pagesController';
import * as mediaController from '../controllers/mediaController';
import menuItemController from '../controllers/menuItemController';
import footerController from '../controllers/footerController';
import cardController from '../controllers/cardController';
import tableController from '../controllers/tableController';
import productTypeController from '../controllers/productTypeController';
import productController from '../controllers/productController';
import formController from '../controllers/formController';
import formDataController from '../controllers/formDataController';
import * as formSubmissionController from '../controllers/formSubmissionController';
import * as generatedModelController from '../controllers/generatedModelController';
import * as dynamicController from '../controllers/dynamicController';
import { navbarController, sliderController, formBuilderController } from '../controllers/cmsControllers';
import * as trashController from '../controllers/trashController';

const router = express.Router();

router.get('/roles', roleController.index);
router.get('/roles/:id', roleController.show);
router.post('/roles', roleController.store);
router.put('/roles/:id', roleController.update);
router.delete('/roles/:id', roleController.destroy);

router.get('/permissions', permissionController.index);
router.get('/permissions/:id', permissionController.show);
router.post('/permissions', permissionController.store);
router.put('/permissions/:id', permissionController.update);
router.delete('/permissions/:id', permissionController.destroy);

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

router.get('/navbars', navbarController.index);
router.get('/navbars/:id', navbarController.show);
router.post('/navbars', navbarController.store);
router.put('/navbars/:id', navbarController.update);
router.delete('/navbars/:id', navbarController.destroy);

router.get('/menuitems', menuItemController.index);
router.get('/menuitems/:id', menuItemController.show);
router.post('/menuitems', menuItemController.store);
router.put('/menuitems/:id', menuItemController.update);
router.delete('/menuitems/:id', menuItemController.destroy);

router.get('/footers', footerController.index);
router.get('/footers/:id', footerController.show);
router.post('/footers', footerController.store);
router.put('/footers/:id', footerController.update);
router.delete('/footers/:id', footerController.destroy);

router.get('/sliders', sliderController.index);
router.get('/sliders/:id', sliderController.show);
router.post('/sliders', sliderController.store);
router.put('/sliders/:id', sliderController.update);
router.delete('/sliders/:id', sliderController.destroy);

router.get('/cards', cardController.index);
router.get('/cards/:id', cardController.show);
router.post('/cards', cardController.store);
router.put('/cards/:id', cardController.update);
router.delete('/cards/:id', cardController.destroy);

router.get('/tables', tableController.index);
router.get('/tables/:id', tableController.show);
router.post('/tables', tableController.store);
router.put('/tables/:id', tableController.update);
router.delete('/tables/:id', tableController.destroy);

router.get('/product-types', productTypeController.index);
router.get('/product-types/:id', productTypeController.show);
router.post('/product-types', productTypeController.store);
router.put('/product-types/:id', productTypeController.update);
router.delete('/product-types/:id', productTypeController.destroy);

router.get('/products', productController.index);
router.get('/products/:id', productController.show);
router.post('/products', productController.store);
router.put('/products/:id', productController.update);
router.delete('/products/:id', productController.destroy);

router.get('/forms', formController.index);

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

router.get('/formdata', formDataController.index);
router.get('/formdata/:id', formDataController.show);
router.put('/formdata/:id', formDataController.update);

router.get('/form_builder', formBuilderController.index);
router.get('/form_builder/:id', formBuilderController.show);
router.post('/form_builder', formBuilderController.store);
router.put('/form_builder/:id', formBuilderController.update);
router.delete('/form_builder/:id', formBuilderController.destroy);

router.get('/pages', pagesController.index);
router.get('/pages/:id', pagesController.show);
router.post('/pages', pagesController.store);
router.put('/pages/:id', pagesController.update);
router.delete('/pages/:id', pagesController.destroy);

router.get('/form-submission', formSubmissionController.index);
router.put('/form-submission/:id', formSubmissionController.update);
router.delete('/form-submission/:id', formSubmissionController.destroy);

router.post('/diy-cms', generatedModelController.generate);
router.get('/generated-models', generatedModelController.getGeneratedModels);
router.put('/generated-models/:id', generatedModelController.updateGeneratedModel);
router.delete('/generated-models/:id', generatedModelController.deleteGeneratedModel);

router.get('/trash', trashController.index);
router.post('/trash/:type/:id/restore', trashController.restore);
router.delete('/trash/:type/:id', trashController.destroy);

router.get('/dynamic', dynamicController.index);
router.get('/dynamic/:id', dynamicController.show);
router.post('/dynamic', dynamicController.store);
router.put('/dynamic/:id', dynamicController.update);
router.delete('/dynamic/:id', dynamicController.destroy);

export default router;
