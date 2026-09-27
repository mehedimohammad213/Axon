import createResourceController from './resourceControllerFactory';
import FooterService from '../services/footer.service';

export default createResourceController(FooterService, 'Footer');
