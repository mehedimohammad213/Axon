const createCrud = require('./crudFactory');
const createResourceController = require('./resourceControllerFactory');
const sliderController = require('./sliderController');
const navbarController = require('./navbarController');
const MenuService = require('../services/MenuService');

const menuController = createResourceController(MenuService, 'Menu');

const formBuilderController = createCrud('form_builder', {
  jsonFields: ['attributes', 'elements', 'additional'],
  active: true,
});

module.exports = {
  navbarController,
  menuController,
  sliderController,
  formBuilderController,
};
