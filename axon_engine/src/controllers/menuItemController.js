const createResourceController = require('./resourceControllerFactory');
const MenuItemService = require('../services/MenuItemService');

module.exports = createResourceController(MenuItemService, 'Menu item');
