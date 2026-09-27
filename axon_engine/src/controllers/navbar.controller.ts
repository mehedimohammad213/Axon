import createResourceController from './resourceControllerFactory';
import NavbarService from '../services/navbar.service';

export default createResourceController(NavbarService, 'Navbar');
