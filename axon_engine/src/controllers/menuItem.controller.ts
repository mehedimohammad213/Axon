import createResourceController from './resourceControllerFactory';
import MenuItemService from '../services/menuItem.service';

export default createResourceController(MenuItemService, 'Menu item');
