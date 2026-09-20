import createCrud from './crudFactory';
import sliderController from './sliderController';
import navbarController from './navbarController';

const formBuilderController = createCrud('form_builder', {
  jsonFields: ['attributes', 'elements', 'additional'],
});

export { navbarController, sliderController, formBuilderController };
