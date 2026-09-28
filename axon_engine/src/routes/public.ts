import express from 'express';
import identifyPublicSite from '../middleware/publicSite';
import * as pageController from '../controllers/page.controller';
import navbarController from '../controllers/navbar.controller';
import sliderController from '../controllers/slider.controller';
import formBuilderController from '../controllers/formBuilder.controller';
import menuItemController from '../controllers/menuItem.controller';
import footerController from '../controllers/footer.controller';
import cardController from '../controllers/card.controller';
import tableController from '../controllers/table.controller';
import productTypeController from '../controllers/productType.controller';
import productController from '../controllers/product.controller';
import mediaController from '../controllers/media.controller';
import * as generatedModelController from '../controllers/generatedModel.controller';
import * as dynamicController from '../controllers/dynamic.controller';
import * as formSubmissionController from '../controllers/formSubmission.controller';
import { validateCreateFormSubmission } from '../validators/formSubmission.validator';

const router = express.Router();

const siteRouter = express.Router();
siteRouter.use(identifyPublicSite);

siteRouter.get('/pages', pageController.publicIndex);
siteRouter.get('/pages/:slug', pageController.publicShow);

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

// Public websites submit with X-Headless-Site-Key. CMS preview/editor
// submissions use JWT and must fall through to the protected router.
router.post(
  '/form-submission',
  (req, res, next) => {
    if (req.headers['x-headless-site-key']) {
      return identifyPublicSite(req, res, next);
    }
    return next('router');
  },
  validateCreateFormSubmission,
  formSubmissionController.store
);

export default router;
