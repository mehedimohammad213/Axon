const createCrud = require('./crudFactory');
const sliderController = require('./sliderController');
const navbarController = require('./navbarController');

const formBuilderController = createCrud('form_builder', {
  jsonFields: ['attributes', 'elements', 'additional'],
});

module.exports = {
  navbarController,
  sliderController,
  formBuilderController,
};
