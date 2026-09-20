import createResourceController from './resourceControllerFactory';
import FooterService from '../services/FooterService';

export default createResourceController(FooterService, 'Footer');
