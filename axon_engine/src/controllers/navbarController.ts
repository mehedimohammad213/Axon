import createResourceController from './resourceControllerFactory';
import NavbarService from '../services/NavbarService';

export default createResourceController(NavbarService, 'Navbar');
