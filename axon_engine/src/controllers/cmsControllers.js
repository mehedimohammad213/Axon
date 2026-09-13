const createCrud = require('./crudFactory');
const sliderController = require('./sliderController');

const navbarController = createCrud('navbars', {
  requiredOnCreate: ['title_en', 'logo_id', 'menu_id'],
});

const menuController = createCrud('menus', {
  jsonFields: ['menu_item_ids'],
  requiredOnCreate: ['name', 'menu_item_ids'],
});

const formBuilderController = createCrud('form_builder', {
  jsonFields: ['attributes', 'elements', 'additional'],
});

module.exports = {
  navbarController,
  menuController,
  sliderController,
  formBuilderController,
};
