import createResourceController from './resourceControllerFactory';
import MenuItemService from '../services/MenuItemService';

export default createResourceController(MenuItemService, 'Menu item');
